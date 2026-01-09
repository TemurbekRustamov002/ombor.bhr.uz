import { getProducts, getWarehouseTransactions } from "../actions/warehouse";
import { getFarmers } from "../actions/farmers";
import { getBrigadiers } from "../actions/brigades";
import { getSession } from "@/lib/auth";
import WarehouseClient from "./WarehouseClient";

export const metadata = {
    title: "Omborxona | Navbahor Tekstil",
};

export default async function WarehousePage() {
    const products = await getProducts();
    const transactions = await getWarehouseTransactions();
    const farmers = await getFarmers();
    const brigadiers = await getBrigadiers();
    const session = await getSession();

    return (
        <WarehouseClient
            products={products}
            transactions={transactions}
            farmers={farmers}
            brigadiers={brigadiers}
            userId={session?.userId}
        />
    );
}
