"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Save,
  Camera,
  User,
  Edit2,
  Copy,
  CheckCircle2,
  X,
  Plus,
  Star,
} from "lucide-react";
import imageCompression from "browser-image-compression";
import { checkSession, logoutUser } from "@/app/actions/session";
import {
  getUserProfile,
  updateUserProfile,
  deleteAccount,
} from "@/app/actions/profile";
import { useAlert } from "@/components/ui/AlertProvider";
import LoadingScreen from "@/components/LoadingScreen";

const INTERESTS_LIST = [
  "Аялал ✈️",
  "Кофе ☕",
  "Фитнес 🏋️‍♂️",
  "Хөгжим 🎵",
  "Уран зураг 🎨",
  "Ном 📖",
  "Гэрэл зураг 📸",
  "Кино 🍿",
  "Бүжиг 💃",
  "Хоол 🍕",
  "Тоглоом 🎮",
  "Амьтад 🐶",
  "Спорт 🏀",
  "Загвар 👗",
  "Шөнөөр зугаалах 🌙",
];

export default function ProfilePage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [photoRating, setPhotoRating] = useState<{
    score: number;
    feedback: string;
  } | null>(null);
  const [ratingPhotoUrl, setRatingPhotoUrl] = useState<string | null>(null);
  const [ratingLoading, setRatingLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: "",
    bio: "",
    age: "",
    gender: "",
    height: "",
    zodiacSign: "",
    loveLanguage: "",
    drinking: "",
    smoking: "",
    lookingFor: "",
    inviteCode: "",
    isBlindDateMode: false,
    interests: [] as string[],
    photos: [] as string[],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function loadProfile() {
      const session = await checkSession();
      if (!session?.userId) {
        router.push("/login");
        return;
      }

      setUserId(session.userId);
      const data = await getUserProfile(session.userId);
      if (data) {
        setProfile({
          name: data.name || "",
          bio: data.bio || "",
          age: data.age?.toString() || "",
          gender: data.gender || "",
          height: data.height?.toString() || "",
          zodiacSign: data.zodiacSign || "",
          loveLanguage: data.loveLanguage || "",
          drinking: data.drinking || "",
          smoking: data.smoking || "",
          lookingFor: data.lookingFor || "",
          inviteCode: data.inviteCode || "",
          isBlindDateMode: data.isBlindDateMode || false,
          interests: data.interests || [],
          photos: data.photos || [],
        });
      }
      setLoading(false);
    }
    loadProfile();
  }, [router]);

  const handleSave = async () => {
    if (!userId) return;
    setSaving(true);
    await updateUserProfile(userId, {
      name: profile.name,
      bio: profile.bio,
      age: parseInt(profile.age) || null,
      gender: profile.gender,
      height: parseInt(profile.height) || null,
      zodiacSign: profile.zodiacSign,
      loveLanguage: profile.loveLanguage,
      drinking: profile.drinking,
      smoking: profile.smoking,
      lookingFor: profile.lookingFor,
      isBlindDateMode: profile.isBlindDateMode,
      interests: profile.interests,
      photos: profile.photos,
    });
    setSaving(false);
    showAlert({ message: "Амжилттай хадгалагдлаа!", type: "success" });
  };

  const handleLogout = async () => {
    await logoutUser();
    window.location.href = "/login";
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    showAlert({
      title: "Анхааруулга",
      message:
        "Та бүртгэлээ устгахдаа итгэлтэй байна уу? Энэ үйлдэл буцаагдахгүй бөгөөд таны бүх мэдээлэл устах болно.",
      type: "confirm",
      confirmText: "Устгах",
      onConfirm: async () => {
        const res = await deleteAccount(userId);
        if (res.success) {
          await logoutUser();
          window.location.href = "/";
        } else {
          showAlert({
            message: "Бүртгэл устгахад алдаа гарлаа.",
            type: "error",
          });
        }
      },
    });
  };

  const copyInviteCode = () => {
    if (profile.inviteCode) {
      navigator.clipboard.writeText(profile.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRatePhoto = async (photoUrl: string) => {
    setRatingPhotoUrl(photoUrl);
    setRatingLoading(true);
    setPhotoRating(null);
    try {
      const res = await fetch("/api/ai/photo-rater", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: photoUrl }),
      });
      const data = await res.json();
      if (data.score) {
        setPhotoRating(data);
      } else {
        showAlert({
          message: data.error || "Үнэлгээ хийхэд алдаа гарлаа",
          type: "error",
        });
      }
    } catch (e) {
      showAlert({ message: "Алдаа гарлаа", type: "error" });
    }
    setRatingLoading(false);
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (profile.photos.length >= 10) {
      showAlert({
        message: "Хамгийн ихдээ 10 зураг оруулах боломжтой!",
        type: "info",
      });
      return;
    }

    try {
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 1200,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      const formData = new FormData();
      formData.append("file", compressedFile);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setProfile((prev) => ({
          ...prev,
          photos: [...prev.photos, data.url],
        }));
      } else {
        alert("Зураг хуулахад алдаа: " + (data.error || "Unknown"));
      }
    } catch (err) {
      console.error(err);
      alert(
        "Алдаа гарлаа: " + (err instanceof Error ? err.message : "Unknown"),
      );
    }
  };

  const removePhoto = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index),
    }));
  };

  const makePrimaryPhoto = (index: number) => {
    if (index === 0) return;
    setProfile((prev) => {
      const newPhotos = [...prev.photos];
      const temp = newPhotos[0];
      newPhotos[0] = newPhotos[index];
      newPhotos[index] = temp;
      return { ...prev, photos: newPhotos };
    });
  };

  const toggleInterest = (interest: string) => {
    setProfile((prev) => {
      if (prev.interests.includes(interest)) {
        return {
          ...prev,
          interests: prev.interests.filter((i) => i !== interest),
        };
      }
      if (prev.interests.length >= 5) return prev;
      return { ...prev, interests: [...prev.interests, interest] };
    });
  };

  if (loading) {
    return <LoadingScreen />;
  }

  const primaryPhoto = profile.photos.length > 0 ? profile.photos[0] : null;

  return (
    <div className="min-h-[100dvh] pt-28 pb-32 px-4 md:px-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-neutral-900 via-neutral-950 to-neutral-950 flex justify-center selection:bg-pink-500/30 text-neutral-900 dark:text-white">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        <div className="lg:col-span-4 flex flex-col items-center space-y-8">
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="relative group cursor-pointer w-56 h-56 rounded-[2.5rem] bg-white dark:bg-neutral-900/50 border-2 border-neutral-200 dark:border-neutral-800/80 overflow-hidden shadow-[0_0_40px_rgba(236,72,153,0.15)] hover:shadow-[0_0_60px_rgba(236,72,153,0.3)] hover:border-pink-500/50 transition-all duration-500"
            onClick={() => fileInputRef.current?.click()}
          >
            {primaryPhoto ? (
              <img
                src={primaryPhoto}
                alt="Avatar"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <User
                size={80}
                className="text-neutral-700 group-hover:text-pink-400 transition-colors absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl flex items-center justify-center text-neutral-900 dark:text-white shadow-xl opacity-90 group-hover:scale-110 group-hover:opacity-100 transition-all duration-300">
              <Camera size={26} />
            </div>
          </motion.div>

          <div className="w-full bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] p-6 sm:p-8 rounded-[2.5rem] text-center shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5" />
            <p className="text-neutral-500 dark:text-neutral-400 text-xs font-bold uppercase tracking-[0.3em] mb-4 relative z-10">
              Миний урилгын код
            </p>
            <div className="flex items-center justify-center gap-4 relative z-10 bg-black/20 py-4 px-6 rounded-2xl">
              <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500 tracking-[0.2em]">
                {profile.inviteCode || "------"}
              </span>
              <button
                onClick={copyInviteCode}
                className="text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:text-white hover:bg-black/10 dark:bg-white/10 transition-all p-2.5 rounded-xl bg-black/30"
              >
                {copied ? (
                  <CheckCircle2 size={22} className="text-emerald-400" />
                ) : (
                  <Copy size={22} />
                )}
              </button>
            </div>
            <p className="text-sm text-neutral-500 mt-5 leading-relaxed relative z-10 font-medium">
              Энэхүү кодыг найздаа өгч Fizz дээр бие биеэ хараарай.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogout}
              className="w-full py-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:bg-white/10 text-neutral-900 dark:text-white border border-black/10 dark:border-white/10 hover:border-black/20 dark:border-white/20 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300"
            >
              <LogOut size={22} /> Системээс гарах
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full py-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/50 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300"
            >
              Бүртгэл устгах
            </button>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8">
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] p-6 md:p-10 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-neutral-900 dark:text-white flex items-center gap-3">
                  <Camera className="text-pink-500" size={28} />
                  Таны Зургууд
                </h2>
                <p className="text-neutral-500 text-sm mt-2 font-medium">
                  Хамгийн ихдээ 10 зураг оруулах боломжтой (Эхний зураг үндсэн
                  зураг болно)
                </p>
              </div>
              <span className="px-4 py-1.5  bg-pink-500/10 text-pink-400 rounded-full font-bold text-sm border border-pink-500/20">
                {profile.photos.length} / 10
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <AnimatePresence>
                {profile.photos.map((photo, idx) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    key={`${photo}-${idx}`}
                    className="relative aspect-[3/4] bg-white dark:bg-neutral-900/50 rounded-2xl overflow-hidden group border border-white/5"
                  >
                    <img
                      src={photo}
                      alt="User photo"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />

                    <div className="absolute inset-0 bg-white/40 dark:bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {idx === 0 && (
                      <div className="absolute top-2 left-2 px-2 py-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white text-[10px] font-black rounded-lg uppercase tracking-wider shadow-lg">
                        Үндсэн
                      </div>
                    )}

                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-2 right-2 p-2 bg-rose-500/90 hover:bg-rose-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 shadow-lg"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>

                    {idx !== 0 && (
                      <button
                        onClick={() => makePrimaryPhoto(idx)}
                        className="absolute bottom-2 left-2 px-3 py-1.5 bg-black/50 hover:bg-black/70 text-white rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20 whitespace-nowrap shadow-lg"
                      >
                        Үндсэн
                      </button>
                    )}

                    <button
                      onClick={() => handleRatePhoto(photo)}
                      disabled={ratingLoading && ratingPhotoUrl === photo}
                      className="absolute bottom-2 right-2 px-2 py-1.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:scale-105 text-white rounded-xl text-xs font-bold opacity-0 group-hover:opacity-100 transition-all duration-300 border border-white/20 whitespace-nowrap shadow-lg flex items-center gap-1"
                    >
                      {ratingLoading && ratingPhotoUrl === photo
                        ? "Уншиж байна..."
                        : "✨ AI Үнэлгээ"}
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {profile.photos.length < 10 && (
                <label className="aspect-[3/4] bg-white/[0.02] border-2 border-dashed border-black/10 dark:border-white/10 hover:border-pink-500/50 hover:bg-pink-500/5 rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-300 group">
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    ref={fileInputRef}
                  />
                  <div className="w-12 h-12 rounded-full bg-black/5 dark:bg-white/5 group-hover:bg-pink-500/20 flex items-center justify-center mb-3 transition-colors">
                    <Plus
                      size={24}
                      className="text-neutral-500 group-hover:text-pink-400 transition-colors"
                    />
                  </div>
                  <span className="text-xs font-bold text-neutral-500 group-hover:text-pink-400 transition-colors uppercase tracking-wider">
                    Зураг нэмэх
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Profile Details Section */}
          <div className="bg-white/[0.02] backdrop-blur-3xl border border-white/[0.05] p-6 md:p-10 rounded-[2.5rem] shadow-2xl">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-black/10 dark:border-white/10">
              <Edit2 className="text-purple-400" size={28} />
              <h2 className="text-2xl md:text-3xl font-extrabold text-neutral-900 dark:text-white">
                Хувийн мэдээлэл
              </h2>
            </div>

            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 ml-1 uppercase tracking-wider">
                    Нэр
                  </label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                    className="w-full bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-neutral-900 dark:text-white font-bold text-lg focus:outline-none focus:border-purple-500 focus:bg-white/40 dark:bg-black/40 transition-all placeholder:text-neutral-700"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 ml-1 uppercase tracking-wider">
                    Нас
                  </label>
                  <input
                    type="number"
                    value={profile.age}
                    onChange={(e) =>
                      setProfile({ ...profile, age: e.target.value })
                    }
                    className="w-full bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-neutral-900 dark:text-white font-bold text-lg focus:outline-none focus:border-purple-500 focus:bg-white/40 dark:bg-black/40 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 ml-1 uppercase tracking-wider">
                    Өндөр (см)
                  </label>
                  <input
                    type="number"
                    value={profile.height}
                    onChange={(e) =>
                      setProfile({ ...profile, height: e.target.value })
                    }
                    className="w-full bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-neutral-900 dark:text-white font-bold text-lg focus:outline-none focus:border-purple-500 focus:bg-white/40 dark:bg-black/40 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 ml-1 uppercase tracking-wider">
                    Орд
                  </label>
                  <select
                    value={profile.zodiacSign}
                    onChange={(e) =>
                      setProfile({ ...profile, zodiacSign: e.target.value })
                    }
                    className="w-full bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-neutral-900 dark:text-white font-bold text-lg focus:outline-none focus:border-purple-500 focus:bg-white/40 dark:bg-black/40 transition-all appearance-none"
                  >
                    <option value="">Сонгох</option>
                    <option value="Хонь">Хонь ♈</option>
                    <option value="Үхэр">Үхэр ♉</option>
                    <option value="Ихэр">Ихэр ♊</option>
                    <option value="Мэлхий">Мэлхий ♋</option>
                    <option value="Арслан">Арслан ♌</option>
                    <option value="Охин">Охин ♍</option>
                    <option value="Жинлүүр">Жинлүүр ♎</option>
                    <option value="Хилэнц">Хилэнц ♏</option>
                    <option value="Нум">Нум ♐</option>
                    <option value="Матар">Матар ♑</option>
                    <option value="Хумх">Хумх ♒</option>
                    <option value="Загас">Загас ♓</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 ml-1 uppercase tracking-wider">
                    Хайрын хэл
                  </label>
                  <select
                    value={profile.loveLanguage}
                    onChange={(e) =>
                      setProfile({ ...profile, loveLanguage: e.target.value })
                    }
                    className="w-full bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-neutral-900 dark:text-white font-bold text-lg focus:outline-none focus:border-purple-500 focus:bg-white/40 dark:bg-black/40 transition-all appearance-none"
                  >
                    <option value="">Сонгох</option>
                    <option value="Сайхан үгс">Сайхан үгс 🗣️</option>
                    <option value="Хамт өнгөрүүлэх цаг">
                      Хамт өнгөрүүлэх цаг ⏳
                    </option>
                    <option value="Бэлэг">Бэлэг 🎁</option>
                    <option value="Тусламж дэмжлэг">Тусламж дэмжлэг 🤝</option>
                    <option value="Хүрэлцэхүй">Хүрэлцэхүй 🫂</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 ml-1 uppercase tracking-wider">
                    Юу хайж байгаа вэ?
                  </label>
                  <select
                    value={profile.lookingFor}
                    onChange={(e) =>
                      setProfile({ ...profile, lookingFor: e.target.value })
                    }
                    className="w-full bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-neutral-900 dark:text-white font-bold text-lg focus:outline-none focus:border-purple-500 focus:bg-white/40 dark:bg-black/40 transition-all appearance-none"
                  >
                    <option value="">Сонгох</option>
                    <option value="Үерхэл">Үерхэл ❤️</option>
                    <option value="Найз">Найз нөхөд 🤝</option>
                    <option value="Хөнгөн харилцаа">Хөнгөн харилцаа 🍷</option>
                    <option value="Гэрлэлт">Гэрлэлт 💍</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-4">
                <div>
                  <h4 className="text-neutral-900 dark:text-white font-bold text-lg">
                    Сохор болзоо горим 🙈
                  </h4>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-1">
                    Чат эхлэх үед зурагнууд бүдэг харагдана.
                  </p>
                </div>
                <button
                  onClick={() =>
                    setProfile({
                      ...profile,
                      isBlindDateMode: !profile.isBlindDateMode,
                    })
                  }
                  className={`w-14 h-8 rounded-full p-1 transition-colors ${profile.isBlindDateMode ? "bg-pink-500" : "bg-neutral-300 dark:bg-neutral-700"}`}
                >
                  <motion.div
                    animate={{ x: profile.isBlindDateMode ? 24 : 0 }}
                    className="w-6 h-6 rounded-full bg-white shadow-md"
                  />
                </button>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 ml-1 uppercase tracking-wider">
                  Миний тухай (Bio)
                </label>
                <textarea
                  value={profile.bio}
                  onChange={(e) =>
                    setProfile({ ...profile, bio: e.target.value })
                  }
                  rows={4}
                  placeholder="Өөрийнхөө тухай сонирхолтой зүйлсээ энд бичээрэй..."
                  className="w-full bg-black/20 border border-black/10 dark:border-white/10 rounded-2xl p-4 text-neutral-900 dark:text-white font-medium focus:outline-none focus:border-purple-500 focus:bg-white/40 dark:bg-black/40 transition-all resize-none placeholder:text-neutral-700"
                />
              </div>

              <div className="space-y-4">
                <label className="text-xs font-bold text-neutral-500 dark:text-neutral-400 ml-1 uppercase tracking-wider flex items-center gap-2">
                  <Star size={16} className="text-amber-400" />
                  Сонирхол (Interests)
                </label>

                <p className="text-neutral-500 dark:text-neutral-400 text-sm font-medium mb-3">
                  Хамгийн ихдээ 5 зүйл сонгох боломжтой.
                </p>

                <div className="flex flex-wrap gap-3">
                  {INTERESTS_LIST.map((interest) => {
                    const isSelected = profile.interests.includes(interest);
                    return (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        key={interest}
                        onClick={() => toggleInterest(interest)}
                        className={`px-4 py-2.5 rounded-full text-sm font-bold border-2 transition-all ${
                          isSelected
                            ? "border-pink-500 bg-gradient-to-r from-pink-600/20 to-purple-600/20 text-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.3)]"
                            : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900/50 text-neutral-500 dark:text-neutral-400 hover:border-neutral-700 hover:text-neutral-600 dark:text-neutral-300"
                        }`}
                      >
                        {interest}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              <div className="sticky bottom-6 z-50 pt-4 mt-8">
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full h-16 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center gap-3 text-neutral-900 dark:text-white font-extrabold text-xl shadow-[0_10px_40px_-10px_rgba(168,85,247,0.8)] transition-all disabled:opacity-70 disabled:grayscale border border-black/20 dark:border-white/20"
                >
                  {saving ? (
                    "Түр хүлээнэ үү..."
                  ) : (
                    <>
                      <Save size={24} /> Өөрчлөлтийг хадгалах
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {photoRating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-neutral-900 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-white/10"
            >
              <button
                onClick={() => setPhotoRating(null)}
                className="absolute top-4 right-4 p-2 bg-neutral-100 dark:bg-neutral-800 rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <X size={20} className="text-neutral-500" />
              </button>

              <div className="text-center mb-6 mt-2">
                <div className="w-20 h-20 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-500/30">
                  <Star size={32} className="text-white fill-white" />
                </div>
                <h3 className="text-2xl font-black text-neutral-900 dark:text-white">
                  AI Үнэлгээ
                </h3>
                <p className="text-neutral-500 dark:text-neutral-400 mt-1">
                  Таны зураг Dating апп дээр хэр амжилттай байх вэ?
                </p>
              </div>

              <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-2xl p-6 text-center border border-black/5 dark:border-white/5">
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-2">
                  {photoRating.score} / 100
                </div>
                <p className="text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed mt-4">
                  &quot;{photoRating.feedback}&quot;
                </p>
              </div>

              <button
                onClick={() => setPhotoRating(null)}
                className="w-full mt-6 py-4 rounded-xl bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 font-bold hover:scale-[1.02] transition-transform"
              >
                Ойлголоо, баярлалаа!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
