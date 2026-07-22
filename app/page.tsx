"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Heart, Map, MessageCircle, ArrowRight, Sparkles, EyeOff, MapPin, Camera, Star, Smile, Coffee } from "lucide-react";
import { checkSession } from "@/app/actions/session";
import { useLanguage } from "@/components/LanguageProvider";

export default function WelcomePage() {
  const [session, setSession] = useState<{ userId: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useLanguage();

  useEffect(() => {
    checkSession().then((payload) => {
      setSession(payload);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-start min-h-screen overflow-y-auto bg-neutral-50 dark:bg-neutral-950 text-neutral-900 dark:text-white pb-24">
      
      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center w-full min-h-[80vh] px-6 py-12 pt-24">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="relative flex items-center justify-center mb-8"
        >
          <div className="absolute inset-0 bg-pink-500 blur-[60px] opacity-40 rounded-full"></div>
          <Heart className="w-24 h-24 text-pink-500 fill-pink-500 relative z-10 drop-shadow-2xl" />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl font-extrabold text-neutral-900 dark:text-white tracking-tight text-center mb-4 leading-tight drop-shadow-lg"
        >
          Match.<br />Chat.<br />Rizz.
        </motion.h1>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex justify-center gap-8 mb-16 w-full"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center border border-pink-500/30 backdrop-blur-md">
            <Heart className="text-pink-400 w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Discover</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center border border-purple-500/30 backdrop-blur-md">
            <MessageCircle className="text-purple-400 w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Chat</span>
        </div>
        <div className="flex flex-col items-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 backdrop-blur-md">
            <Map className="text-emerald-400 w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Rizz</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9, type: "spring", stiffness: 120 }}
        className="w-full flex flex-col sm:flex-row items-center justify-center gap-4 relative z-20 h-[72px]"
      >
        {!loading && (
          session ? (
            <Link href="/discover" className="w-full sm:w-auto">
              <button className="w-full sm:w-auto px-10 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-lg font-bold text-white shadow-[0_10px_30px_rgba(236,72,153,0.4)] hover:scale-105 transition-all flex items-center justify-center gap-3">
                {t("welcome.continue")} <ArrowRight size={22} />
              </button>
            </Link>
          ) : (
            <>
              <Link href="/signup" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full text-lg font-bold text-white shadow-[0_10px_30px_rgba(236,72,153,0.4)] hover:scale-105 transition-all">
                  {t("welcome.signup")}
                </button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-8 py-4 bg-white dark:bg-neutral-900 border-2 border-neutral-200 dark:border-neutral-800 rounded-full text-lg font-bold text-neutral-900 dark:text-white hover:border-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800 transition-all">
                  {t("welcome.login")}
                </button>
              </Link>
            </>
          )
        )}
      </motion.div>
      </div>

      {/* Features Section (Bento Grid) */}
      <div className="w-full max-w-5xl px-6 py-12 flex flex-col gap-6 mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1: Blind Date */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-pink-500/20 p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <EyeOff size={120} className="text-pink-500" />
            </div>
            <div className="relative z-10 w-14 h-14 bg-pink-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-pink-500/30">
              <EyeOff size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3 relative z-10">🙈 Сохор болзоо (Blind Date)</h3>
            <p className="text-neutral-600 dark:text-neutral-300 relative z-10 font-medium leading-relaxed max-w-md">
              Гадаад төрх бус, дотоод ертөнцийг нь түрүүлж тань. Зураг бүдэгхэн эхэлж, та хоёр чатлах тусам бага багаар тодорсоор 100% харагдах болно.
            </p>
          </motion.div>

          {/* Feature 2: Map */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="col-span-1 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="relative z-10 w-14 h-14 bg-emerald-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/30">
              <MapPin size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 relative z-10">📍 Газрын зураг</h3>
            <p className="text-neutral-600 dark:text-neutral-300 relative z-10 font-medium leading-relaxed">
              Таны эргэн тойронд, нэг клубд эсвэл нэг кафед яг одоо хэн байгааг газрын зураг дээрээс шууд хараад танилцаарай.
            </p>
          </motion.div>

          {/* Feature 3: Zodiac */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="col-span-1 bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="relative z-10 w-14 h-14 bg-indigo-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/30">
              <Star size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 relative z-10">✨ Ордны зохицол</h3>
            <p className="text-neutral-600 dark:text-neutral-300 relative z-10 font-medium leading-relaxed">
              Хилэнц, Мэлхий хоёр хэр сайн тохирох бол? AI та хоёрын ордны зохицлыг %-иар шууд тооцоолж харуулна.
            </p>
          </motion.div>

          {/* Feature 4: Wingman */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="col-span-1 bg-gradient-to-br from-orange-500/10 to-red-500/10 border border-orange-500/20 p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="relative z-10 w-14 h-14 bg-orange-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
              <Sparkles size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 relative z-10">🤖 AI Wingman</h3>
            <p className="text-neutral-600 dark:text-neutral-300 relative z-10 font-medium leading-relaxed">
              Чат эхлүүлэх үг олдохгүй байна уу? Манай AI Wingman танд хамгийн сонирхолтой сэдвүүдийг санал болгох болно.
            </p>
          </motion.div>

          {/* Feature 5: Photo Rater */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="col-span-1 bg-gradient-to-br from-rose-500/10 to-pink-500/10 border border-rose-500/20 p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="relative z-10 w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-rose-500/30">
              <Camera size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 relative z-10">📸 Зургийн зөвлөх</h3>
            <p className="text-neutral-600 dark:text-neutral-300 relative z-10 font-medium leading-relaxed">
              Энэ зургаараа хэр олон хүнтэй таарах бол? AI таны зургийг шүүгээд, илүү сайжруулах гоё зөвлөгөөнүүдийг өгнө.
            </p>
          </motion.div>

          {/* Feature 6: Emoji Rating */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="col-span-1 md:col-span-2 lg:col-span-2 bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border border-yellow-500/20 p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-8 opacity-20 group-hover:opacity-40 transition-opacity">
              <Smile size={120} className="text-yellow-500" />
            </div>
            <div className="relative z-10 w-14 h-14 bg-yellow-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/30">
              <Smile size={28} />
            </div>
            <h3 className="text-2xl font-bold mb-3 relative z-10">🤩 Emoji Үнэлгээ</h3>
            <p className="text-neutral-600 dark:text-neutral-300 relative z-10 font-medium leading-relaxed max-w-md">
              Таны харилцаж байгаа хүн яг одоо ямар сэтгэл хөдлөлтэй байгааг AI чатнаас нь шинжилж, танд зөвхөн Emoji-гоор дүрсэлж харуулна.
            </p>
          </motion.div>

          {/* Feature 7: Date Ideas */}
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="col-span-1 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 p-8 rounded-3xl relative overflow-hidden group"
          >
            <div className="relative z-10 w-14 h-14 bg-cyan-500 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/30">
              <Coffee size={28} />
            </div>
            <h3 className="text-xl font-bold mb-3 relative z-10">☕️ Болзооны санаа</h3>
            <p className="text-neutral-600 dark:text-neutral-300 relative z-10 font-medium leading-relaxed">
              Та хоёрын хобби болон одоогийн байршилд яг тохирох төгс болзооны санааг манай AI автоматаар санал болгоно.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
