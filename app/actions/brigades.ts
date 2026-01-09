'use server';

import { prisma } from "@/lib/prisma";
import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createBrigadier(formData: FormData) {
    const fullName = formData.get("fullName") as string;
    const username = formData.get("username") as string;
    const password = formData.get("password") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    if (!fullName || !username || !password) {
        return { error: "Barcha majburiy maydonlarni to'ldiring" };
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser) return { error: "Ushbu foydalanuvchi nomi allaqachon mavjud" };

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                password: hashedPassword,
                fullName,
                role: Role.BRIGADIER,
            }
        });

        await prisma.brigadier.create({
            data: {
                userId: user.id,
                phone,
                address,
            }
        });

        revalidatePath("/brigades");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Xatolik yuz berdi" };
    }
}

export async function getBrigadiers() {
    return await prisma.brigadier.findMany({
        include: {
            user: true,
            contours: true,
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function getBrigadierById(id: string) {
    return await prisma.brigadier.findUnique({
        where: { id },
        include: {
            user: true,
            contours: true,
            transactions: {
                include: {
                    product: true,
                    contour: true
                },
                orderBy: { date: 'desc' }
            }
        }
    });
}

export async function createContour(formData: FormData) {
    const number = formData.get("number") as string;
    const name = formData.get("name") as string;
    const area = parseFloat(formData.get("area") as string);
    const brigadierId = formData.get("brigadierId") as string;

    if (!number || isNaN(area)) {
        return { error: "Kontur raqami va maydoni kiritilishi shart" };
    }

    try {
        await prisma.contour.create({
            data: {
                number,
                name,
                area,
                brigadierId: brigadierId || null,
            }
        });

        revalidatePath("/brigades");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Xatolik yuz berdi" };
    }
}

export async function getContours() {
    return await prisma.contour.findMany({
        include: {
            brigadier: {
                include: { user: true }
            }
        },
        orderBy: { number: 'asc' }
    });
}

export async function assignContour(contourId: string, brigadierId: string | null) {
    try {
        await prisma.contour.update({
            where: { id: contourId },
            data: { brigadierId }
        });
        revalidatePath("/brigades");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function createBrigadierTransaction(data: {
    type: "TRANSFER" | "CONSUMPTION" | "IN" | "OUT",
    amount: number,
    productId: string,
    brigadierId: string,
    contourId?: string,
    description?: string,
    createdById: string
}) {
    try {
        await prisma.$transaction(async (tx) => {
            // 1. Create transaction recording
            const transactionType = data.type === 'IN' ? 'TRANSFER' : (data.type === 'OUT' ? 'CONSUMPTION' : data.type);

            await tx.transaction.create({
                data: {
                    type: transactionType as any,
                    amount: data.amount,
                    productId: data.productId,
                    brigadierId: data.brigadierId,
                    contourId: data.contourId,
                    description: data.description,
                    createdById: data.createdById,
                }
            });

            const product = await tx.product.findUnique({ where: { id: data.productId } });
            if (!product) throw new Error("Mahsulot topilmadi");

            // Logic flow based on Senior Architecture:
            // TRANSFER: Warehouse (-) -> Brigadier (+)
            // CONSUMPTION: Brigadier (-) -> Field (0)

            if (transactionType === 'TRANSFER') {
                // Reduce from Main Warehouse
                if (product.currentStock < data.amount) throw new Error("Omborda yetarli mahsulot yo'q");
                await tx.product.update({
                    where: { id: data.productId },
                    data: { currentStock: { decrement: data.amount } }
                });

                // Increase Brigadier Personal Stock
                await (tx as any).brigadierStock.upsert({
                    where: {
                        brigadierId_productId: {
                            brigadierId: data.brigadierId,
                            productId: data.productId
                        }
                    },
                    update: { amount: { increment: data.amount } },
                    create: {
                        brigadierId: data.brigadierId,
                        productId: data.productId,
                        amount: data.amount
                    }
                });
            }
            else if (transactionType === 'CONSUMPTION') {
                // Check Brigadier's own stock
                const bStock = await (tx as any).brigadierStock.findUnique({
                    where: {
                        brigadierId_productId: {
                            brigadierId: data.brigadierId,
                            productId: data.productId
                        }
                    }
                });

                if (!bStock || bStock.amount < data.amount) {
                    throw new Error("Sizning zahirangizda yetarli mahsulot yo'q. Avval ombordan qabul qiling.");
                }

                await (tx as any).brigadierStock.update({
                    where: { id: bStock.id },
                    data: { amount: { decrement: data.amount } }
                });

                // Note: Main Warehouse is NOT affected during consumption, it was already reduced during Transfer.
            }
        });

        revalidatePath("/brigades");
        revalidatePath(`/brigades/${data.brigadierId}`);
        revalidatePath("/brigadier-dashboard");
        return { success: true };
    } catch (error: any) {
        console.error("Transaction Error:", error);
        return { error: error.message };
    }
}

export async function getMeBrigadier() {
    const session = await getSession();
    if (!session || session.role !== 'BRIGADIER') return null;

    return await prisma.brigadier.findUnique({
        where: { userId: session.userId },
        include: {
            user: true,
            contours: true,
            transactions: {
                include: {
                    product: true,
                    contour: true
                },
                orderBy: { date: 'desc' },
                take: 10
            }
        }
    });
}

export async function getProducts() {
    return await prisma.product.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function getBrigadierInventory(brigadierId: string) {
    const stocks = await (prisma as any).brigadierStock.findMany({
        where: { brigadierId },
        include: { product: true }
    });

    return stocks.map((s: any) => ({
        id: s.productId,
        name: s.product.name,
        unit: s.product.unit,
        category: s.product.category,
        currentStock: s.amount
    })).filter((item: any) => item.currentStock > 0);
}

// Work Stages & Activities
export async function getWorkStages() {
    return await prisma.workStage.findMany({
        orderBy: { order: 'asc' }
    });
}

export async function createWorkStage(name: string, order: number, description?: string) {
    try {
        await prisma.workStage.create({
            data: { name, order, description }
        });
        revalidatePath("/brigades");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function deleteWorkStage(id: string) {
    try {
        await prisma.workStage.delete({ where: { id } });
        revalidatePath("/brigades");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function resetFieldActivities() {
    try {
        await prisma.fieldActivity.deleteMany({});
        revalidatePath("/brigades");
        revalidatePath("/brigadier-dashboard");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function assignWorkPlanToContour(contourId: string, workStageIds: string[], brigadierId: string) {
    try {
        const data = workStageIds.map(wsId => ({
            contourId,
            workStageId: wsId,
            brigadierId,
            status: "PENDING" as any
        }));

        // Use a transaction to ensure all are created or none
        await prisma.$transaction(
            data.map(item =>
                (prisma.fieldActivity as any).upsert({
                    where: {
                        contourId_workStageId: {
                            contourId: item.contourId,
                            workStageId: item.workStageId
                        }
                    },
                    update: { brigadierId: item.brigadierId },
                    create: item
                })
            )
        );

        revalidatePath("/brigades");
        revalidatePath("/brigadier-dashboard");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getFieldActivities(brigadierId?: string) {
    return await prisma.fieldActivity.findMany({
        where: brigadierId ? { brigadierId } : {},
        include: {
            workStage: true,
            contour: {
                include: {
                    brigadier: { include: { user: true } }
                }
            },
        },
        orderBy: [
            { contour: { number: 'asc' } },
            { workStage: { order: 'asc' } }
        ]
    });
}

export async function updateFieldActivity(data: {
    contourId: string,
    workStageId: string,
    brigadierId: string,
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED",
    comment?: string
}) {
    try {
        await (prisma.fieldActivity as any).upsert({
            where: {
                contourId_workStageId: {
                    contourId: data.contourId,
                    workStageId: data.workStageId
                }
            },
            update: {
                status: data.status,
                comment: data.comment,
                completionDate: data.status === "COMPLETED" ? new Date() : null,
            },
            create: {
                contourId: data.contourId,
                workStageId: data.workStageId,
                brigadierId: data.brigadierId,
                status: data.status,
                comment: data.comment,
                completionDate: data.status === "COMPLETED" ? new Date() : null,
            }
        });

        revalidatePath("/brigadier-dashboard");
        revalidatePath("/brigades");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

