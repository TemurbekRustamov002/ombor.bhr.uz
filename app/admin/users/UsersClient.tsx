'use client';

import { useState } from 'react';
import {
    UserPlus,
    Search,
    MoreVertical,
    Edit2,
    Trash2,
    Shield,
    User as UserIcon,
    X,
    Check,
    AlertCircle
} from 'lucide-react';
import { createUser, updateUser, deleteUser } from '@/app/actions/admin';
import { Role } from '@prisma/client';
import { toast } from 'react-hot-toast';

interface User {
    id: string;
    username: string;
    fullName: string;
    role: Role;
    createdAt: Date;
}

export default function UsersClient({ initialUsers }: { initialUsers: any[] }) {
    const [users, setUsers] = useState(initialUsers);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const filteredUsers = users.filter(user =>
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        try {
            if (editingUser) {
                await updateUser(editingUser.id, data);
                toast.success('Foydalanuvchi yangilandi');
            } else {
                await createUser(data);
                toast.success('Yangi foydalanuvchi yaratildi');
            }
            // In a real app, we'd want to refresh the list properly, 
            // but for now revalidatePath will handle it on next server render
            // or we can just window.location.reload() for simplicity in this demo
            window.location.reload();
            setIsModalOpen(false);
            setEditingUser(null);
        } catch (error: any) {
            toast.error(error.message || 'Xatolik yuz berdi');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Haqiqatdan ham ushbu foydalanuvchini o\'chirmoqchimisiz?')) return;

        try {
            await deleteUser(id);
            toast.success('Foydalanuvchi o\'chirildi');
            window.location.reload();
        } catch (error: any) {
            toast.error(error.message || 'Xatolik yuz berdi');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/50 backdrop-blur-md p-4 rounded-3xl border border-white/40 shadow-sm">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Qidirish (ism yoki login)..."
                        className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border-none ring-1 ring-black/5 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button
                    onClick={() => {
                        setEditingUser(null);
                        setIsModalOpen(true);
                    }}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold text-sm shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    <UserPlus className="w-4 h-4" />
                    Yangi foydalanuvchi
                </button>
            </div>

            <div className="glass-card overflow-hidden border-none ring-1 ring-black/5">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Foydalanuvchi</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Rol</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Status</th>
                                <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none text-right">Amallar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-white shadow-sm ring-1 ring-black/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <UserIcon className="w-5 h-5 text-primary" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-800">{user.fullName}</p>
                                                <p className="text-xs text-gray-400 font-medium">@{user.username}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg ${user.role === 'SUPER_ADMIN' ? 'bg-red-100 text-red-600' :
                                                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' :
                                                        user.role === 'DIRECTOR' ? 'bg-blue-100 text-blue-600' :
                                                            user.role === 'WAREHOUSEMAN' ? 'bg-orange-100 text-orange-600' :
                                                                user.role === 'AGRONOMIST' ? 'bg-green-100 text-green-600' :
                                                                    user.role === 'MONITOR' ? 'bg-cyan-100 text-cyan-600' :
                                                                        'bg-gray-100 text-gray-600'
                                                }`}>
                                                <Shield className="w-3.5 h-3.5" />
                                            </div>
                                            <span className="text-xs font-bold text-gray-700">{user.role}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-5">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-green-50 text-green-600 text-[10px] font-black tracking-tighter uppercase ring-1 ring-green-500/10">
                                            <Check className="w-3 h-3" /> Faol
                                        </span>
                                    </td>
                                    <td className="px-6 py-5 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => {
                                                    setEditingUser(user);
                                                    setIsModalOpen(true);
                                                }}
                                                className="p-2 hover:bg-white rounded-xl text-gray-400 hover:text-primary transition-all shadow-sm ring-1 ring-black/5"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 hover:bg-red-50 rounded-xl text-gray-400 hover:text-red-500 transition-all shadow-sm ring-1 ring-black/5"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative w-full max-w-lg bg-white rounded-[2rem] shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-black text-gray-800 tracking-tight">
                                    {editingUser ? 'Tahrirlash' : 'Yangi foydalanuvchi'}
                                </h3>
                                <p className="text-gray-500 text-sm font-medium mt-1">Foydalanuvchi ma'lumotlarini kiriting</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">To'liq ism (F.I.SH)</label>
                                <input
                                    name="fullName"
                                    required
                                    defaultValue={editingUser?.fullName}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none ring-1 ring-black/5 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                                    placeholder="Masalan: Eshmatov Toshmat"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Login (Username)</label>
                                    <input
                                        name="username"
                                        required
                                        defaultValue={editingUser?.username}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none ring-1 ring-black/5 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium italic"
                                        placeholder="eshmatov_123"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Rol</label>
                                    <select
                                        name="role"
                                        required
                                        defaultValue={editingUser?.role || 'FARMER'}
                                        className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none ring-1 ring-black/5 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-gray-700 appearance-none cursor-pointer"
                                    >
                                        <option value="SUPER_ADMIN">SUPER ADMIN</option>
                                        <option value="ADMIN">ADMIN</option>
                                        <option value="DIRECTOR">DIRECTOR</option>
                                        <option value="WAREHOUSEMAN">OMBORCHI</option>
                                        <option value="AGRONOMIST">AGRONOM</option>
                                        <option value="BRIGADIER">BRIGADIR</option>
                                        <option value="FARMER">FERMER</option>
                                        <option value="MONITOR">MONITOR</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                                    {editingUser ? 'Yangi parol (ixtiyoriy)' : 'Parol'}
                                </label>
                                <input
                                    name="password"
                                    type="password"
                                    required={!editingUser}
                                    className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-none ring-1 ring-black/5 focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                                    placeholder="••••••••"
                                />
                                {editingUser && (
                                    <p className="text-[10px] text-gray-400 ml-1 italic flex items-center gap-1">
                                        <AlertCircle className="w-3 h-3" /> Parolni o'zgartirmoqchi bo'lsangizgina to'ldiring
                                    </p>
                                )}
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 px-6 py-4 rounded-2xl bg-gray-50 text-gray-600 font-bold hover:bg-gray-100 transition-all active:scale-95"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="flex-[2] px-6 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
                                >
                                    {isLoading ? 'Saqlanmoqda...' : (editingUser ? 'Yangilash' : 'Saqlash')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
