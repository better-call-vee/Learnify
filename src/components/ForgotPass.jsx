import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';

export default function ForgotPass() {
    const { state } = useLocation();
    const [email, setEmail] = useState(state?.email || '');

    const handleReset = (e) => {
        e.preventDefault();
        window.location.href = 'https://mail.google.com/mail/u/0/?tab=rm&ogbl#inbox';
    };

    return (
        <div className="min-h-screen flex flex-col text-white bg-bgc rounded-2xl">

            <div className="flex-grow flex flex-col items-center justify-center p-6">
                <div className="w-full max-w-md bg-gray-800 rounded-2xl p-8 shadow-lg border-2 border-sky-400">
                    <h2 className="text-2xl font-bold text-sky-400 mb-4 text-center">
                        Reset Your Password
                    </h2>
                    <p className="text-gray-300 mb-6 text-center">
                        Enter your email and we’ll send you a reset link.
                    </p>
                    <form onSubmit={handleReset} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                className="w-full bg-gray-900 border border-sky-400 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2 rounded-full cursor-pointer bg-red-500 hover:bg-red-600 transition font-semibold text-white"
                        >
                            Reset Password
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}