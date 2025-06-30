import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'framer-motion';
import Lottie from 'lottie-react';
import { Tooltip } from 'react-tooltip';
import "react-tooltip/dist/react-tooltip.css";
import { FaArrowRight, FaList, FaTh } from 'react-icons/fa';
import Loading from './Loading';

const API_BASE_URL = "https://learnify-psi-ten.vercel.app";

const CategoryCard = ({ category, layout }) => {
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { once: true, amount: 0.3 });

    const cardVariants = {
        hidden: { opacity: 0, scale: 0.9, y: 30 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
    };

    if (layout === 'list') {
        return (
            <motion.div ref={cardRef} variants={cardVariants}>
                <Link
                    to={`/find-tutors/${category.name}`}
                    data-tooltip-id="category-tooltip"
                    data-tooltip-content={`Explore tutors for ${category.name}`}
                >
                    <div className="card card-side bg-bgc p-4 shadow-lg backdrop-blur-md border border-border group transition-all duration-300 hover:border-primary hover:shadow-primary/20">
                        <figure className="w-24 h-24 flex-shrink-0">
                            <img src={`/${category.logo}`} alt={category.name} className="w-full h-full object-contain" />
                        </figure>
                        <div className="card-body p-4">
                            <h2 className="card-title text-txt">{category.name}</h2>
                            <p className="text-sm text-txt">{category.description}</p>
                        </div>
                        <div className="card-actions justify-end items-center">
                            <FaArrowRight className="text-txt transition-transform duration-300 group-hover:translate-x-1 group-hover:text-txt" />
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    }

    // Default to Grid layout
    return (
        <motion.div ref={cardRef} variants={cardVariants}>
            <Link
                to={`/find-tutors/${category.name}`}
                data-tooltip-id="category-tooltip"
                data-tooltip-content={`Explore tutors for ${category.name}`}
            >
                <div className="card bg-base-100/50 p-6 text-center items-center shadow-lg backdrop-blur-md border border-border h-full transition-all duration-300 hover:border-primary hover:shadow-primary/20 hover:-translate-y-2 group">
                    <figure className="w-20 h-20 mb-4">
                        <img src={`/${category.logo}`} alt={category.name} className="w-full h-full object-contain" />
                    </figure>
                    <div className="card-body p-0 items-center text-center">
                        <h2 className="card-title text-txt justify-center">{category.name}</h2>
                        <div className="card-actions justify-center mt-4">
                            <FaArrowRight className="text-muted-foreground transition-transform duration-300 group-hover:translate-x-1 group-hover:text-txt" />
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
};


export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lottieData, setLottieData] = useState(null);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

    useEffect(() => {
        // Fetch categories from backend
        axios.get(`${API_BASE_URL}/categories`)
            .then(res => {
                if (res.data.success) {
                    setCategories(res.data.categories);
                } else {
                    throw new Error(res.data.message);
                }
            })
            .catch(err => {
                console.error("Failed to fetch categories:", err);
                setError(err.message || "Could not load language categories.");
            })
            .finally(() => setIsLoading(false));

        // Fetch Lottie animation
        fetch('/langs.json')
            .then(res => res.json())
            .then(data => setLottieData(data))
            .catch(err => console.error("Failed to load langs.json", err));
    }, []);

    const containerVariants = {
        hidden: { opacity: 1 }, // Parent is visible
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        <section className="bg-bgc py-16 sm:py-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-8 mb-12">
                        <div className="w-48 h-48 md:w-56 md:h-56">
                            {lottieData && <Lottie animationData={lottieData} loop={true} />}
                        </div>
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight text-txt sm:text-4xl">
                                Explore a World of Languages
                            </h2>
                            <p className="mt-4 text-lg text-txt">
                                Choose a language and start your learning journey with one of our expert tutors today.
                            </p>
                        </div>
                    </div>
                </motion.div>

                <div className="flex justify-end mb-4">
                    <div className="inline-flex items-center rounded-md bg-bgc p-1">
                        <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary text-primary-content shadow' : 'text-muted-foreground hover:text-foreground'}`}><FaTh /></button>
                        <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-sm rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-content shadow' : 'text-muted-foreground hover:text-foreground'}`}><FaList /></button>
                    </div>
                </div>

                {isLoading ? (
                    <Loading />
                ) : error ? (
                    <div className="text-center py-10 text-destructive">{error}</div>
                ) : (
                    <motion.div
                        key={viewMode}
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className={viewMode === 'grid'
                            ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
                            : "flex flex-col gap-4"
                        }
                    >
                        {categories.map((category) => (
                            <CategoryCard key={category.name} category={category} layout={viewMode} />
                        ))}
                    </motion.div>
                )}

            </div>
            <Tooltip id="category-tooltip" />
        </section>
    );
}