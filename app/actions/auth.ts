'use server';

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;

    if (!username || !password) {
        return { error: "Barcha maydonlarni to'ldiring" };
    }

    const user = await prisma.user.findUnique({
        where: { username },
        include: { farmerProfile: true }
    });

    if (!user) {
        return { error: "Foydalanuvchi topilmadi o'yin" };
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return { error: "Parol noto'g'ri" };
    }

    // Create session
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    const session = await encrypt({
        userId: user.id,
        role: user.role.trim() as any, // Trim to be safe against spaces
        fullName: user.fullName,
        farmerId: user.farmerProfile?.id,
        expires
    });

    // Set the cookie
    (await cookies()).set("session", session, { expires, httpOnly: true });

    return { success: true };
}

export async function logout() {
    (await cookies()).set("session", "", { expires: new Date(0) });
    redirect("/login");
}

export async function getCurrentUser() {
    const sessionValue = (await cookies()).get("session")?.value;
    if (!sessionValue) return null;

    try {
        // Decrypting session - importing from auth.ts
        const { decrypt } = await import("@/lib/auth");
        const payload = await decrypt(sessionValue);
        return payload;
    } catch (err) {
        return null;
    }
}
