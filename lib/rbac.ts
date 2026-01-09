import { getSession } from "@/lib/auth";

export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'DIRECTOR' | 'WAREHOUSEMAN' | 'AGRONOMIST' | 'BRIGADIER' | 'FARMER' | 'MONITOR';

/**
 * Checks if the current user has one of the allowed roles.
 * Throws an error if not authorized.
 */
export async function checkRole(allowedRoles: Role[]): Promise<any> {
    const session = await getSession();

    if (!session) {
        throw new Error("Tizimga kirmagansiz! Iltimos, qaytadan kiring.");
    }

    const userRole = session.role as Role;

    // SUPER_ADMIN always has access to everything
    if (userRole === 'SUPER_ADMIN') {
        return session;
    }

    if (!allowedRoles.includes(userRole)) {
        // Detailed error for debugging (can be simplified in production)
        const errorMsg = `Ruxsat etilmagan! Sizning rol: ${userRole}. Talab qilinadigan rollar: ${allowedRoles.join(', ')}`;
        console.error(`RBAC Error: UserId: ${session.userId}, ${errorMsg}`);
        throw new Error("Ushbu amalni bajarish uchun ruxsatingiz yetarli emas!");
    }

    return session;
}

export function hasRole(session: any, allowedRoles: Role[]) {
    if (!session || !session.role) return false;
    if (session.role === 'SUPER_ADMIN') return true;
    return allowedRoles.includes(session.role);
}
