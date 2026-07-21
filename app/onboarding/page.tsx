"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Sparkles } from "lucide-react";
import { checkSession } from "@/app/actions/session";
import { completeOnboarding } from "@/app/actions/onboarding";
import { useAlert } from "@/components/ui/AlertProvider";

const INTERESTS_LIST = [
    "Аялал ✈️", "Кофе ☕", "Фитнес 🏋️‍♂️", "Хөгжим 🎵", "Уран зураг 🎨",
    "Ном 📖", "Гэрэл зураг 📸", "Кино 🍿", "Бүжиг 💃", "Хоол 🍕",
    "Тоглоом 🎮", "Амьтад 🐶", "Спорт 🏀", "Загвар 👗", "Шөнөөр зугаалах 🌙"
];

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showAlert } = useAlert();

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "",
        interests: [] as string[],
        photos: [] as string[],
    });

    const toggleInterest = (interest: string) => {
        setFormData((prev) => {
            if (prev.interests.includes(interest)) {
                return { ...prev, interests: prev.interests.filter(i => i !== interest) };
            }
            if (prev.interests.length >= 5) return prev;
            return { ...prev, interests: [...prev.interests, interest] };
        });
    };

    const nextStep = async () => {
        if (step < 4) {
            setStep(step + 1);
        } else {
            setLoading(true);
            const session = await checkSession();
            
            if (session?.userId) {
                await completeOnboarding(session.userId, {
                    name: formData.name,
                    age: parseInt(formData.age) || 18,
                    gender: formData.gender,
                    interests: formData.interests,
                    photos: formData.photos
                });
            }

            router.push("/discover");
        }
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    return (
        <div className="relative flex flex-col min-h-[100dvh] bg-transparent text-white overflow-hidden z-10">

            <div className="absolute top-0 left-0 w-full h-1 bg-neutral-900/50 z-50">
                <motion.div
                    className="h-full bg-gradient-to-r from-pink-500 to-purple-500 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
                    initial={{ width: "25%" }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                />
            </div>

            {step > 1 && (
                <button onClick={prevStep} className="absolute top-6 left-6 z-50 p-3 bg-neutral-900/60 rounded-full border border-neutral-800/50 backdrop-blur-xl hover:bg-neutral-800 transition-colors">
                    <ArrowLeft size={22} />
                </button>
            )}

            <div className="flex-1 flex flex-col justify-center w-full max-w-2xl mx-auto px-8 relative mt-10">
                <AnimatePresence mode="wait">

                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Таны нэр хэн бэ?</h2>
                            <input
                                type="text"
                                placeholder="Саруул"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full h-16 bg-transparent border-b-2 border-neutral-800 text-3xl font-bold focus:border-pink-500 focus:outline-none transition-colors placeholder:text-neutral-700"
                                autoFocus
                            />
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-8">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">Нас болон хүйс?</h2>

                            <div className="space-y-3">
                                <input
                                    type="number"
                                    placeholder="Нас (Ж: 22)"
                                    value={formData.age}
                                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                                    className="w-full h-16 bg-neutral-900/60 backdrop-blur-md border border-neutral-800 rounded-2xl px-5 text-2xl font-bold focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                                />
                            </div>

                            <div className="flex gap-4">
                                {["Эрэгтэй", "Эмэгтэй"].map((gender) => (
                                    <button
                                        key={gender}
                                        onClick={() => setFormData({ ...formData, gender })}
                                        className={`flex-1 h-14 rounded-2xl font-bold border-2 transition-all ${formData.gender === gender ? "border-pink-500 bg-pink-500/20 text-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.2)]" : "border-neutral-800 bg-neutral-900/50 text-neutral-400 hover:bg-neutral-800"}`}
                                    >
                                        {gender}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
                            <div className="flex items-center gap-2 text-purple-400 mb-1">
                                <Sparkles size={20} />
                                <span className="font-bold uppercase tracking-wider text-sm">Юунд сонирхолтой вэ?</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">Миний сонирхол</h2>
                            <p className="text-neutral-400 text-sm font-medium">Хамгийн ихдээ 5 зүйл сонгох боломжтой.</p>

                            <div className="flex flex-wrap gap-3 mt-4">
                                {INTERESTS_LIST.map((interest) => {
                                    const isSelected = formData.interests.includes(interest);
                                    return (
                                        <motion.button
                                            whileTap={{ scale: 0.95 }}
                                            key={interest}
                                            onClick={() => toggleInterest(interest)}
                                            className={`px-5 py-3 rounded-full text-sm font-bold border-2 transition-all ${isSelected
                                                ? "border-pink-500 bg-gradient-to-r from-pink-600/20 to-purple-600/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                                                : "border-neutral-800 bg-neutral-900/50 text-neutral-300 hover:border-neutral-700"
                                                }`}
                                        >
                                            {interest}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {step === 4 && (
                        <motion.div key="step4" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight">Гоёмсог зургаа<br />оруулаарай</h2>

                            <label className="aspect-[3/4] w-full max-w-xs mx-auto bg-neutral-900/40 backdrop-blur-xl border-2 border-dashed border-neutral-700 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-pink-500 hover:bg-neutral-800/50 transition-all cursor-pointer group relative overflow-hidden">
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="image/*" 
                                    onChange={async (e) => {
                                        const file = e.target.files?.[0];
                                        if (!file) return;
                                        setLoading(true);
                                        const form = new FormData();
                                        form.append("file", file);
                                        try {
                                            const res = await fetch("/api/upload", { method: "POST", body: form });
                                            const data = await res.json();
                                            if (data.success) {
                                                setFormData(prev => ({ ...prev, photos: [data.url] }));
                                            } else {
                                                showAlert({ message: "Зураг хуулахад алдаа гарлаа.", type: "error" });
                                            }
                                        } catch {
                                            showAlert({ message: "Алдаа гарлаа.", type: "error" });
                                        } finally {
                                            setLoading(false);
                                        }
                                    }} 
                                />
                                {(formData.photos && formData.photos.length > 0) ? (
                                    <img src={formData.photos[0]} alt="Uploaded" className="w-full h-full object-cover" />
                                ) : (
                                    <>
                                        <div className="w-20 h-20 bg-neutral-800/80 rounded-full flex items-center justify-center group-hover:bg-pink-500/20 group-hover:text-pink-500 transition-colors">
                                            <Camera size={36} className="text-neutral-400 group-hover:text-pink-500 transition-colors" />
                                        </div>
                                        <span className="font-semibold text-neutral-400 group-hover:text-pink-400">Зураг сонгох</span>
                                    </>
                                )}
                            </label>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>

            <div className="p-8 pb-12">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={nextStep}
                    disabled={(step === 1 && formData.name.length < 2) || loading}
                    className="w-full h-16 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-[0_10px_40px_-10px_rgba(236,72,153,0.7)] disabled:opacity-50 disabled:grayscale transition-all"
                >
                    {loading ? "Хадгалж байна..." : (step === 4 ? "Бэлэн боллоо" : "Үргэлжлүүлэх")}
                </motion.button>
            </div>

        </div>
    );
}