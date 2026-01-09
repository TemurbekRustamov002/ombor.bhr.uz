import { getMonitoringStats } from "../actions/monitoring";
import MonitoringClient from "./MonitoringClient";

export const metadata = {
    title: "TV Monitoring | Navbahor Tekstil",
};

export default async function MonitoringPage() {
    const stats = await getMonitoringStats();

    return (
        <MonitoringClient
            stats={JSON.parse(JSON.stringify(stats))}
        />
    );
}
