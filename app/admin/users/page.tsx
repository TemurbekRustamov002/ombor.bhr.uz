import { getUsers } from "@/app/actions/admin";
import UsersClient from "@/app/admin/users/UsersClient";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminUsersPage() {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN')) {
        redirect("/");
    }

    const users = await getUsers();

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-black text-gray-800 tracking-tight">Foydalanuvchilar</h1>
                    <p className="text-gray-500 font-medium">Tizim foydalanuvchilarini boshqarish va rollarni biriktirish</p>
                </div>
            </div>

            <UsersClient initialUsers={users} />
        </div>
    );
}
