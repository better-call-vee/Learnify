import React, { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

import HomeLayout from '../layouts/HomeLayout';
import AuthLayout from '../layouts/AuthLayout';

import ErrorPage from '../components/ErrorPage';
import SuspenseFallback from '../components/SuspenseFallback';

import PrivateRoute from '../provider/PrivateRoute';

const Home = lazy(() => import('../components/Home'));
const Login = lazy(() => import('../components/Login'));
const Register = lazy(() => import('../components/Register'));
const ForgotPass = lazy(() => import('../components/ForgotPass'));
const FindTutors = lazy(() => import('../components/FindTutors')); // For /find-tutors and /find-tutors/:category
const TutorDetails = lazy(() => import('../components/TutorDetails')); // For /tutorials/:id (Private)
const AddTutorials = lazy(() => import('../components/AddTutorials')); // For /add-tutorials (Private)
const MyTutorials = lazy(() => import('../components/MyTutorials'));   // For /my-tutorials (Private)
const UpdateTutorial = lazy(() => import('../components/UpdateTutorial')); // For /my-tutorials/update/:tutorialId (Private)
const MyBookedTutors = lazy(() => import('../components/MyBookedTutors')); // For /my-booked-tutors (Private)


const router = createBrowserRouter([
    {
        path: '/',
        element: <HomeLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Suspense fallback={<SuspenseFallback />}><Home /></Suspense>
            },
            {
                path: 'find-tutors', // Shows all tutors/tutorials
                element: <Suspense fallback={<SuspenseFallback />}><FindTutors /></Suspense>,
            },
            {
                path: 'find-tutors/:categoryName', // Shows tutors/tutorials by category
                element: <Suspense fallback={<SuspenseFallback />}><FindTutors /></Suspense>,
                // The FindTutors component would need to read the :categoryName param
            },
            {
                path: 'tutorials/:tutorialId', // Tutor details page
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<SuspenseFallback />}>
                            <TutorDetails />
                        </Suspense>
                    </PrivateRoute>
                ),
                // Optional: Loader to fetch tutorial details
                // loader: async ({ params }) => fetchTutorialDetailsById(params.tutorialId),
            },
            {
                path: 'add-tutorials',
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<SuspenseFallback />}>
                            <AddTutorials />
                        </Suspense>
                    </PrivateRoute>
                ),
            },
            {
                path: 'my-tutorials',
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<SuspenseFallback />}>
                            <MyTutorials />
                        </Suspense>
                    </PrivateRoute>
                ),
            },
            {
                path: 'my-tutorials/update/:tutorialId', // Route for updating a specific tutorial
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<SuspenseFallback />}>
                            <UpdateTutorial />
                        </Suspense>
                    </PrivateRoute>
                ),
                // Optional: Loader to fetch tutorial data for editing
                // loader: async ({ params }) => fetchTutorialDetailsById(params.tutorialId),
            },
            {
                path: 'my-booked-tutors',
                element: (
                    <PrivateRoute>
                        <Suspense fallback={<SuspenseFallback />}>
                            <MyBookedTutors />
                        </Suspense>
                    </PrivateRoute>
                ),
            },
            // You can add other public or private components here
        ],
    },
    {
        path: '/auth',
        element: <AuthLayout />,
        errorElement: <ErrorPage />, // Can have a specific error element for auth routes too
        children: [
            {
                path: 'login',
                element: <Suspense fallback={<SuspenseFallback />}><Login /></Suspense>
            },
            {
                path: 'register',
                element: <Suspense fallback={<SuspenseFallback />}><Register /></Suspense>
            },
            {
                path: 'forgot',
                element: <Suspense fallback={<SuspenseFallback />}><ForgotPass /></Suspense>
            },
        ],
    },
    {
        // Catch-all for 404 Not Found components
        path: '*',
        element: <ErrorPage status={404} message="Page Not Found" />,
    },
]);

export default router;