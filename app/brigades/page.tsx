import { getBrigadiers, getContours, getWorkStages, getFieldActivities } from "../actions/brigades";
// @ts-ignore
import BrigadesClient from "./BrigadesClient";

export const metadata = {
    title: "Brigadalar va Konturlar | Navbahor Tekstil",
};

export default async function BrigadesPage() {
    const [brigadiers, contours, workStages, activities] = await Promise.all([
        getBrigadiers(),
        getContours(),
        getWorkStages(),
        getFieldActivities()
    ]);

    // Plain objects for client component
    const serializedBrigadiers = JSON.parse(JSON.stringify(brigadiers));
    const serializedContours = JSON.parse(JSON.stringify(contours));
    const serializedWorkStages = JSON.parse(JSON.stringify(workStages));
    const serializedActivities = JSON.parse(JSON.stringify(activities));

    return (
        <BrigadesClient
            initialBrigadiers={serializedBrigadiers}
            initialContours={serializedContours}
            initialWorkStages={serializedWorkStages}
            initialActivities={serializedActivities}
        />
    );
}
