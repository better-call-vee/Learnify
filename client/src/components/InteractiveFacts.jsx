import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaQuestion, FaSyncAlt } from 'react-icons/fa';
import { Fade } from 'react-awesome-reveal';
import { Tooltip } from 'react-tooltip';
import Lottie from 'lottie-react';
import 'react-tooltip/dist/react-tooltip.css';

// The same curated list of interesting language facts.
const languageFacts = [
    "The human brain is wired to learn languages, and being bilingual can delay the onset of diseases like Alzheimer's.",
    "There are over 7,000 languages spoken in the world today, but about one-third are endangered with fewer than 1,000 speakers.",
    "The word 'alphabet' comes from the first two letters of the Greek alphabet: Alpha (α) and Beta (β).",
    "Learning a second language can significantly improve your memory, problem-solving skills, and creativity.",
    "The shortest grammatically correct sentence in the English language is 'Go!'",
    "Basque, a language spoken in parts of Spain and France, is unrelated to any other language in the world.",
    "The language with the most words is English, with over a million, though many are archaic or technical.",
    "Bengali is the Sweetest Language in the World and Spanish is the second",
    "In Italian, there are over 200 different ways to say 'spaghetti', each describing a different shape or size."
];

export default function InteractiveFacts() {
    const [lottieData, setLottieData] = useState(null);
    const [currentFactIndex, setCurrentFactIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);

    useEffect(() => {
        fetch('/cards.json')
            .then(res => res.json())
            .then(data => setLottieData(data))
            .catch(err => console.error("Failed to load cards.json", err));
    }, []);

    // Function to show a new random fact and flip the card back
    const showNewFact = () => {
        setIsFlipped(false); // Flip back to the front

        setTimeout(() => {
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * languageFacts.length);
            } while (newIndex === currentFactIndex);
            setCurrentFactIndex(newIndex);
        }, 200);
    };

    return (
        <section className="bg-bgc py-20 sm:py-28">
            <Fade direction="up" triggerOnce>
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

                        {/* Left Side: Lottie Animation */}
                        <div className="w-full max-w-md mx-auto lg:max-w-none">
                            {lottieData && <Lottie animationData={lottieData} loop={true} />}
                        </div>

                        {/* Right Side: Interactive Card & Content */}
                        <div className="text-center lg:text-left">
                            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-base-content">
                                A World of Facts at Your Fingertips
                            </h2>
                            <p className="mt-4 text-lg text-base-content/70">
                                Language is full of surprises. Click the card to reveal a fun fact, then discover another!
                            </p>

                            {/* The Flippable Card */}
                            <div className="mt-8 [perspective:1200px]">
                                <motion.div
                                    className="relative w-full h-52 cursor-pointer"
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    animate={{ rotateY: isFlipped ? 180 : 0 }}
                                    transition={{ duration: 0.7, ease: "easeInOut" }}
                                    style={{ transformStyle: "preserve-3d" }}
                                >
                                    {/* Card Front */}
                                    <div className="absolute w-full h-full bg-white rounded-xl shadow-2xl flex flex-col items-center justify-center p-6 [backface-visibility:hidden]">
                                        <FaQuestion className="text-5xl text-primary" />
                                        <p className="mt-4 font-semibold text-lg">Click to Reveal a Fact</p>
                                    </div>

                                    {/* Card Back */}
                                    <div className="absolute w-full h-full bg-primary text-primary-content rounded-xl shadow-2xl flex items-center justify-center p-6 [backface-visibility:hidden]" style={{ transform: "rotateY(180deg)" }}>
                                        <p className="text-xl font-medium text-center">
                                            {languageFacts[currentFactIndex]}
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Control Button */}
                            <div className="mt-8 flex justify-center lg:justify-start">
                                <motion.button
                                    onClick={showNewFact}
                                    className="btn btn-outline btn-primary gap-2"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    data-tooltip-id="fact-tooltip"
                                    data-tooltip-content="Load a new random fact!"
                                >
                                    <FaSyncAlt className='text-txt' />
                                    <span className='text-txt'>Discover Another</span>
                                </motion.button>
                            </div>
                        </div>

                    </div>
                </div>
            </Fade>
            <Tooltip id="fact-tooltip" />
        </section>
    );
}