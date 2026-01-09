'use server';

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { checkRole } from "@/lib/rbac";
import { notifyAdmins } from "./notifications";

async function checkAdmin() {
    await checkRole(['ADMIN']);
}

export async function createFarmer(formData: FormData) {
    await checkAdmin();

    const name = formData.get("name") as string;
    const inn = formData.get("inn") as string;
    const landArea = parseFloat(formData.get("landArea") as string) || 0;
    const phone = formData.get("phone") as string;
    const contractNumber = formData.get("contractNumber") as string;

    const directorName = formData.get("directorName") as string;
    const passportSerial = formData.get("passportSerial") as string;
    const passportNumber = formData.get("passportNumber") as string;
    const pinfl = formData.get("pinfl") as string;
    const address = formData.get("address") as string;

    if (!name || !inn || !address) {
        return { error: "Barcha majburiy maydonlarni to'ldiring" };
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { username: inn } });
        if (existingUser) return { error: "Ushbu INN bilan foydalanuvchi allaqachon mavjud" };

        const hashedPassword = await bcrypt.hash(inn, 10);

        const user = await prisma.user.create({
            data: {
                username: inn,
                password: hashedPassword,
                fullName: name,
                role: "FARMER",
            }
        });

        await prisma.farmer.create({
            data: {
                userId: user.id,
                inn,
                ni: name,
                landArea,
                phone,
                contractNumber,
                directorName,
                passportSerial,
                passportNumber,
                pinfl,
                address
            }
        });

        await notifyAdmins(
            "Yangi fermer qo'shildi",
            `"${name}" fermer xo'jaligi tizimga muvaffaqiyatli kiritildi.`,
            "SUCCESS",
            "/farmers"
        );

        revalidatePath("/farmers");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Xatolik yuz berdi" };
    }
}

export async function getFarmers() {
    await checkRole(['ADMIN', 'DIRECTOR', 'MONITOR', 'WAREHOUSEMAN']);

    return await prisma.farmer.findMany({
        include: {
            user: true,
            contracts: {
                where: { year: 2025 }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateFarmerCredentials(farmerId: string, newPassword?: string) {
    await checkAdmin();

    const farmer = await prisma.farmer.findUnique({ where: { id: farmerId }, include: { user: true } });
    if (!farmer) return { error: "Fermer topilmadi" };

    if (newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: farmer.userId },
            data: { password: hashedPassword }
        });
    }

    revalidatePath("/farmers");
    return { success: true };
}

export async function updateFarmerCustomData(farmerId: string, key: string, value: any) {
    try {
        await checkAdmin();

        const farmer = await prisma.farmer.findUnique({ where: { id: farmerId } });
        if (!farmer) return { error: "Fermer topilmadi" };

        const currentData = (farmer.customData as any) || {};
        const newData = { ...currentData, [key]: value };

        await (prisma.farmer as any).update({
            where: { id: farmerId },
            data: { customData: newData }
        });

        revalidatePath("/monitoring");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getFarmerById(id: string) {
    await checkRole(['ADMIN', 'DIRECTOR', 'MONITOR', 'FARMER']);

    return await prisma.farmer.findUnique({
        where: { id },
        include: {
            user: true,
            contracts: {
                orderBy: { year: 'desc' }
            },
            transactions: {
                include: { product: true },
                orderBy: { date: 'desc' }
            }
        }
    });
}

export async function createOrUpdateContract(data: {
    farmerId: string,
    year: number,
    planAmount: number,
    status?: string
}) {
    await checkAdmin();
    try {
        await prisma.contract.upsert({
            where: {
                farmerId_year: {
                    farmerId: data.farmerId,
                    year: data.year
                }
            },
            update: {
                planAmount: data.planAmount,
                status: data.status || "ACTIVE"
            },
            create: {
                farmerId: data.farmerId,
                year: data.year,
                planAmount: data.planAmount,
                status: data.status || "ACTIVE"
            }
        });
        revalidatePath(`/farmers/${data.farmerId}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Shartnoma saqlashda xatolik" };
    }
}

export async function deleteFarmer(id: string) {
    try {
        await checkAdmin();

        const farmer = await prisma.farmer.findUnique({ where: { id }, include: { user: true } });
        if (!farmer) return { error: "Fermer topilmadi" };

        await prisma.$transaction([
            prisma.contract.deleteMany({ where: { farmerId: id } }),
            prisma.transaction.deleteMany({ where: { farmerId: id } }),
            prisma.farmer.delete({ where: { id } }),
            prisma.user.delete({ where: { id: farmer.userId } })
        ]);

        revalidatePath("/farmers");
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Fermerni o'chirishda xatolik" };
    }
}

export async function updateFarmer(id: string, data: {
    ni: string,
    inn: string,
    landArea: number,
    phone: string,
    contractNumber: string,
    directorName?: string,
    passportSerial?: string,
    passportNumber?: string,
    address?: string,
    pinfl?: string
}) {
    try {
        await checkAdmin();

        const farmer = await prisma.farmer.findUnique({ where: { id } });
        if (!farmer) return { error: "Fermer topilmadi" };

        await prisma.$transaction([
            prisma.farmer.update({
                where: { id },
                data: {
                    ni: data.ni,
                    inn: data.inn,
                    landArea: data.landArea,
                    phone: data.phone,
                    contractNumber: data.contractNumber,
                    directorName: data.directorName,
                    passportSerial: data.passportSerial,
                    passportNumber: data.passportNumber,
                    address: data.address,
                    pinfl: data.pinfl
                }
            }),
            prisma.user.update({
                where: { id: farmer.userId },
                data: {
                    fullName: data.ni,
                    username: data.inn,
                }
            })
        ]);

        revalidatePath("/farmers");
        revalidatePath(`/farmers/${id}`);
        return { success: true };
    } catch (error: any) {
        return { error: error.message || "Fermerni yangilashda xatolik" };
    }
}
