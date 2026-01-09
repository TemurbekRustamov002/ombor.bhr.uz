'use server';

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
    const session = await getSession();
    if (!session?.userId) return [];

    // Safety check for schema update pending
    if (!(prisma as any).notification) return [];

    try {
        return await (prisma as any).notification.findMany({
            where: { userId: session.userId },
            orderBy: { createdAt: 'desc' },
            take: 20
        });
    } catch (e) {
        console.error("Notifications fetch error:", e);
        return [];
    }
}

export async function markAsRead(id: string) {
    const session = await getSession();
    if (!session?.userId) return { error: "Avtorizatsiyadan o'ting" };

    if (!(prisma as any).notification) return { success: true }; // Silently fail if not ready

    await (prisma as any).notification.update({
        where: { id, userId: session.userId },
        data: { isRead: true }
    });

    revalidatePath("/");
    return { success: true };
}

export async function markAllAsRead() {
    const session = await getSession();
    if (!session?.userId) return { error: "Avtorizatsiyadan o'ting" };

    if (!(prisma as any).notification) return { success: true };

    await (prisma as any).notification.updateMany({
        where: { userId: session.userId, isRead: false },
        data: { isRead: true }
    });

    revalidatePath("/");
    return { success: true };
}

export async function createNotification(userId: string, title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO', link?: string) {
    if (!(prisma as any).notification) return;

    return await (prisma as any).notification.create({
        data: { userId, title, message, type, link }
    });
}

export async function notifyAdmins(title: string, message: string, type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR' = 'INFO', link?: string) {
    try {
        if (!(prisma as any).notification) return;

        const admins = await prisma.user.findMany({
            where: { role: { in: ['ADMIN', 'SUPER_ADMIN'] } }
        });

        const notifications = admins.map(admin => ({
            userId: admin.id,
            title,
            message,
            type,
            link
        }));

        await (prisma as any).notification.createMany({
            data: notifications
        });
    } catch (e) {
        console.error("Notify admins error:", e);
    }
}
