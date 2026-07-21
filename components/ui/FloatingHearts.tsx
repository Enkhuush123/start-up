"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function FloatingHearts() {
    const [hearts, setHearts] = useState<{ id: number; left: string; size: number; duration: number; delay: number }[]>([]);

    useEffect(() => {
        const generateHearts = () => {
            const newHearts = [];
            for (let i = 0; i < 20; i++) {
                newHearts.push({
                    id: i,
                    left: `${Math.random() * 100}%`,
                    size: Math.random() * 20 + 10,
                    duration: Math.random() * 15 + 10,
                    delay: Math.random() * 10,
                });
            }
            setHearts(newHearts);
        };
        generateHearts();
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {hearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    className="absolute text-pink-500/20 drop-shadow-xl"
                    initial={{ y: "100vh", opacity: 0 }}
                    animate={{
                        y: "-10vh",
                        opacity: [0, 0.8, 0.8, 0],
                        x: ["-15px", "15px", "-15px"]
                    }}
                    transition={{
                        y: { duration: heart.duration, repeat: Infinity, ease: "linear", delay: heart.delay },
                        opacity: { duration: heart.duration, repeat: Infinity, ease: "linear", delay: heart.delay },
                        x: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: heart.delay }
                    }}
                    style={{ left: heart.left, fontSize: heart.size }}
                >
                    ❤️
                </motion.div>
            ))}
        </div>
    );
}