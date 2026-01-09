'use server';

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { z } from "zod";

const questionSchema = z.object({
    question: z.string().min(3).max(500),
});

// Initialize Gemini
// Note: In production, user should put their API key in .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "YOUR_API_KEY_HERE");

interface WeatherData {
    temp: number;
    description: string;
    humidity: number;
    windSpeed: number;
    location: string;
}

// Mock weather function (In real implementation, fetch from OpenWeatherMap)
async function getWeather(lat: string = "40.1", lon: string = "65.3"): Promise<WeatherData> {
    try {
        const apiKey = process.env.OPENWEATHER_API_KEY;
        if (!apiKey) {
            // Return dummy data if no key provided to prevent crash
            return {
                temp: 24,
                description: "Ochiq havo",
                humidity: 45,
                windSpeed: 5.2,
                location: "Navbahor tumani"
            };
        }

        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=uz`);
        if (!res.ok) throw new Error("Ob-havo ma'lumotlarini olib bo'lmadi");

        const data = await res.json();
        return {
            temp: Math.round(data.main.temp),
            description: data.weather[0].description,
            humidity: data.main.humidity,
            windSpeed: data.wind.speed,
            location: data.name
        };
    } catch (e) {
        console.error("Weather Fetch Error:", e);
        return {
            temp: 20,
            description: "Ma'lumot yo'q",
            humidity: 50,
            windSpeed: 0,
            location: "Navbahor"
        };
    }
}

export async function askAgronomist(rawInput: string) {
    try {
        // 0. Security & Validation
        const session = await getSession();
        if (!session) throw new Error("Avtorizatsiyadan o'ting");

        const { question } = questionSchema.parse({ question: rawInput });

        // 1. Get Contextual Data (Weather + Field Activities)
        const weather = await getWeather();

        // Fetch current brigadier's active works for better context
        const brigadier = await prisma.brigadier.findUnique({
            where: { userId: session.userId },
            include: {
                activities: {
                    where: { status: { in: ['IN_PROGRESS', 'PENDING'] } },
                    include: { workStage: true, contour: true },
                    take: 5
                }
            }
        });

        const activitiesContext = brigadier?.activities.map(a =>
            `- ${a.contour.number}-konturda ${a.workStage.name} (${a.status})`
        ).join('\n') || "Hozircha faol ishlar qayd etilmagan.";

        // 2. Construct Prompt
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            Rol: Siz O'zbekistonning Navoiy viloyati, Navbahor tumanidagi paxta va g'alla klasterining katta agronomi va maslahatchisisiz.
            
            Joriy sharoit:
            - Ob-havo: ${weather.temp}°C, ${weather.description}, namlik ${weather.humidity}%
            - Dala holati (Brigadirning joriy ishlari):
            ${activitiesContext}
            
            Foydalanuvchi (Brigadir) savoli: "${question}"
            
            Vazifa: 
            Agronom sifatida qisqa, londa va aniq maslahat beryapsiz. Dala holati va ob-havoni inobatga oling. 
            Javobni o'zbek tilida, samimiy va professional shaklda bering. 
            Xatolar bo'lsa (masalan yomg'irda dori sepishmoqchi bo'lsa), qat'iy ogohlantiring.
        `;

        // 3. Generate Answer
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // 4. Persist to Database (Background, don't block response too much)
        if (session?.userId) {
            try {
                // Find or Create an active chat for today
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                // @ts-ignore
                let chat = await prisma.aIChat.findFirst({
                    where: {
                        userId: session.userId,
                        createdAt: { gte: today }
                    }
                });

                if (!chat) {
                    // @ts-ignore
                    chat = await prisma.aIChat.create({
                        data: {
                            userId: session.userId,
                            title: `Suhbat - ${new Date().toLocaleDateString('uz-UZ')}`
                        }
                    });
                }

                // @ts-ignore
                await prisma.aIMessage.createMany({
                    data: [
                        { chatId: chat.id, role: 'user', content: question },
                        { chatId: chat.id, role: 'ai', content: text, weather: JSON.stringify(weather) }
                    ]
                });
            } catch (dbErr) {
                console.error("DB Save Error in AI:", dbErr);
            }
        }

        return {
            success: true,
            answer: text,
            weather: weather
        };
    } catch (error: any) {
        console.error("AI Error:", error);
        return {
            error: "Kechirasiz, hozircha aloqa sifatsiz. Iltimos, birozdan so'ng qayta urinib ko'ring yoki bosh agronomga qo'ng'iroq qiling."
        };
    }
}

export async function getInitialWeather() {
    return await getWeather();
}

export async function getAIChatHistory() {
    const session = await getSession();
    if (!session?.userId) return [];

    try {
        // @ts-ignore
        const chat = await prisma.aIChat.findFirst({
            where: { userId: session.userId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!chat) return [];

        return chat.messages.map((m: any) => ({
            role: m.role as 'user' | 'ai',
            text: m.content,
            weather: m.weather ? JSON.parse(m.weather) : null
        }));
    } catch (e) {
        return [];
    }
}
