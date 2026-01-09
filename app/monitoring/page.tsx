import { getMonitoringStats } from "../actions/monitoring";
import MonitoringClient from "./MonitoringClient";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
    title: "TV Monitoring | Navbahor Tekstil",
};

export default async function MonitoringPage() {
    const session = await getSession();
    const allowedRoles = ['SUPER_ADMIN', 'ADMIN', 'DIRECTOR', 'AGRONOMIST', 'MONITOR'];

    if (!session || !allowedRoles.includes(session.role)) {
        redirect("/");
    }

    const stats = await getMonitoringStats();

    return (
        <MonitoringClient
            stats={JSON.parse(JSON.stringify(stats))}
        />
    );
}
