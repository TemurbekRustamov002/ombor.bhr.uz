import { getMeBrigadier, getProducts, getWorkStages, getFieldActivities } from "../actions/brigades";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import BrigadierDashboard from "./BrigadierDashboard";

export const metadata = {
    title: "Brigadir Paneli | Navbahor Tekstil",
};

export default async function BrigadierDashboardPage() {
    const session = await getSession();
    if (!session || session.role !== 'BRIGADIER') {
        redirect("/login");
    }

    const brigadier = await getMeBrigadier();
    const products = await getProducts();
    const workStages = await getWorkStages();

    if (!brigadier) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800">Brigadir profili topilmadi</h2>
                    <p className="text-gray-500 mt-2">Iltimos, administratorga murojaat qiling.</p>
                </div>
            </div>
        );
    }

    const fieldActivities = await getFieldActivities(brigadier.id);
    const { getBrigadierInventory } = await import("../actions/brigades");
    const brigadierInventory = await getBrigadierInventory(brigadier.id);

    const serializedBrigadier = JSON.parse(JSON.stringify(brigadier));
    const serializedProducts = JSON.parse(JSON.stringify(products));
    const serializedWorkStages = JSON.parse(JSON.stringify(workStages));
    const serializedActivities = JSON.parse(JSON.stringify(fieldActivities));
    const serializedInventory = JSON.parse(JSON.stringify(brigadierInventory));

    return (
        <BrigadierDashboard
            brigadier={serializedBrigadier}
            products={serializedProducts}
            workStages={serializedWorkStages}
            activities={serializedActivities}
            inventory={serializedInventory}
            userId={session.userId}
        />
    );
}

