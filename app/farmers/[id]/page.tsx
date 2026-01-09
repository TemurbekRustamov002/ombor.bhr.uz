import { getFarmerById } from "@/app/actions/farmers";
import FarmerDetailsClient from "./FarmerDetailsClient";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const farmer = await getFarmerById(id);
    if (!farmer) return { title: "Fermer topilmadi" };
    return { title: `${farmer.ni} | Navbahor Tekstil` };
}

export default async function FarmerPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const farmer = await getFarmerById(id);
    if (!farmer) notFound();

    return <FarmerDetailsClient farmer={farmer} />;
}
