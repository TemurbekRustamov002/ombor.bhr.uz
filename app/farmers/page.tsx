import { getFarmers } from "../actions/farmers";
import FarmersList from "./FarmersList";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "Fermerlar | Navbahor Tekstil",
};

export default async function FarmersPage() {
    const session = await getSession();
    // Roles allowed to view farmers
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'MONITOR'];

    if (!session || !allowedRoles.includes(session.role)) {
        redirect('/');
    }

    // Since we checked role above, getFarmers should succeed (assuming it has same or looser checks)
    // However, getFarmers also has a check.
    const farmers = await getFarmers();

    return <FarmersList initialFarmers={farmers} />;
}
