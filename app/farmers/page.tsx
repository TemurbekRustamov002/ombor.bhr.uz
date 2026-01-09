import { getFarmers } from "../actions/farmers";
import FarmersList from "./FarmersList";

export const metadata = {
    title: "Fermerlar | Navbahor Tekstil",
};

export default async function FarmersPage() {
    const farmers = await getFarmers();

    return <FarmersList initialFarmers={farmers} />;
}
