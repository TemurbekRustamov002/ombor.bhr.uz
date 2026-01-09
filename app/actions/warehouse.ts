'use server';

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { z } from "zod";

const transactionItemSchema = z.object({
    productId: z.string().uuid(),
    amount: z.number().positive(),
    batchNumber: z.string().optional(),
});

const transactionSchema = z.object({
    type: z.enum(['IN', 'OUT']),
    items: z.array(transactionItemSchema).min(1),
    farmerId: z.string().uuid().optional(),
    brigadierId: z.string().uuid().optional(),
    newFarmerData: z.object({
        ni: z.string(),
        inn: z.string(),
        directorName: z.string(),
        passportSerial: z.string(),
        passportNumber: z.string(),
        pinfl: z.string(),
        address: z.string(),
        phone: z.string(),
    }).optional(),
    description: z.string().optional(),
    userId: z.string().uuid(),
});

export async function getProducts() {
    return await prisma.product.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function getWarehouseTransactions() {
    return await prisma.transaction.findMany({
        include: {
            product: true,
            farmer: true,
            brigadier: {
                include: { user: true }
            },
            createdBy: true,
            // @ts-ignore
            waybill: true,
        },
        orderBy: { date: 'desc' },
        take: 50
    });
}

export async function recordTransaction(rawPayload: any) {
    try {
        const data = transactionSchema.parse(rawPayload);
        const batchId = Math.random().toString(36).substring(2, 11).toUpperCase();

        // 1. Validate all products and stock
        for (const item of data.items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) return { error: `Mahsulot topilmadi: ${item.productId}` };

            if (data.type === 'OUT' && product.currentStock < item.amount) {
                return { error: `Omborda "${product.name}" mahsulotidan yetarli qoldiq yo'q` };
            }
        }

        let finalFarmerId = data.farmerId;
        let finalBrigadierId = data.brigadierId;

        // Create new farmer if data provided
        if (data.newFarmerData && !data.farmerId && !data.brigadierId) {
            const { inn, ni, directorName, passportSerial, passportNumber, pinfl, address, phone } = data.newFarmerData;

            const existingFarmer = await prisma.farmer.findUnique({ where: { inn } });
            if (existingFarmer) {
                finalFarmerId = existingFarmer.id;
            } else {
                // Create User and Farmer
                const hashedPassword = await bcrypt.hash("123456", 10);
                const newUser = await prisma.user.create({
                    data: {
                        username: inn, // Use INN as username
                        password: hashedPassword,
                        fullName: ni || directorName || inn,
                        role: Role.FARMER
                    }
                });

                const newFarmer = await prisma.farmer.create({
                    data: {
                        userId: newUser.id,
                        inn,
                        ni,
                        directorName,
                        passportSerial,
                        passportNumber,
                        pinfl,
                        address: address || "Navbahor",
                        phone,
                        landArea: 0,
                    }
                });
                finalFarmerId = newFarmer.id;
            }
        }

        // 2. Perform transactions in a single database transaction
        const results = await prisma.$transaction(async (tx) => {
            // A. Create Formal Waybill
            const lastWaybill = await (tx as any).waybill.findFirst({
                orderBy: { createdAt: 'desc' }
            });
            const lastNum = lastWaybill ? parseInt(lastWaybill.number.split('-').pop() || '0') : 0;
            const waybillNumber = `NX-${new Date().getFullYear()}-${(lastNum + 1).toString().padStart(4, '0')}`;

            let receiverName = "Ombor";
            let shipperName = "Klaster";

            if (data.type === 'OUT') {
                if (finalBrigadierId) {
                    const b = await tx.brigadier.findUnique({ where: { id: finalBrigadierId }, include: { user: true } });
                    receiverName = b?.user.fullName || "Brigadir";
                } else if (finalFarmerId) {
                    const f = await tx.farmer.findUnique({ where: { id: finalFarmerId } });
                    receiverName = f?.ni || "Fermer";
                }
            }

            const waybill = await (tx as any).waybill.create({
                data: {
                    number: waybillNumber,
                    type: data.type as any,
                    receiverName,
                    shipperName,
                }
            });

            const transactions = [];
            for (const item of data.items) {
                const product = await tx.product.findUnique({ where: { id: item.productId } });
                if (!product) throw new Error(`Mahsulot topilmadi: ${item.productId}`);

                let trType = data.type as any;
                if (data.type === 'OUT') {
                    if (finalBrigadierId) {
                        trType = 'TRANSFER';
                    } else {
                        trType = 'OUT';
                    }
                }

                const tr = await tx.transaction.create({
                    data: {
                        type: trType,
                        amount: item.amount,
                        productId: item.productId,
                        farmerId: finalFarmerId,
                        brigadierId: finalBrigadierId,
                        description: data.description,
                        createdById: data.userId,
                        batchId: batchId,
                        // @ts-ignore
                        waybillId: waybill.id,
                        batchNumber: item.batchNumber
                    }
                });

                // Update Main Warehouse Stock
                const newStock = data.type === 'IN'
                    ? product.currentStock + item.amount
                    : product.currentStock - item.amount;

                await tx.product.update({
                    where: { id: item.productId },
                    data: { currentStock: newStock }
                });

                // If transferring to Brigadier, also update BrigadierStock
                if (trType === 'TRANSFER' && finalBrigadierId) {
                    await (tx as any).brigadierStock.upsert({
                        where: {
                            brigadierId_productId: {
                                brigadierId: finalBrigadierId,
                                productId: item.productId
                            }
                        },
                        update: { amount: { increment: item.amount } },
                        create: {
                            brigadierId: finalBrigadierId,
                            productId: item.productId,
                            amount: item.amount
                        }
                    });
                }

                transactions.push(tr);
            }
            return { transactions, waybillId: waybill.id };
        });

        revalidatePath("/warehouse");
        revalidatePath("/");

        // Return the waybill ID for linking
        return { success: true, transactionId: results.transactions[0].id, waybillId: results.waybillId, batchId: batchId };
    } catch (error: any) {
        console.error(error);
        return { error: error.message || "Xatolik yuz berdi" };
    }
}

export async function getTransactionById(id: string) {
    if (!id) return null;
    const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
            product: true,
            farmer: {
                include: { user: true }
            },
            brigadier: {
                include: { user: true }
            },
            createdBy: true,
            // @ts-ignore
            waybill: true,
        }
    });

    if (transaction?.batchId) {
        const batchTransactions = await prisma.transaction.findMany({
            where: { batchId: transaction.batchId },
            include: {
                product: true,
                farmer: { include: { user: true } },
                brigadier: { include: { user: true } },
                createdBy: true
            }
        });
        // Attach all products to this transaction object for Waybill rendering
        return { ...transaction, batchItems: batchTransactions };
    }

    return transaction;
}

export async function createProduct(data: {
    name: string,
    category: string,
    unit: string,
    minStockAlert: number
}) {
    try {
        await prisma.product.create({
            data: {
                name: data.name,
                category: data.category,
                unit: data.unit as any,
                // pricePerUnit removed
                minStockAlert: data.minStockAlert,
                currentStock: 0
            }
        });
        revalidatePath("/warehouse");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Xatolik yuz berdi" };
    }
}
