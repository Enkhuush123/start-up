"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Map, { Marker } from "react-map-gl/mapbox";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  UserPlus,
  Copy,
  Layers,
  Moon,
  Satellite,
  Map as MapIcon,
  User,
  CheckCircle2,
  AlertCircle,
  Bell,
  Check,
  X,
  Globe,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { checkSession } from "@/app/actions/session";
import {
  updateLocation,
  getMapFriends,
  getMyInviteCode,
  addFriendByCode,
  getPendingRequests,
  acceptRequest,
  rejectRequest,
} from "@/app/actions/map";

import { useAlert } from "@/components/ui/AlertProvider";

type FriendType = {
  id: string;
  name: string;
  image?: string;
  lat: number;
  lng: number;
};

type PendingRequestType = {
  id: string;
  name: string;
  image?: string;
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

const MAP_STYLES = [
  {
    id: "dark",
    name: "Dark",
    url: "mapbox://styles/mapbox/dark-v11",
    icon: Moon,
  },
  {
    id: "streets",
    name: "Streets",
    url: "mapbox://styles/mapbox/streets-v12",
    icon: MapIcon,
  },
  {
    id: "satellite",
    name: "Satellite",
    url: "mapbox://styles/mapbox/satellite-v9",
    icon: Satellite,
  },
  {
    id: "hybrid",
    name: "Hybrid",
    url: "mapbox://styles/mapbox/satellite-streets-v12",
    icon: Globe,
  },
];

export default function FizzPage() {
  const router = useRouter();
  const { showAlert } = useAlert();
  const [userId, setUserId] = useState<string | null>(null);

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [myInviteCode, setMyInviteCode] = useState<string | null>(null);

  const [mapStyle, setMapStyle] = useState(MAP_STYLES[0].url);
  const [showStyleMenu, setShowStyleMenu] = useState(false);

  const [friends, setFriends] = useState<FriendType[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const [addStatus, setAddStatus] = useState<{
    success: boolean;
    msg: string;
  } | null>(null);
  const [loadingAdd, setLoadingAdd] = useState(false);

  const [pendingRequests, setPendingRequests] = useState<PendingRequestType[]>([]);
  const [showRequests, setShowRequests] = useState(false);

  useEffect(() => {
    async function init() {
      const session = await checkSession();
      if (!session?.userId) {
        router.push("/login");
        return;
      }
      setUserId(session.userId);

      const code = await getMyInviteCode(session.userId);
      setMyInviteCode(code || null);

      fetchFriends(session.userId);
    }
    init();
  }, [router]);

  async function fetchFriends(uid: string) {
    const [data, reqs] = await Promise.all([
      getMapFriends(uid),
      getPendingRequests(uid),
    ]);
    setFriends(data as FriendType[]);
    setPendingRequests(reqs as PendingRequestType[]);
  }

  useEffect(() => {
    if (!userId) return;

    if (!("geolocation" in navigator)) {
      console.warn("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        await updateLocation(userId, pos.coords.latitude, pos.coords.longitude);
      },
      (err) => console.error("Error getting location:", err),
    );

    const watchId = navigator.geolocation.watchPosition(
      async (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
        await updateLocation(userId, pos.coords.latitude, pos.coords.longitude);
      },
      (err) => console.error("Error watching location:", err),
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 },
    );

    const intervalId = setInterval(() => {
      fetchFriends(userId);
    }, 10000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(intervalId);
    };
  }, [userId]);

  const handleAddFriend = async () => {
    if (!inviteCodeInput.trim() || !userId) return;
    setLoadingAdd(true);
    setAddStatus(null);

    const res = await addFriendByCode(
      userId,
      inviteCodeInput.trim().toUpperCase(),
    );
    setAddStatus({ success: res.success, msg: res.message });
    setLoadingAdd(false);

    if (res.success) {
      fetchFriends(userId);
      setTimeout(() => {
        setShowAddFriend(false);
        setInviteCodeInput("");
        setAddStatus(null);
      }, 2000);
    }
  };

  const handleAccept = async (reqId: string) => {
    await acceptRequest(reqId);
    if (userId) fetchFriends(userId);
  };

  const handleReject = async (reqId: string) => {
    await rejectRequest(reqId);
    if (userId) fetchFriends(userId);
  };

  const copyToClipboard = () => {
    if (myInviteCode) {
      navigator.clipboard.writeText(myInviteCode);
      showAlert({ message: "Код хуулагдлаа!", type: "success" });
    }
  };

  return (
    <div className="relative w-full h-[100dvh] overflow-hidden bg-neutral-950">
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        initialViewState={{
          longitude: userLocation?.lng || 106.9155,
          latitude: userLocation?.lat || 47.9221,
          zoom: 13,
          pitch: 0,
        }}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
      >
        {}
        {userLocation && (
          <Marker
            longitude={userLocation.lng}
            latitude={userLocation.lat}
            anchor="bottom"
          >
            <div className="relative flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-white overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.8)] z-10 relative bg-neutral-900">
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                  <User className="text-white w-6 h-6" />
                </div>
              </div>
              <div className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full mt-[-8px] border border-white shadow-xl z-20">
                <span className="text-[11px] font-extrabold text-black tracking-wider">
                  Би
                </span>
              </div>
            </div>
          </Marker>
        )}

        {}
        {friends.map((friend) => (
          <Marker
            key={friend.id}
            longitude={friend.lng}
            latitude={friend.lat}
            anchor="bottom"
          >
            <div className="relative flex flex-col items-center">
              <div className="w-14 h-14 rounded-full border-2 border-pink-500 overflow-hidden shadow-[0_0_20px_rgba(236,72,153,0.8)] z-10 relative bg-neutral-900">
                {friend.image ? (
                  <img
                    src={friend.image}
                    alt={friend.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                    <User className="text-neutral-500 w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="bg-neutral-900/90 backdrop-blur-md px-3 py-1 rounded-full mt-[-8px] border border-neutral-700 shadow-xl z-20">
                <span className="text-[11px] font-extrabold text-white tracking-wider">
                  {friend.name || "Нэргүй"}
                </span>
              </div>
            </div>
          </Marker>
        ))}
      </Map>

      {}
      <div className="absolute top-24 right-4 flex flex-col gap-4 z-40 pb-20">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowRequests(true)}
          className="relative bg-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 p-4 rounded-full shadow-xl flex items-center justify-center text-white"
        >
          <Bell
            size={24}
            className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          />
          {pendingRequests.length > 0 && (
            <div className="absolute top-0 right-0 w-4 h-4 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-bold border border-neutral-900">
              {pendingRequests.length}
            </div>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddFriend(true)}
          className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 p-4 rounded-full shadow-xl flex items-center justify-center text-white"
        >
          <UserPlus
            size={24}
            className="text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]"
          />
        </motion.button>

        <div className="relative flex flex-col items-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowStyleMenu(!showStyleMenu)}
            className="bg-neutral-900/60 backdrop-blur-xl border border-neutral-700/50 p-4 rounded-full shadow-xl flex items-center justify-center text-white"
          >
            <Layers
              size={24}
              className={showStyleMenu ? "text-pink-400" : "text-white"}
            />
          </motion.button>

          <AnimatePresence>
            {showStyleMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="absolute top-16 right-0 bg-neutral-900/80 backdrop-blur-2xl border border-neutral-700/50 p-2 rounded-2xl shadow-2xl flex flex-col gap-1 min-w-[140px]"
              >
                {MAP_STYLES.map((style) => {
                  const Icon = style.icon;
                  const isActive = mapStyle === style.url;
                  return (
                    <button
                      key={style.id}
                      onClick={() => {
                        setMapStyle(style.url);
                        setShowStyleMenu(false);
                      }}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold text-xs tracking-wide ${
                        isActive
                          ? "bg-pink-500/20 text-pink-400 border border-pink-500/30 shadow-[0_0_15px_rgba(236,72,153,0.2)]"
                          : "text-neutral-300 hover:bg-neutral-800 hover:text-white border border-transparent"
                      }`}
                    >
                      <Icon size={16} />
                      {style.name}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {}
      <AnimatePresence>
        {showRequests && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-neutral-900/90 backdrop-blur-2xl border border-neutral-700/50 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
            >
              <button
                onClick={() => setShowRequests(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-neutral-800/80 rounded-full text-neutral-400 hover:text-white transition-colors z-10"
              >
                ✕
              </button>
              <h3 className="text-2xl font-extrabold text-white mb-6 tracking-tight">
                Хүсэлтүүд
              </h3>

              {pendingRequests.length === 0 ? (
                <p className="text-neutral-500 text-center py-4 text-sm font-medium">
                  Шинэ хүсэлт алга байна.
                </p>
              ) : (
                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                  {pendingRequests.map((req) => (
                    <div
                      key={req.id}
                      className="flex items-center justify-between bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800/80"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            req.image ||
                            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100"
                          }
                          alt={req.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <span className="text-white font-bold text-sm">
                          {req.name || "Нэргүй"}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(req.id)}
                          className="w-8 h-8 flex items-center justify-center bg-emerald-500/20 text-emerald-400 rounded-full hover:bg-emerald-500/40 transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => handleReject(req.id)}
                          className="w-8 h-8 flex items-center justify-center bg-rose-500/20 text-rose-400 rounded-full hover:bg-rose-500/40 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {}
      <AnimatePresence>
        {showAddFriend && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-sm bg-neutral-900/90 backdrop-blur-2xl border border-neutral-700/50 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl pointer-events-none"></div>

              <button
                onClick={() => setShowAddFriend(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-neutral-800/80 rounded-full text-neutral-400 hover:text-white transition-colors z-10"
              >
                ✕
              </button>

              <h3 className="text-2xl font-extrabold text-white mb-1 tracking-tight relative z-10">
                Найз нэмэх
              </h3>
              <p className="text-neutral-400 text-sm font-medium mb-6 relative z-10">
                Найзынхаа урилгын кодыг оруулаад Fizz дээр холбогдоорой.
              </p>

              <div className="space-y-4 relative z-10">
                <input
                  type="text"
                  placeholder="Код оруулах (Ж: X7A9K)"
                  value={inviteCodeInput}
                  onChange={(e) => setInviteCodeInput(e.target.value)}
                  className="w-full h-14 bg-neutral-950/80 border border-neutral-800 rounded-2xl px-5 text-white placeholder:text-neutral-600 focus:outline-none focus:border-pink-500 font-extrabold uppercase tracking-widest text-center"
                />

                {addStatus && (
                  <div
                    className={`p-3 rounded-xl flex items-center gap-2 text-sm font-bold ${addStatus.success ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "bg-rose-500/20 text-rose-400 border border-rose-500/30"}`}
                  >
                    {addStatus.success ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    {addStatus.msg}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddFriend}
                  disabled={loadingAdd || !inviteCodeInput.trim()}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-[0_10px_30px_-10px_rgba(236,72,153,0.6)] transition-all disabled:opacity-50 disabled:grayscale"
                >
                  {loadingAdd ? "Уншиж байна..." : "Хүсэлт илгээх"}
                </motion.button>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-800/50 relative z-10">
                <p className="text-[11px] text-neutral-500 text-center uppercase tracking-widest font-extrabold mb-3">
                  Миний урилгын код
                </p>
                <div className="flex items-center justify-between bg-neutral-950/60 p-3 rounded-2xl border border-neutral-800/80">
                  <span className="text-pink-400 font-black tracking-widest text-2xl ml-3 drop-shadow-md">
                    {myInviteCode || "..."}
                  </span>
                  <button
                    onClick={copyToClipboard}
                    className="p-3 bg-neutral-900 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-400 hover:text-white"
                  >
                    <Copy size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
