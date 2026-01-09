'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { checkRole } from "@/lib/rbac";
import { getSession } from "@/lib/auth";

async function checkAdmin() {
    await checkRole(['ADMIN']);
}

export async function getUsers() {
    await checkAdmin();
    return await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            farmerProfile: true,
            brigadierProfile: true,
        }
    });
}

export async function createUser(data: any) {
    await checkAdmin();

    const { username, password, fullName, role } = data;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
        data: {
            username,
            password: hashedPassword,
            fullName,
            role: role as Role,
        },
    });

    revalidatePath("/admin");
    return { success: true, user };
}

export async function updateUser(id: string, data: any) {
    await checkAdmin();

    const { username, fullName, role, password } = data;

    const updateData: any = {
        username,
        fullName,
        role: role as Role,
    };

    if (password) {
        updateData.password = await bcrypt.hash(password, 10);
    }

    await prisma.user.update({
        where: { id },
        data: updateData,
    });

    revalidatePath("/admin");
    return { success: true };
}

export async function deleteUser(id: string) {
    await checkAdmin();

    // Check if user is not deleting themselves
    const session = await getSession();
    if (session?.userId === id) {
        throw new Error("O'zingizni o'chira olmaysiz!");
    }

    await prisma.user.delete({
        where: { id },
    });

    revalidatePath("/admin");
    return { success: true };
}
