import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import DatabaseManagement from "./DatabaseClient";

export default async function AdminDatabasePage() {
    const session = await getSession();

    if (!session || session.role !== 'SUPER_ADMIN') {
        redirect("/");
    }

    return <DatabaseManagement />;
}
