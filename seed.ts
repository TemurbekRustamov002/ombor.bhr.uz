import { prisma } from "./lib/prisma";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const defaultUsers = [
        { username: "superadmin", fullName: "Bosh Boshqaruvchi", password: "superadmin123", role: "SUPER_ADMIN" },
        { username: "admin", fullName: "Administrator Navbahor", password: "admin123", role: "ADMIN" },
        { username: "direktor", fullName: "Cluster Direktori", password: "direktor123", role: "DIRECTOR" },
        { username: "omborchi", fullName: "Ombor Mudiri", password: "omborchi123", role: "WAREHOUSEMAN" },
        { username: "agronom", fullName: "Bosh Agronom", password: "agronom123", role: "AGRONOMIST" },
        { username: "monitor", fullName: "TV Monitor", password: "monitor123", role: "MONITOR" },
    ];

    for (const user of defaultUsers) {
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await prisma.user.upsert({
            where: { username: user.username },
            update: {
                password: hashedPassword,
                role: user.role as any,
                fullName: user.fullName
            },
            create: {
                username: user.username,
                password: hashedPassword,
                fullName: user.fullName,
                role: user.role as any,
            },
        });
        console.log(`User seeded: ${user.username} (${user.role})`);
    }

    // Seed some initial products
    const productData = [
        { name: "Ammiakli selitra", category: "O'g'it", unit: "TON", currentStock: 450 },
        { name: "Karbamid", category: "O'g'it", unit: "TON", currentStock: 280 },
        { name: "Dizel yoqilg'isi", category: "Yoqilg'i", unit: "LITER", currentStock: 15000 },
    ];

    for (const p of productData) {
        await prisma.product.upsert({
            where: { name: p.name },
            update: { currentStock: p.currentStock },
            create: {
                name: p.name,
                category: p.category,
                // @ts-ignore
                unit: p.unit,
                currentStock: p.currentStock,
            },
        });
    }

    console.log("Products seeded.");

    const workStages = [
        { name: "Shudgor", order: 1, description: "Yerni shudgorlash ishlari" },
        { name: "Surg'at", order: 2, description: "Surg'at qilish" },
        { name: "Chigit ekish", order: 3, description: "Chigit ekish mavsumi" },
        { name: "1-suv", order: 4, description: "Birinchi sug'orish" },
        { name: "1-o'g'itlash", order: 5, description: "Birinchi ozuqa berish" },
        { name: "2-suv", order: 6, description: "Ikkinchi sug'orish" },
        { name: "2-o'g'itlash", order: 7, description: "Ikkinchi ozuqa berish" },
        { name: "3-suv", order: 8, description: "Uchinchi sug'orish" },
        { name: "Defolyatsiya", order: 9, description: "Barglarni to'ktirish" },
        { name: "Terim", order: 10, description: "Paxta terimi" },
    ];

    for (const stage of workStages) {
        await prisma.workStage.upsert({
            where: { name: stage.name },
            update: { order: stage.order, description: stage.description },
            create: stage
        });
    }

    console.log("Work stages seeded.");
}


main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
