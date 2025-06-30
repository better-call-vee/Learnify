// src/components/Stats.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';
import "react-tooltip/dist/react-tooltip.css";

import { FaUsers, FaChalkboardTeacher, FaGlobeAmericas, FaStar } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://learnify-psi-ten.vercel.app";

function AnimatedCounter({ value }) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });
    const spring = useSpring(0, { stiffness: 100, damping: 25 });

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);

    // This hook transforms the raw number from the spring into a formatted string
    const displayValue = useTransform(spring, (currentValue) =>
        Math.round(currentValue).toLocaleString()
    );

    return <motion.span ref={ref}>{displayValue}</motion.span>;
}

// --- ✨ Redesigned StatCard Component ---
const StatCard = ({ icon, value, label }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 50 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div
            variants={cardVariants}
            className="relative overflow-hidden rounded-xl bg-white/10 p-6 text-center shadow-lg backdrop-blur-md border border-white/20"
        >
            {/* Subtle glow effect */}
            <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-primary/30 rounded-full blur-3xl"></div>

            <div className="relative z-10">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-txt">
                    {React.cloneElement(icon, { className: "text-3xl" })}
                </div>
                <h3 className="text-5xl font-bold text-txt">
                    <AnimatedCounter value={value || 0} />+
                </h3>
                <p className="mt-2 text-txt">{label}</p>
            </div>
        </motion.div>
    );
};


// --- ✨ Redesigned Main Stats Component ---
export default function Stats() {
    const [stats, setStats] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/stats`)
            .then(res => {
                if (res.data.success) {
                    setStats(res.data.stats);
                } else {
                    throw new Error(res.data.message);
                }
            })
            .catch(err => {
                console.error("Failed to fetch stats:", err);
                setError(err.message || "Could not load stats.");
            });
    }, []);

    const statItems = stats ? [
        { icon: <FaUsers />, value: stats.users, label: "Happy Learners" },
        { icon: <FaChalkboardTeacher />, value: stats.tutors, label: "Expert Tutors" },
        { icon: <FaGlobeAmericas />, value: stats.languages, label: "Languages Taught" },
        { icon: <FaStar />, value: stats.reviews, label: "5-Star Reviews" },
    ] : [];

    // Animation container variants for staggering children
    const containerVariants = {
        hidden: {},
        visible: {
            transition: {
                staggerChildren: 0.2, // Each card animates 0.2s after the previous one
            },
        },
    };

    return (
        <section className="bg-bgc py-20 sm:py-28">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-txt sm:text-4xl">Join Our Global Learning Community</h2>
                    <p className="mt-4 text-lg leading-8 text-txt">
                        Trusted by thousands of users and tutors worldwide.
                    </p>
                </div>

                {error && <div className="mt-12 text-center py-10 text-red-400">{error}</div>}

                {!stats && !error && (
                    <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-56 rounded-xl bg-bgc animate-pulse"></div>
                        ))}
                    </div>
                )}

                {stats && (
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        className="mt-16 grid text-txt grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
                    >
                        {statItems.map((item) => (
                            <StatCard key={item.label} {...item} />
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    );
}