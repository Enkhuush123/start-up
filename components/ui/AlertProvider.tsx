"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

type AlertType = "success" | "error" | "info" | "confirm";

interface AlertOptions {
  title?: string;
  message: string;
  type?: AlertType;
  onConfirm?: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
}

interface AlertContextType {
  showAlert: (options: AlertOptions) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) throw new Error("useAlert must be used within an AlertProvider");
  return context;
};

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [alert, setAlert] = useState<AlertOptions | null>(null);

  const showAlert = (options: AlertOptions) => {
    setAlert(options);
  };

  const closeAlert = () => {
    setAlert(null);
  };

  const handleConfirm = () => {
    if (alert?.onConfirm) alert.onConfirm();
    closeAlert();
  };

  const handleCancel = () => {
    if (alert?.onCancel) alert.onCancel();
    closeAlert();
  };

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      <AnimatePresence>
        {alert && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={alert.type !== "confirm" ? closeAlert : undefined}
            />
            <motion.div
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              className="relative w-full max-w-sm bg-neutral-900/90 backdrop-blur-xl border border-neutral-700/50 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="mb-4 relative z-10">
                {alert.type === "success" && <CheckCircle2 size={48} className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]" />}
                {alert.type === "error" && <AlertCircle size={48} className="text-rose-400 drop-shadow-[0_0_15px_rgba(251,113,133,0.5)]" />}
                {(alert.type === "info" || !alert.type || alert.type === "confirm") && (
                  <Info size={48} className="text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
                )}
              </div>

              <h3 className="text-xl font-extrabold text-white mb-2 relative z-10">
                {alert.title || (alert.type === "success" ? "Амжилттай" : alert.type === "error" ? "Алдаа" : "Мэдэгдэл")}
              </h3>
              
              <p className="text-neutral-400 text-sm font-medium mb-8 relative z-10">
                {alert.message}
              </p>

              <div className="w-full flex gap-3 relative z-10">
                {alert.type === "confirm" ? (
                  <>
                    <button
                      onClick={handleCancel}
                      className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-bold rounded-2xl transition-colors"
                    >
                      {alert.cancelText || "Үгүй"}
                    </button>
                    <button
                      onClick={handleConfirm}
                      className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl shadow-[0_5px_20px_rgba(236,72,153,0.4)] hover:shadow-[0_5px_25px_rgba(236,72,153,0.6)] transition-all"
                    >
                      {alert.confirmText || "Тийм"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={closeAlert}
                    className="w-full py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-2xl shadow-[0_5px_20px_rgba(236,72,153,0.4)] hover:shadow-[0_5px_25px_rgba(236,72,153,0.6)] transition-all"
                  >
                    {alert.confirmText || "Ойлголоо"}
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </AlertContext.Provider>
  );
};
