// src/components/FindTutors.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Loading from './Loading';
import { FaSearch, FaGlobe, FaCommentDots } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const API_BASE_URL = "https://learnify-psi-ten.vercel.app";

// The TutorCard component is already well-styled and can remain the same
const TutorCard = ({ tutorial }) => {
    const cardVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <motion.div variants={cardVariants}>
            <Card className="flex flex-col md:flex-row overflow-hidden group transition-all duration-300 hover:shadow-primary/20 hover:shadow-lg">
                <div className="w-full md:w-1/3 xl:w-1/4 p-4 flex-shrink-0 flex items-center justify-center">
                    <div className="relative w-full h-48 md:h-full rounded-lg shadow-lg overflow-hidden ring-2 ring-primary/30">
                        <img
                            src={tutorial.image}
                            alt={`${tutorial.language} tutorial cover`}
                            className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                        />
                    </div>
                </div>
                <div className="p-5 flex flex-col justify-between w-full">
                    <div>
                        <CardHeader className="p-0 flex-row justify-between items-start mb-3">
                            <div className="space-y-1">
                                <p className="text-sm text-muted-foreground flex items-center gap-1.5"><FaGlobe /> Language</p>
                                <CardTitle className="text-xl text-primary">{tutorial.language}</CardTitle>
                            </div>
                            <div className="bg-accent text-accent-foreground font-bold px-3 py-1 rounded-full text-sm">{`$${parseFloat(tutorial.price).toFixed(2)}`}</div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="flex items-center gap-3 mb-4 border-b border-border pb-4">
                                <div className="avatar">
                                    <div className="w-11 h-11 rounded-full ring-2 ring-primary ring-offset-background ring-offset-2">
                                        <img src={tutorial.tutorPhotoURL} alt={tutorial.tutorName} />
                                    </div>
                                </div>
                                <span className="font-semibold text-foreground">{tutorial.tutorName}</span>
                            </div>
                            <p className="text-sm text-muted-foreground h-24 overflow-y-auto pr-2">{tutorial.description}</p>
                        </CardContent>
                    </div>
                    <div className="flex justify-between items-center mt-4 pt-4 border-t border-border">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <FaCommentDots className="text-primary" />
                            <span>{tutorial.reviewCount} Reviews</span>
                        </div>
                        <Link to={`/tutorials/${tutorial._id}`}>
                            <Button variant="secondary" size="sm">View Details</Button>
                        </Link>
                    </div>
                </div>
            </Card>
        </motion.div>
    );
};

export default function FindTutors() {
    const [tutorials, setTutorials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { categoryName } = useParams();
    const location = useLocation();
    const initialSearch = new URLSearchParams(location.search).get('search') || '';
    const [inputValue, setInputValue] = useState(initialSearch);
    const [searchQuery, setSearchQuery] = useState(initialSearch);

    // ... useEffect and handlers remain the same, they are correct ...
    useEffect(() => {
        setIsLoading(true);
        setError(null);
        const params = new URLSearchParams();
        if (categoryName) params.append('category', categoryName);
        else if (searchQuery) params.append('search', searchQuery);

        const endpoint = `${API_BASE_URL}/tutorials?${params.toString()}`;
        axios.get(endpoint)
            .then(res => {
                if (res.data.success) {
                    setTutorials(res.data.tutorials);
                } else {
                    throw new Error(res.data.message || "Failed to fetch tutorials.");
                }
            })
            .catch(err => setError(err.message || "Could not fetch data."))
            .finally(() => setIsLoading(false));
    }, [searchQuery, categoryName]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(inputValue);
        const newUrl = inputValue ? `/find-tutors?search=${inputValue}` : '/find-tutors';
        navigate(newUrl, { replace: true });
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setInputValue(value);
        if (value === '') {
            setSearchQuery('');
            navigate('/find-tutors', { replace: true });
        }
    };


    const listContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    return (
        // ✨ FIX: Using your CSS variables for page background and text color
        <div className="min-h-screen bg-[var(--color-bbgc)] text-[var(--color-txt)] p-4 sm:p-6 md:p-8">
            <div className="max-w-6xl mx-auto">
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
                    {/* ✨ FIX: Heading now uses your primary color variable */}
                    <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-[var(--color-primary)]">Find Your Perfect Tutor</h1>
                    {/* ✨ FIX: Subtitle now uses your main text color variable */}
                    <p className="text-center max-w-2xl mx-auto mb-8 text-[var(--color-txt)] opacity-80">
                        Search by language to discover experienced tutors from around the world.
                    </p>
                </motion.div>

                <motion.form
                    onSubmit={handleSearchSubmit}
                    className="max-w-xl mx-auto mb-12 flex items-center gap-2"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="relative w-full">
                        {/* Shadcn's 'muted-foreground' should pick up your theme, this is correct */}
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input type="search" name="search" value={inputValue} onChange={handleInputChange} className="pl-9" placeholder="Type a language..." />
                    </div>
                    {/* Shadcn's primary button will use your primary color from the theme */}
                    <Button type="submit">Search</Button>
                </motion.form>

                {/* Display Area */}
                {isLoading ? (
                    <Loading />
                ) : error ? (
                    // Shadcn's destructive color for errors
                    <div className="text-center text-destructive p-10 bg-destructive/10 rounded-lg">Error: {error}</div>
                ) : (
                    <AnimatePresence>
                        <motion.div
                            className="flex flex-col gap-6"
                            variants={listContainerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {tutorials.length > 0 ? tutorials.map(tutorial => (
                                <TutorCard key={tutorial._id} tutorial={tutorial} />
                            )) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                    {/* The TutorCard uses Shadcn's Card, which is themed correctly */}
                                    <Card className="text-center p-10 border-dashed">
                                        <CardContent className="p-0">
                                            <p className="text-lg font-semibold">No Tutors Found</p>
                                            <p className="text-muted-foreground">Try a different language or clear your search.</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}