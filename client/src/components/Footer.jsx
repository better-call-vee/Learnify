import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaYoutube, FaInstagram } from "react-icons/fa";
import { MdSchool, MdDarkMode, MdLightMode } from "react-icons/md";

export default function Footer() {
    // --- Theme logic remains the same ---
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkMode") === "true";
        setDarkMode(savedDarkMode);
        const observer = new MutationObserver(() => {
            const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
            setDarkMode(isDark);
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        return () => observer.disconnect();
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        localStorage.setItem("darkMode", newDarkMode.toString());
        document.documentElement.setAttribute(
            "data-theme",
            newDarkMode ? "dark" : "light"
        );
    };

    // --- Footer JSX ---
    return (
        <footer className="bg-base-200 text-base-content border-t border-[color:var(--color-txt)]/20">
            <div className="w-[92%] max-w-7xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-5 gap-8">
                    {/* Brand Section */}
                    <div className="md:col-span-1 lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <MdSchool className="h-8 w-8 text-txt" />
                            <span className="text-2xl font-bold">Learnify</span>
                        </Link>
                        <p className="text-base-content/70 text-sm max-w-xs">
                            Your global classroom. Connect with expert tutors and unlock your potential in any language.
                        </p>
                    </div>

                    {/* Quick Links Section */}
                    <div>
                        <h3 className="font-semibold mb-4">Platform</h3>
                        <div className="flex flex-col gap-2">
                            <Link to="/find-tutors" className="hover:text-[color:var(--color-divider)] transition-colors text-sm">Find Tutors</Link>
                            <Link to="/add-tutorials" className="hover:text-[color:var(--color-divider)] transition-colors text-sm">Add Tutorials</Link>
                            <Link to="/my-booked-tutors" className="hover:text-[color:var(--color-divider)] transition-colors text-sm">My Bookings</Link>
                        </div>
                    </div>

                    {/* Company Links Section */}
                    <div>
                        <h3 className="font-semibold mb-4">Company</h3>
                        <div className="flex flex-col gap-2">
                            <Link to="https://www.duolingo.com/learn" className="hover:text-[color:var(--color-divider)] transition-colors text-sm">Duolingo</Link>
                            <Link to="https://www.duolingo.com/profile/neelbilai" className="hover:text-[color:var(--color-divider)] transition-colors text-sm">Contact</Link>
                            <Link to="/faq" className="hover:text-[color:var(--color-divider)] transition-colors text-sm">FAQ</Link>
                        </div>
                    </div>

                    {/* Legal Links Section */}
                    <div>
                        <h3 className="font-semibold mb-4">Legal</h3>
                        <div className="flex flex-col gap-2">
                            <Link to="https://www.instagram.com/neelbilai/" className="hover:text-[color:var(--color-divider)] transition-colors text-sm">Terms of Service</Link>
                            <Link to="https://www.instagram.com/neelbilai/" className="hover:text-[color:var(--color-divider)] transition-colors text-sm">Privacy Policy</Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar: Copyright, Socials, Theme Toggle */}
                <div className="mt-10 pt-8 border-t border-[color:var(--color-txt)]/20 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-base-content/60">
                        © {new Date().getFullYear()} Learnify. All Rights Reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--color-divider)] transition-colors" aria-label="Facebook"><FaFacebook size={22} /></a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--color-divider)] transition-colors" aria-label="Instagram"><FaInstagram size={22} /></a>
                        <a href="#" target="_blank" rel="noopener noreferrer" className="hover:text-[color:var(--color-divider)] transition-colors" aria-label="YouTube"><FaYoutube size={22} /></a>
                        <div className="w-px h-5 bg-[color:var(--color-txt)]/30 mx-2"></div>
                        <button onClick={toggleDarkMode} title="Toggle Theme" className="h-9 w-9 flex items-center justify-center text-xl rounded-full hover:text-[color:var(--color-divider)] transition-colors">
                            {darkMode ? <MdDarkMode /> : <MdLightMode />}
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}