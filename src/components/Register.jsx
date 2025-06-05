import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthContext from "../provider/AuthContext";
import Swal from "sweetalert2";
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaImage, FaLock } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import Loading from "./Loading";

export default function Register() {
    const [nameError, setNameError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [componentIsLoading, setComponentIsLoading] = useState(false);

    const { createUser, signInWithGoogle, updateUserProfile, loading: authIsLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    const validatePassword = (pwd) => {
        const errs = [];
        if (pwd.length < 6) errs.push("at least 6 characters");
        if (!/[A-Z]/.test(pwd)) errs.push("an uppercase letter");
        if (!/[a-z]/.test(pwd)) errs.push("a lowercase letter");
        return errs;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setNameError("");
        setPasswordError("");
        setComponentIsLoading(true);

        const form = e.target;
        const name = form.name.value;
        const email = form.email.value;
        const photoURL = form.photoURL.value;
        const password = form.password.value;

        if (name.trim().length < 3) {
            setNameError("Name must be at least 3 characters.");
            setComponentIsLoading(false);
            return;
        }

        const pwdErrs = validatePassword(password);
        if (pwdErrs.length) {
            setPasswordError(`Password must contain ${pwdErrs.join(", ")}.`);
            setComponentIsLoading(false);
            return;
        }

        try {
            const result = await createUser(email, password);

            await updateUserProfile({
                displayName: name.trim(),
                photoURL: photoURL.trim(),
            });

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Account Created Successfully!",
                text: "Welcome to Learnify!",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
                color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
            }).then(() => {
                navigate("/");
            });

        } catch (err) {
            console.error("Firebase registration error:", err.code, err.message);
            let friendlyMessage = "Registration failed. Please try again.";
            if (err.code === 'auth/email-already-in-use') {
                friendlyMessage = "This email is already registered. Please try logging in.";
            } else if (err.code === 'auth/invalid-email') {
                friendlyMessage = "The email address is not valid.";
            } else if (err.code === 'auth/weak-password') {
                friendlyMessage = "The password is too weak.";
            }
            setPasswordError(friendlyMessage);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Registration Error",
                text: friendlyMessage,
                background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
                color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
            });
        } finally {
            setComponentIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setPasswordError("");
        setNameError("");
        setComponentIsLoading(true);

        try {
            const result = await signInWithGoogle();

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Signed in with Google!",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
                background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
                color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
            }).then(() => {
                navigate("/");
            });
        } catch (err) {
            console.error("Firebase Google Sign-In error:", err.code, err.message);
            let friendlyMessage = "Google Sign-In failed. Please try again.";
            if (err.code === 'auth/popup-closed-by-user') {
                friendlyMessage = "Google Sign-In process was cancelled.";
            } else if (err.code === 'auth/account-exists-with-different-credential') {
                friendlyMessage = "An account already exists with this email using a different sign-in method. Try logging in with that method.";
            }
            setPasswordError(friendlyMessage);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Google Sign-In Error",
                text: friendlyMessage,
                background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
                color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
            });
        } finally {
            setComponentIsLoading(false);
        }
    };

    if (authIsLoading || componentIsLoading) return <Loading />;

    return (
        <div className="flex justify-center items-center min-h-screen bg-[var(--color-bbgc)] p-4">
            <div className="card bg-[var(--color-bgc)] text-[var(--color-txt)] w-full max-w-md shadow-2xl p-6 sm:p-8 rounded-lg">
                <h2 className="text-3xl text-center font-bold mb-6 text-[var(--color-primary)]">
                    Create Your Account
                </h2>
                <form onSubmit={handleRegister} className="space-y-5">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">Full Name</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaUser className="h-4 w-4 text-[var(--color-txt)] opacity-40" />
                            </span>
                            <input id="name" name="name" type="text" required className="input-style pl-10 placeholder:text-opacity-50" placeholder="John Doe" />
                        </div>
                        {nameError && <p className="text-xs text-[var(--color-error)] mt-1">{nameError}</p>}
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">Email Address</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaEnvelope className="h-4 w-4 text-[var(--color-txt)] opacity-40" />
                            </span>
                            <input id="email" name="email" type="email" required className="input-style pl-10 placeholder:text-opacity-50" placeholder="you@example.com" />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="photoURL" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">Photo URL</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaImage className="h-4 w-4 text-[var(--color-txt)] opacity-40" />
                            </span>
                            <input id="photoURL" name="photoURL" type="url" required className="input-style pl-10 placeholder:text-opacity-50" placeholder="https://example.com/your-image.png" />
                        </div>
                    </div>

                    <div className="relative">
                        <label htmlFor="password" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">Password</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaLock className="h-4 w-4 text-[var(--color-txt)] opacity-40" />
                            </span>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="input-style pl-10 pr-10 placeholder:text-opacity-50"
                                placeholder="•••••••• (min. 6 chars, 1 upper, 1 lower)"
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center focus:outline-none" aria-label={showPassword ? "Hide password" : "Show password"}>
                                {showPassword ?
                                    <FaEyeSlash size={18} className="text-[var(--color-txt)] opacity-60 hover:opacity-90" /> :
                                    <FaEye size={18} className="text-[var(--color-txt)] opacity-60 hover:opacity-90" />}
                            </button>
                        </div>
                        {passwordError && <p className="text-xs text-[var(--color-error)] mt-1">{passwordError}</p>}
                    </div>

                    <button
                        type="submit"
                        disabled={componentIsLoading || authIsLoading}
                        className="btn w-full bg-[var(--color-primary)] hover:opacity-80 text-white font-semibold transition duration-150 py-2.5 rounded-md disabled:opacity-60"
                    >
                        {componentIsLoading || authIsLoading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="divider text-xs text-[var(--color-txt)] opacity-70 my-5 before:bg-[var(--color-divider)] after:bg-[var(--color-divider)]">OR</div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={componentIsLoading || authIsLoading}
                    className="btn w-full flex items-center justify-center gap-2 mb-6 border border-[var(--color-divider)] text-[var(--color-txt)] hover:bg-[var(--icon-hover-bg)] transition duration-150 py-2.5 rounded-md disabled:opacity-60"
                >
                    <FcGoogle size={22} /> Continue with Google
                </button>

                <p className="text-center text-sm text-[var(--color-txt)] opacity-80">
                    Already have an account?{" "}
                    <Link to="/auth/login" className="font-semibold text-[var(--color-primary)] hover:underline">
                        Login
                    </Link>
                </p>
            </div>
        </div>
    );
}
