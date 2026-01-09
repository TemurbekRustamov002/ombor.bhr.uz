'use server';

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getMonitoringStats() {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN' && session.role !== 'DIRECTOR')) {
            throw new Error("Ruxsat berilmagan");
        }

        // 1. Warehouse Stock & Peak Calculation
        const products = await prisma.product.findMany({
            include: {
                transactions: {
                    select: { amount: true, type: true }
                }
            }
        });

        const inventory = products.map(p => {
            // Find peak stock: start with current, but we need to estimate historical max
            // A simple way: currentStock is the result of all transactions.
            // We can approximate peak by looking at sum of IN transactions vs current.
            const totalIn = p.transactions
                .filter(t => t.type === 'IN')
                .reduce((sum, t) => sum + t.amount, 0);

            // Peak is at least the totalIn or currentStock
            const peakStock = Math.max(totalIn, p.currentStock, 1);

            return {
                id: p.id,
                name: p.name,
                currentStock: p.currentStock,
                unit: p.unit,
                category: p.category,
                minStockAlert: p.minStockAlert,
                peakStock: peakStock
            };
        });

        // 2. Cluster Land & Stages Progress
        const totalAreaAgg = await prisma.contour.aggregate({
            _sum: { area: true }
        });
        const totalClusterArea = totalAreaAgg._sum.area || 0;

        const stages = await prisma.workStage.findMany({
            include: {
                activities: {
                    where: { status: 'COMPLETED' },
                    include: { contour: true }
                }
            },
            orderBy: { order: 'asc' }
        });

        const stageProgress = stages.map(stage => {
            const completedArea = stage.activities.reduce((acc, act) => acc + (act.contour?.area || 0), 0);
            return {
                id: stage.id,
                name: stage.name,
                order: stage.order,
                completedArea: completedArea,
                percent: totalClusterArea > 0 ? (completedArea / totalClusterArea) * 100 : 0
            };
        });

        // 3. Real-time Warehouse Activities (Last 5)
        const recentWarehouseActions = await prisma.transaction.findMany({
            take: 5,
            orderBy: { date: 'desc' },
            include: {
                product: true,
                createdBy: true,
                farmer: true,
                brigadier: { include: { user: true } }
            }
        });

        // 4. Home Dashboard Aggregates (Fix for TypeError on home page)
        const farmerCount = await prisma.farmer.count();
        const totalStock = inventory.reduce((sum, item) => sum + item.currentStock, 0);
        const productCount = inventory.length;

        // Fetch last 10 activities for global dashboard
        const recentActivity = await prisma.transaction.findMany({
            take: 10,
            orderBy: { date: 'desc' },
            include: {
                product: true,
                farmer: true,
                brigadier: { include: { user: true } },
                contour: true
            }
        });

        // Dummy chart data for weekly activity (can be improved later)
        const chartData = [
            { name: 'Du', total: 40 },
            { name: 'Se', total: 30 },
            { name: 'Ch', total: 60 },
            { name: 'Pa', total: 45 },
            { name: 'Ju', total: 90 },
            { name: 'Sh', total: 55 },
            { name: 'Ya', total: 20 },
        ];

        return {
            inventory,
            totalClusterArea,
            stageProgress,
            recentWarehouseActions,
            // Home dashboard legacy stats
            farmerCount,
            totalStock,
            productCount,
            recentActivity,
            chartData,
            serverTime: new Date().toISOString()
        };
    } catch (error) {
        console.error("Monitoring stats error:", error);
        return null;
    }
}

export async function getMonitoringConfig() {
    const session = await getSession();
    if (!session || (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN')) {
        return [];
    }
    // @ts-ignore
    return await prisma.monitoringConfig.findMany({
        orderBy: { createdAt: 'asc' }
    });
}

export async function addMonitoringColumn(label: string) {
    try {
        const session = await getSession();
        if (!session || (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN')) {
            throw new Error("Ruxsat berilmagan");
        }
        const key = label.toLowerCase().replace(/\s+/g, '_');
        // @ts-ignore
        await prisma.monitoringConfig.create({
            data: { label, key }
        });
        revalidatePath("/monitoring");
        return { success: true };
    } catch (error: any) {
        return { error: error.message };
    }
}

export async function getFullWarehouseTransactions() {
    const session = await getSession();
    if (!session || (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN')) return [];

    return await prisma.transaction.findMany({
        include: {
            product: true,
            farmer: true,
            brigadier: { include: { user: true } },
            createdBy: true
        },
        orderBy: { date: 'desc' }
    });
}

export async function getFullFieldActivities() {
    const session = await getSession();
    if (!session || (session.role !== 'SUPERADMIN' && session.role !== 'ADMIN')) return [];

    return await prisma.fieldActivity.findMany({
        include: {
            workStage: true,
            contour: {
                include: {
                    brigadier: { include: { user: true } }
                }
            },
        },
        orderBy: { createdAt: 'desc' }
    });
}
