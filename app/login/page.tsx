'use client';

import { useState } from 'react';
import { login } from '@/app/actions/auth';
import { motion } from 'framer-motion';
import { Lock, User, Leaf } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError(null);

        const formData = new FormData(event.currentTarget);
        const result = await login(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            router.push('/');
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f0fdf4]">
            {/* Background elements moved to layout but for login we might want something unique */}
            <div className="absolute top-0 left-0 w-full h-full -z-10">
                <div className="absolute top-1/4 -left-20 w-80 h-80 bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md p-8 glass-card"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                        <Leaf className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">Navbahor Tekstil</h1>
                    <p className="text-gray-500 font-medium">Klaster boshqaruv tizimi</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Foydalanuvchi nomi</label>
                        <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                name="username"
                                type="text"
                                required
                                placeholder="admin yoki fermer_inn"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white/50"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Maxfiy parol</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                name="password"
                                type="password"
                                required
                                placeholder="••••••••"
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all bg-white/50"
                            />
                        </div>
                    </div>

                    {error && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm text-red-500 font-medium text-center bg-red-50 py-2 rounded-lg"
                        >
                            {error}
                        </motion.p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary text-white py-4 rounded-xl font-bold shadow-lg shadow-primary/30 hover:bg-green-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                    >
                        {loading ? 'Kirilmoqda...' : 'Tizimga kirish'}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-gray-400">
                    © 2025 Navbahor Tekstil Cluster. Barcha huquqlar himoyalangan.
                </p>
            </motion.div>
        </div>
    );
}
