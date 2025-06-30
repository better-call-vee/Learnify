// src/components/Navbar.jsx
import React, { useState, useEffect, useContext } from "react";
import { FaHome, FaSearch, FaUserCircle } from "react-icons/fa";
import {
    MdDarkMode,
    MdLightMode,
    MdLibraryAdd,
    MdTask,
    MdMenu,
    MdClose,
    MdCollectionsBookmark,
    MdSchool
} from "react-icons/md";
import { BiLogIn, BiLogOut } from "react-icons/bi";
import { NavLink, Link, useNavigate } from "react-router-dom";
import AuthContext from '../provider/AuthContext';
import Swal from 'sweetalert2';

const navLinks = [
    { id: 'home', icon: <FaHome />, title: "Home", to: "/" },
    { id: 'findTutors', icon: <FaSearch />, title: "Find Tutors", to: "/find-tutors" },
    { id: 'addTutorials', icon: <MdLibraryAdd />, title: "Add Tutorials", to: "/add-tutorials" },
    { id: 'myTutorials', icon: <MdTask />, title: "My Tutorials", to: "/my-tutorials" },
    { id: 'myBookedTutors', icon: <MdCollectionsBookmark />, title: "My Booked Tutors", to: "/my-booked-tutors" },
];

const Navbar = () => {
    const { user, logOut, loading } = useContext(AuthContext);
    const navigate = useNavigate();

    const [darkMode, setDarkMode] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false); // State to track scroll

    useEffect(() => {
        const savedDarkMode = localStorage.getItem("darkMode") === "true";
        setDarkMode(savedDarkMode);
        document.documentElement.setAttribute(
            "data-theme",
            savedDarkMode ? "dark" : "light"
        );
    }, []);

    // Effect to handle scroll events for sticky navbar
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll); // Cleanup
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

    const toggleDrawer = () => {
        setIsDrawerOpen((prev) => !prev);
    };

    const handleLogout = async () => {
        const result = await Swal.fire({
            title: 'Are you sure you want to logout?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, logout!',
            background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
            color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f9fafb' : '#111827'
        });

        if (result.isConfirmed) {
            try {
                await logOut();
                Swal.fire({
                    title: 'Logged out!',
                    icon: 'success',
                    timer: 1500,
                    showConfirmButton: false,
                    background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
                    color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f9fafb' : '#111827'
                });
                navigate('/auth/login');
            } catch (error) {
                console.error("Logout failed:", error);
                Swal.fire({
                    title: 'Logout Failed',
                    text: error.message || "Could not log you out.",
                    icon: 'error',
                    background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
                    color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f9fafb' : '#111827'
                });
            }
        }
    };

    const displayName = user?.displayName || 'User';
    const photoURL = user?.photoURL;

    const handleNavLinkClick = () => {
        if (isDrawerOpen) {
            toggleDrawer();
        }
    };

    const SiteLogo = () => (
        <Link to="/" className="flex items-center gap-2" onClick={handleNavLinkClick}>
            <MdSchool className="h-7 w-7 text-txt" />
            <span className="text-xl font-bold text-base-content">Learnify</span>
        </Link>
    );

    const UserAvatar = ({ size = 'h-10 w-10' }) => {
        if (photoURL) {
            return (
                <img
                    src={photoURL}
                    alt={displayName}
                    className={`${size} rounded-full object-cover border-2 border-transparent group-hover:border-primary transition cursor-pointer`}
                    tabIndex={0}
                />
            );
        }
        return <FaUserCircle className={`${size} text-gray-400 group-hover:text-primary transition cursor-pointer`} tabIndex={0} />;
    };

    const UserAvatarMobile = ({ size = 'w-16 h-16' }) => {
        if (photoURL) {
            return (
                <img src={photoURL} alt={displayName} className={`${size} rounded-full mx-auto mb-2 object-cover`} />
            );
        }
        return <FaUserCircle className={`${size} text-gray-400 mx-auto mb-2`} />;
    };


    return (
        <>
            <nav className={`h-16 bg-base-100/90 text-base-content transition-all duration-300 z-20 sticky top-0 ${isScrolled ? 'shadow-md backdrop-blur-sm' : ''}`}>
                <div className="h-full w-[92%] max-w-7xl mx-auto flex justify-between items-center">
                    {/* Mobile: Logo (left) + Menu Toggle (right) */}
                    <div className="md:hidden flex-1 flex justify-start">
                        <SiteLogo />
                    </div>
                    <div className="md:hidden">
                        <button onClick={toggleDrawer} className="text-2xl p-2" aria-label="Toggle Menu">
                            {isDrawerOpen ? <MdClose /> : <MdMenu />}
                        </button>
                    </div>

                    {/* Desktop: Logo */}
                    <div className="hidden md:flex items-center text-xl font-bold">
                        <SiteLogo />
                    </div>

                    {/* Desktop: Navigation Tabs */}
                    <div className="hidden md:flex items-center h-full flex-grow justify-center">
                        <div className="flex items-center divide-x divide-base-300 h-full">
                            {navLinks.map(({ icon, to, title, id }) => (
                                <NavLink
                                    key={id} to={to} title={title}
                                    className={({ isActive }) =>
                                        `h-full px-3 lg:px-4 flex items-center justify-center gap-2 hover:bg-base-200 transition-colors duration-200 ${isActive ? 'bg-base-300 text-txt font-semibold' : ''}`
                                    }
                                >
                                    <span className="text-xl">{icon}</span>
                                    <span className="hidden lg:inline text-sm">{title}</span>
                                </NavLink>
                            ))}
                        </div>
                    </div>

                    {/* Desktop: Theme Toggle + Auth Actions */}
                    <div className="hidden md:flex items-center gap-3 lg:gap-4">
                        <button onClick={toggleDarkMode} title="Toggle Theme" className="h-10 w-10 flex items-center justify-center text-xl rounded-full hover:bg-base-200 transition-colors duration-200">
                            {darkMode ? <MdDarkMode /> : <MdLightMode />}
                        </button>
                        {loading ? (
                            <span className="loading loading-spinner loading-sm"></span>
                        ) : user ? (
                            <>
                                <div className="group relative">
                                    <UserAvatar />
                                    <div className="absolute top-full right-0 mt-2 w-max bg-base-200 shadow-lg rounded-md px-3 py-1.5 text-sm text-base-content opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                        {displayName}
                                    </div>
                                </div>
                                <button onClick={handleLogout} className="flex items-center gap-1.5 px-3 py-2 bg-error hover:bg-error-focus text-error-content rounded-md hover:opacity-90 transition text-sm font-medium">
                                    <BiLogOut /> Logout
                                </button>
                            </>
                        ) : (
                            <NavLink to="/auth/login" className="flex items-center gap-1.5 px-4 py-2 bg-primary hover:bg-primary-focus text-primary-content rounded-md hover:opacity-90 transition text-sm font-medium">
                                <BiLogIn />
                                <span>Login</span>
                            </NavLink>
                        )}
                    </div>
                </div>
            </nav>

            {/* Overlay & Mobile Drawer */}
            {isDrawerOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={toggleDrawer} />}
            <div className={`fixed top-0 left-0 w-3/4 max-w-xs h-full bg-base-100 shadow-lg z-40 p-4 flex flex-col gap-2 transform transition-transform duration-300 md:hidden ${isDrawerOpen ? "translate-x-0" : "-translate-x-full"}`}>
                {user && !loading && (
                    <div className="mb-4 p-3 border-b border-base-300 flex flex-col items-center">
                        <UserAvatarMobile />
                        <p className="text-center font-semibold text-lg text-base-content">{displayName}</p>
                    </div>
                )}
                {!user && loading && (
                    <div className="flex justify-center p-3"><span className="loading loading-spinner loading-sm"></span></div>
                )}


                {navLinks.map(({ icon, title, id, to }) => (
                    <NavLink
                        key={id} to={to} onClick={handleNavLinkClick}
                        className={({ isActive }) => `flex items-center w-full text-left gap-3 p-3 hover:bg-base-200 rounded transition text-base ${isActive ? 'bg-primary text-primary-content font-semibold' : 'text-base-content'}`}
                    >
                        <span className="text-xl">{icon}</span>
                        <span>{title}</span>
                    </NavLink>
                ))}
                <hr className="my-2 border-base-300" />
                <button onClick={toggleDarkMode} className="flex items-center w-full text-left gap-3 p-3 hover:bg-base-200 rounded transition text-base text-base-content">
                    {darkMode ? <MdDarkMode /> : <MdLightMode />}
                    <span>Toggle Theme</span>
                </button>
                <div className="mt-auto">
                    {loading && !user ? null : user ? (
                        <button onClick={async () => { await handleLogout(); toggleDrawer(); }} className="flex items-center w-full text-left gap-3 p-3 text-error hover:bg-error-focus hover:text-error-content rounded transition text-base">
                            <BiLogOut />
                            <span>Logout</span>
                        </button>
                    ) : (
                        <NavLink to="/auth/login" onClick={handleNavLinkClick} className="flex items-center w-full text-left gap-3 p-3 bg-primary text-primary-content rounded hover:bg-primary-focus transition text-base">
                            <BiLogIn />
                            <span>Login</span>
                        </NavLink>
                    )}
                </div>
            </div>
        </>
    );
};

export default Navbar;