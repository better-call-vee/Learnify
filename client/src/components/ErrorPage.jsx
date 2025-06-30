import React from 'react';
import { Link } from 'react-router-dom';
export default function ErrorPage() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-900 text-white">

            <div className="flex-grow flex flex-col items-center justify-center px-4">
                <div className="mb-8 w-full max-w-lg">
                </div>

                <div className="bg-gray-800 rounded-2xl p-8 shadow-2xl border-2 border-red-500 max-w-md text-center">
                    <h1 className="text-6xl font-extrabold mb-4 text-red-500 animate-pulse">
                        4<span className="text-white">0</span>4
                    </h1>
                    <h2 className="text-2xl font-bold mb-2 text-sky-400">
                        Page Not Found
                    </h2>
                    <p className="text-gray-300 mb-6">
                        Whoops! It seems the page you’re looking for doesn’t exist or has moved.
                    </p>
                    <Link
                        to="/"
                        className="inline-block px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-full transition-colors shadow-md"
                    >
                        Go Back Home
                    </Link>
                </div>
            </div>
        </div>
    );
}