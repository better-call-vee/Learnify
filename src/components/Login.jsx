import React, { useState, useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import AuthContext from "../provider/AuthContext";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Swal from "sweetalert2";
import Loading from "./Loading";


export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [componentIsLoading, setComponentIsLoading] = useState(false); // Renamed to avoid conflict

    // loading from AuthContext indicates Firebase SDK's auth state loading
    const { signIn, signInWithGoogle, loading: authIsLoading } = useContext(AuthContext);
    const location = useLocation();
    const navigate = useNavigate();
    const from = location.state?.from?.pathname || "/";

    

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");
        setComponentIsLoading(true);

        try {
            const result = await signIn(email, password); // Uses Firebase signIn from AuthContext
            // Firebase onAuthStateChanged in AuthProvider will set the user state.
            console.log("Firebase email/password login successful for:", result.user?.email);

        

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Logged in successfully!",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            }).then(() => {
                navigate(from, { replace: true });
            });
        } catch (err) {
            console.error("Firebase login error:", err.code, err.message);
            let friendlyMessage = "Login failed. Please check your credentials.";
            if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                friendlyMessage = "Invalid email or password.";
            } else if (err.code === 'auth/invalid-email') {
                friendlyMessage = "The email address is not valid.";
            } else if (err.code === 'auth/too-many-requests') {
                friendlyMessage = "Access temporarily disabled due to too many failed login attempts. Please reset your password or try again later.";
            }
            setError(friendlyMessage);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Login Error",
                text: friendlyMessage,
            });
        } finally {
            setComponentIsLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setError("");
        setComponentIsLoading(true);
        try {
            const result = await signInWithGoogle(); // Uses Firebase signInWithGoogle from AuthContext
            console.log("Firebase Google Sign-In successful for:", result.user?.email);

            //  re-enable custom backend sync:
            // if (result.user) {
            //     await updateLastSignInOnCustomBackend(result.user);
            // }

            Swal.fire({
                position: "center",
                icon: "success",
                title: "Logged in with Google!",
                showConfirmButton: false,
                timer: 1500,
                timerProgressBar: true,
            }).then(() => {
                navigate(from, { replace: true });
            });
        } catch (err) {
            console.error("Firebase Google Sign-In error:", err.code, err.message);
            let friendlyMessage = "Google Sign-In failed. Please try again.";
            if (err.code === 'auth/popup-closed-by-user') {
                friendlyMessage = "Google Sign-In process was cancelled.";
            } else if (err.code === 'auth/account-exists-with-different-credential') {
                friendlyMessage = "An account already exists with this email using a different sign-in method.";
            }
            setError(friendlyMessage);
            Swal.fire({
                position: "center",
                icon: "error",
                title: "Google Sign-In Error",
                text: friendlyMessage,
            });
        } finally {
            setComponentIsLoading(false);
        }
    };

    if (authIsLoading || componentIsLoading) {
        return <Loading />;
    }

    return (
        <div className="flex bg-bgc justify-center rounded-3xl items-center min-h-screen px-4">
            <div className="card bg-bgc text-white w-full max-w-md shadow-2xl p-6 sm:p-8 rounded-lg">
                <h2 className="text-3xl text-center font-bold mb-6 text-sky-400">
                    Login to Your Account
                </h2>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-txt mb-1" htmlFor="emailInput">
                            Email Address
                        </label>
                        <input
                            id="emailInput"
                            name="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="input w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 rounded-md py-2.5 px-3"
                            placeholder="you@example.com"
                            required
                        />
                    </div>

                    <div className="relative">
                        <label className="block text-sm font-medium text-txt mb-1" htmlFor="passwordInput">
                            Password
                        </label>
                        <input
                            id="passwordInput"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="input w-full bg-gray-700 border border-gray-600 text-white placeholder-gray-400 pr-10 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 rounded-md py-2.5 px-3"
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-sky-300 focus:outline-none"
                            style={{ top: 'calc(1.25rem + 1px + 0.5rem)' }} // Manual adjustment for alignment; consider flex wrapper for label & input
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                        </button>
                    </div>

                    {error && <p className="text-red-400 text-xs text-center pt-1">{error}</p>}

                    <button
                        type="submit"
                        disabled={componentIsLoading || authIsLoading}
                        className="btn w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold transition duration-150 rounded-md py-2.5 disabled:opacity-70"
                    >
                        {componentIsLoading ? 'Logging In...' : 'Login'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link
                        to="/auth/forgot" // Ensure this route is in your router.jsx
                        state={{ email }} // Pass email to forgot password page if needed
                        className="text-sm text-sky-400 hover:underline"
                    >
                        Forgot Password?
                    </Link>
                </div>

                <div className="divider text-gray-500 text-xs my-6 before:bg-gray-700 after:bg-gray-700">OR</div>

                <button
                    onClick={handleGoogleSignIn}
                    disabled={componentIsLoading || authIsLoading}
                    className="btn btn-outline w-full flex items-center justify-center gap-2 mb-6 border-gray-600 hover:border-sky-500 text-txt hover:text-sky-400 transition duration-150 rounded-md py-2.5 disabled:opacity-70"
                >
                    <FcGoogle size={22} />
                    {componentIsLoading ? 'Processing...' : 'Continue with Google'}
                </button>

                <p className="text-center text-sm text-gray-400">
                    Don’t have an account?{" "}
                    <Link to="/auth/register" className="font-semibold text-sky-400 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}