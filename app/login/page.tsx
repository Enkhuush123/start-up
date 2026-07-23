"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, ArrowRight, User, Lock } from "lucide-react";
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
                        className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-pink-500/30"
                    >
                        <Heart className="w-8 h-8 text-white fill-white" />
                    </motion.div>
                    <h1 className="text-3xl font-black text-neutral-900 dark:text-white mb-2">Тавтай морил</h1>
                    <p className="text-neutral-500 font-medium">Нэвтрэх нэр болон нууц үгээ оруулна уу.</p>
                </div>

                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                    {errorMsg && (
                        <motion.div 
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 text-red-500 text-sm font-bold p-4 rounded-xl mb-6 flex items-center gap-2 border border-red-500/20"
                        >
                            <span className="shrink-0">⚠️</span> {errorMsg}
                        </motion.div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 ml-1">Нэвтрэх нэр (Username)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                                    <User size={18} />
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value.toLowerCase().trim())}
                                    className="w-full h-14 bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-pink-500 rounded-xl pl-12 pr-4 text-neutral-900 dark:text-white font-medium outline-none transition-all placeholder:text-neutral-400"
                                    placeholder="Жишээ: rizz_master_99"
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-neutral-700 dark:text-neutral-300 mb-2 ml-1">Нууц үг</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-14 bg-neutral-100 dark:bg-neutral-800 border border-transparent focus:border-pink-500 rounded-xl pl-12 pr-4 text-neutral-900 dark:text-white font-medium outline-none transition-all placeholder:text-neutral-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !identifier || !password}
                            className="w-full h-14 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-2 mt-4 hover:shadow-[0_5px_20px_rgba(236,72,153,0.4)] transition-all disabled:opacity-50 disabled:hover:shadow-none"
                        >
                            {loading ? "Түр хүлээнэ үү..." : "Нэвтрэх"} <ArrowRight size={20} />
                        </button>
                    </form>
                </div>

                <p className="text-center mt-8 text-neutral-500 font-medium">
                    Бүртгэлгүй юу?{" "}
                    <Link href="/signup" className="text-pink-500 hover:text-pink-600 font-bold underline decoration-2 underline-offset-4">
                        Бүртгүүлэх
                    </Link>
                </p>
            </motion.div>
        </div>
    );
}