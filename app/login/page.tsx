"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { loginUser } from "@/app/actions/auth";
import Link from "next/link";

export default function LoginPage() {
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg("");

        const res = await loginUser(identifier, password);
        if (res?.error) {
            setErrorMsg(res.error);
            setLoading(false);
        } else {
            router.push("/discover");
        }
    };

    return (
        <div className="relative flex flex-col items-center justify-center min-h-[100dvh] overflow-hidden bg-neutral-50 dark:bg-neutral-950 z-10">

            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 right-[-10%] w-96 h-96 bg-pink-500/20 rounded-full blur-[100px] pointer-events-none"
            />

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-sm px-6"
            >
                <div className="flex flex-col items-center text-center mb-8">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2, stiffness: 200, damping: 15 }}
                        className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-[0_0_40px_rgba(236,72,153,0.4)] mb-6"
                    >
                        <Heart className="w-8 h-8 text-neutral-900 dark:text-white fill-white" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl font-extrabold text-neutral-900 dark:text-white tracking-tight mb-2"
                    >
                        Тавтай морил
                    </motion.h1>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="bg-white dark:bg-neutral-900/50 backdrop-blur-3xl border border-black/10 dark:border-white/10 p-6 rounded-3xl shadow-2xl"
                >
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errorMsg && (
                            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-500 p-3 rounded-xl text-sm font-bold text-center">
                                {errorMsg}
                            </div>
                        )}
                        <input
                            type="text"
                            placeholder="Утас, Имэйл эсвэл Username"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            required
                            className="w-full h-14 bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-5 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-500/50 focus:border-pink-500/50 transition-all font-medium"
                        />
                        <input
                            type="password"
                            placeholder="Нууц үг"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full h-14 bg-neutral-50 dark:bg-neutral-950/50 border border-neutral-200 dark:border-neutral-800 rounded-2xl px-5 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all font-medium"
                        />

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 mt-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center gap-2 text-neutral-900 dark:text-white font-bold text-lg shadow-[0_10px_40px_-10px_rgba(236,72,153,0.5)] transition-all disabled:opacity-70 disabled:scale-100"
                        >
                            {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"}
                            <ArrowRight size={20} className="mt-0.5" />
                        </motion.button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link href="/signup" className="text-sm font-bold text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white transition-colors">
                            Бүртгэлгүй юу? Шинээр бүртгүүлэх
                        </Link>
                    </div>
                </motion.div>

            </motion.div>
        </div>
    );
}