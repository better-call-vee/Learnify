import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown } from 'react-icons/fa';
import { Fade } from 'react-awesome-reveal';
import Lottie from 'lottie-react';
import Loading from '../components/Loading'; // Assuming you have a Loading component

// --- FAQ Content ---
const faqData = [
    {
        category: "General Questions",
        questions: [
            {
                q: "What is Learnify?",
                a: "Learnify is an online platform connecting passionate language tutors with eager learners worldwide. We provide the tools for tutors to create and manage their own tutorials, and for students to find, book, and attend sessions seamlessly."
            },
            {
                q: "Is Learnify free to join?",
                a: "Yes! Creating an account on Learnify is completely free for both students and tutors. Students only pay for the tutorial sessions they book, and tutors only pay a small commission on their earnings."
            },
            {
                q: "What languages can I learn or teach?",
                a: "Our platform supports a vast range of languages, from global languages like English and Spanish to specialized ones like Japanese and Korean. Our community is constantly growing, so new languages are added regularly."
            }
        ]
    },
    {
        category: "For Students",
        questions: [
            {
                q: "How do I find and book a tutor?",
                a: "Simply use our 'Find Tutors' page to browse through available tutorials. You can filter by language, search by keywords, and view detailed tutor profiles. Once you find a tutor you like, select their tutorial and follow the simple booking process."
            },
            {
                q: "What payment methods do you accept?",
                a: "We accept all major credit cards through our secure payment processor. All transactions are encrypted for your safety."
            },
            {
                q: "Can I cancel or reschedule a session?",
                a: "Yes, each tutor sets their own cancellation and rescheduling policy, which is visible on their tutorial page. Please review these policies before booking. You can manage your bookings from the 'My Booked Tutors' dashboard."
            }
        ]
    },
    {
        category: "For Tutors",
        questions: [
            {
                q: "How do I become a tutor?",
                a: "We're thrilled you want to join us! To become a tutor, simply sign up for an account and navigate to the 'Add Tutorials' section. You'll be guided through the process of creating your first tutorial listing."
            },
            {
                q: "How much does it cost to be a tutor on Learnify?",
                a: "It's free to list your tutorials on Learnify. We operate on a success-based model, taking a small, transparent commission from your earnings per session. This means we only make money when you do."
            },
            {
                q: "How and when do I get paid?",
                a: "Payments are processed securely after a completed session. You can set up your payout preferences in your tutor dashboard, and funds will be transferred to your account according to our payout schedule (typically within 5-7 business days)."
            }
        ]
    }
];

// --- Reusable Accordion Item Component ---
const AccordionItem = ({ q, a }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="py-4 border-b border-txt">
            <motion.header
                initial={false}
                onClick={() => setIsOpen(!isOpen)}
                className="flex justify-between items-center cursor-pointer"
            >
                <h3 className="text-lg font-medium text-txt">{q}</h3>
                <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <FaChevronDown className={`transition-colors ${isOpen ? 'text-txt' : 'text-txt'}`} />
                </motion.div>
            </motion.header>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.section
                        key="content"
                        initial="collapsed"
                        animate="open"
                        exit="collapsed"
                        variants={{
                            open: { opacity: 1, height: "auto" },
                            collapsed: { opacity: 0, height: 0 }
                        }}
                        transition={{ duration: 0.4, ease: [0.04, 0.62, 0.23, 0.98] }}
                        className="overflow-hidden"
                    >
                        <p className="pt-4 text-txt">{a}</p>
                    </motion.section>
                )}
            </AnimatePresence>
        </div>
    );
};


// --- Main FAQ Page Component ---
export default function FAQPage() {
    const [lottieData, setLottieData] = useState(null);

    useEffect(() => {
        fetch('/faq.json')
            .then(res => res.json())
            .then(data => setLottieData(data))
            .catch(err => console.error("Failed to load faq.json", err));
    }, []);

    if (!lottieData) {
        return <Loading />; 
    }

    return (
        <div className="bg-base-100 min-h-screen">
            {/* 1. Attention-Grabbing Header */}
            <header className="bg-base-200 text-center py-16 md:py-24 px-4">
                <Fade direction="down" triggerOnce>
                    <div className="max-w-md mx-auto">
                        <Lottie animationData={lottieData} loop={true} style={{ height: 200 }} />
                    </div>
                    <h1 className="mt-6 text-4xl md:text-5xl font-bold text-base-content tracking-tight">
                        Frequently Asked Questions
                    </h1>
                    <p className="mt-4 text-lg text-base-content/70 max-w-2xl mx-auto">
                        Have questions? We're here to help. Everything you need to know about Learnify is right here.
                    </p>
                </Fade>
            </header>

            {/* 2. Main FAQ Section */}
            <main className="max-w-4xl mx-auto py-16 px-4">
                {faqData.map(categoryItem => (
                    <Fade direction="up" cascade damping={0.1} triggerOnce key={categoryItem.category}>
                        <div className="mb-12">
                            <h2 className="text-2xl font-bold text-txt mb-6 border-b-2 border-txt pb-2">
                                {categoryItem.category}
                            </h2>
                            <div>
                                {categoryItem.questions.map(item => (
                                    <AccordionItem key={item.q} q={item.q} a={item.a} />
                                ))}
                            </div>
                        </div>
                    </Fade>
                ))}
            </main>
        </div>
    );
}