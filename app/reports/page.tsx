import { getFarmers } from "../actions/farmers";
import { getMonitoringConfig } from "../actions/monitoring";
import ReportsClient from "./ReportsClient";

export const metadata = {
    title: "Hisobotlar | Navbahor Tekstil",
};

export default async function ReportsPage() {
    const [farmers, config] = await Promise.all([
        getFarmers(),
        getMonitoringConfig(),
    ]);

    return (
        <ReportsClient
            farmers={farmers}
            config={config}
        />
    );
}
