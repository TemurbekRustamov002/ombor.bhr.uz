'use server';

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

async function checkSuperAdmin() {
    const session = await getSession();
    if (!session || session.role !== 'SUPER_ADMIN') {
        throw new Error("Ruxsat berilmagan! Faqat Super Admin uchun.");
    }
}

export async function getDatabaseStats() {
    await checkSuperAdmin();

    try {
        const stats = await Promise.all([
            { name: 'User', count: await prisma.user.count() },
            { name: 'Farmer', count: await prisma.farmer.count() },
            { name: 'Product', count: await prisma.product.count() },
            { name: 'Transaction', count: await prisma.transaction.count() },
            { name: 'Waybill', count: await prisma.waybill.count() },
            { name: 'Brigadier', count: await prisma.brigadier.count() },
            { name: 'Contour', count: await prisma.contour.count() },
            { name: 'Contract', count: await prisma.contract.count() },
            { name: 'WorkStage', count: await prisma.workStage.count() },
            { name: 'FieldActivity', count: await prisma.fieldActivity.count() },
            { name: 'AIChat', count: await prisma.aIChat.count() },
            { name: 'AIMessage', count: await prisma.aIMessage.count() },
            // Notification table check requires handling if it doesn't exist yet in client but exists in schema
            { name: 'Notification', count: (prisma as any).notification ? await (prisma as any).notification.count() : 0 },
        ]);

        return stats.sort((a, b) => b.count - a.count);
    } catch (error) {
        console.error("DB Stats Error:", error);
        return [];
    }
}

export async function clearTableData(tableName: string) {
    await checkSuperAdmin();

    try {
        switch (tableName.toLowerCase()) {
            case 'transaction': await prisma.transaction.deleteMany(); break;
            case 'waybill': await prisma.waybill.deleteMany(); break;
            case 'fieldactivity': await prisma.fieldActivity.deleteMany(); break;
            case 'aichat':
                await prisma.aIMessage.deleteMany();
                await prisma.aIChat.deleteMany();
                break;
            case 'aimessage': await prisma.aIMessage.deleteMany(); break;
            case 'notification':
                if ((prisma as any).notification) await (prisma as any).notification.deleteMany();
                break;
            default: throw new Error("Ushbu jadvalni tozalash taqiqlangan yoki jadval topilmadi.");
        }

        revalidatePath("/admin/database");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function downloadDatabaseBackup() {
    await checkSuperAdmin();

    try {
        const data = {
            users: await prisma.user.findMany(),
            farmers: await prisma.farmer.findMany(),
            products: await prisma.product.findMany(),
            transactions: await prisma.transaction.findMany(),
            waybills: await prisma.waybill.findMany(),
            brigadiers: await prisma.brigadier.findMany(),
            timestamp: new Date().toISOString()
        };

        return { success: true, data: JSON.stringify(data, null, 2) };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getTableData(tableName: string) {
    await checkSuperAdmin();

    try {
        switch (tableName.toLowerCase()) {
            case 'user': return await prisma.user.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { farmerProfile: true, brigadierProfile: true } });
            case 'farmer': return await prisma.farmer.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { user: true } });
            case 'product': return await prisma.product.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
            case 'transaction': return await prisma.transaction.findMany({ take: 100, orderBy: { date: 'desc' }, include: { product: true, farmer: true, brigadier: { include: { user: true } } } });
            case 'waybill': return await prisma.waybill.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
            case 'brigadier': return await prisma.brigadier.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { user: true } });
            case 'contour': return await prisma.contour.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
            case 'contract': return await prisma.contract.findMany({ take: 100, orderBy: { year: 'desc' }, include: { farmer: true } });
            case 'workstage': return await prisma.workStage.findMany({ take: 100, orderBy: { order: 'asc' } });
            case 'fieldactivity': return await prisma.fieldActivity.findMany({ take: 100, orderBy: { createdAt: 'desc' }, include: { workStage: true, contour: true, brigadier: { include: { user: true } } } });
            case 'aichat': return await prisma.aIChat.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
            case 'aimessage': return await prisma.aIMessage.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
            case 'notification':
                if ((prisma as any).notification) return await (prisma as any).notification.findMany({ take: 100, orderBy: { createdAt: 'desc' } });
                return [];
            default: throw new Error("Jadval topilmadi");
        }
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteRow(tableName: string, id: string) {
    await checkSuperAdmin();
    try {
        switch (tableName.toLowerCase()) {
            case 'transaction': await prisma.transaction.delete({ where: { id } }); break;
            case 'waybill': await prisma.waybill.delete({ where: { id } }); break;
            case 'fieldactivity': await prisma.fieldActivity.delete({ where: { id } }); break;
            case 'aichat': await prisma.aIChat.delete({ where: { id } }); break;
            case 'notification': if ((prisma as any).notification) await (prisma as any).notification.delete({ where: { id } }); break;
            case 'user': await prisma.user.delete({ where: { id } }); break; // Dangerous but requested
            case 'farmer': await prisma.farmer.delete({ where: { id } }); break;
            case 'product': await prisma.product.delete({ where: { id } }); break;
            default: throw new Error("Ushbu jadvaldan o'chirish taqiqlangan.");
        }
        revalidatePath("/admin/database");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}
