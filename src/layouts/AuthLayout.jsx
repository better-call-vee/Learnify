import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar';

const AuthLayout = () => (
    <div className="min-h-screen">
        <header className="mx-auto">
            <Navbar />
        </header>
        <main className="w-11/12 mx-auto py-5">
            <Outlet />
        </main>
    </div>
);

export default AuthLayout;