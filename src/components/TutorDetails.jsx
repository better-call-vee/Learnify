// src/components/TutorDetails.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../hooks/useAxiosSecure';
import AuthContext from '../provider/AuthContext';
import Swal from 'sweetalert2';
import Loading from './Loading';
import { FaGlobe, FaCommentDots, FaUserGraduate, FaDollarSign, FaBookmark } from 'react-icons/fa';

export default function TutorDetails() {
    const { tutorialId } = useParams();
    const { user, loading: authIsLoading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    const [tutorial, setTutorial] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isBooking, setIsBooking] = useState(false);

    useEffect(() => {
        // This is a public route, so we use a plain axios instance for the initial fetch.
        // useAxiosSecure will be used for the booking action.
        axiosSecure.get(`/tutorials/${tutorialId}`)
            .then(response => {
                if (response.data.success) {
                    setTutorial(response.data.tutorial);
                } else {
                    throw new Error(response.data.message || "Failed to fetch tutorial details.");
                }
            })
            .catch(err => {
                console.error("Error fetching tutorial details:", err);
                setError(err.response?.data?.message || err.message);
            })
            .finally(() => setIsLoading(false));
    }, [tutorialId, axiosSecure]);

    const handleBookNow = () => {
        // Ensure user is logged in
        if (!user) {
            Swal.fire({
                title: 'Login Required',
                text: "You need to log in before you can book a tutorial.",
                icon: 'warning',
                showCancelButton: true,
                confirmButtonText: 'Go to Login',
                cancelButtonText: 'Cancel'
            }).then((result) => {
                if (result.isConfirmed) {
                    navigate('/auth/login', { state: { from: location } }); // Redirect to login, saving current location
                }
            });
            return;
        }

        // Confirmation dialog
        Swal.fire({
            title: `Book this tutorial?`,
            html: `You are about to book a session for <strong>${tutorial.language}</strong> with <strong>${tutorial.tutorName}</strong> for <strong>$${tutorial.price}</strong>.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, book it!',
            background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
            color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
        }).then((result) => {
            if (result.isConfirmed) {
                performBooking();
            }
        });
    };

    const performBooking = async () => {
        setIsBooking(true);
        const bookingData = {
            tutorialId: tutorial._id,
            image: tutorial.image,
            language: tutorial.language,
            price: tutorial.price,
            tutorEmail: tutorial.tutorEmail,
        };

        try {
            // Use axiosSecure for this private action
            const response = await axiosSecure.post('/bookings', bookingData);
            if (response.data.success) {
                Swal.fire('Booked!', 'Your tutorial session has been confirmed.', 'success');
                navigate('/my-booked-tutors'); // Redirect to their bookings page
            } else {
                throw new Error(response.data.message || "Booking failed.");
            }
        } catch (err) {
            console.error("Booking error:", err);
            Swal.fire('Error!', err.response?.data?.message || err.message || 'Could not complete booking.', 'error');
        } finally {
            setIsBooking(false);
        }
    };

    if (isLoading || authIsLoading) {
        return <Loading />;
    }

    if (error) {
        return <div className="text-center p-8 text-[var(--color-error)] min-h-screen">Error: {error}</div>;
    }

    if (!tutorial) {
        return <div className="text-center p-8 min-h-screen">Tutorial not found.</div>;
    }

    return (
        <div className="min-h-screen bg-[var(--color-bbgc)] p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="card lg:card-side bg-[var(--color-bgc)] text-[var(--color-txt)] shadow-2xl">
                    <figure className="lg:w-1/2">
                        <img src={tutorial.image} alt={`${tutorial.language} tutorial cover`} className="w-full h-full object-cover" />
                    </figure>
                    <div className="card-body lg:w-1/2">
                        <div className="badge badge-secondary font-semibold">{tutorial.language}</div>
                        <h1 className="card-title text-3xl md:text-4xl font-bold mt-2">{tutorial.tutorName}</h1>
                        <p className="text-sm opacity-70 border-b border-[var(--color-divider)] pb-4">
                            Your expert tutor for {tutorial.language}.
                        </p>

                        <div className="my-4 space-y-3">
                            <div className="flex items-center gap-3"><FaGlobe className="text-primary" /><span>Teaches: {tutorial.language}</span></div>
                            <div className="flex items-center gap-3"><FaDollarSign className="text-accent" /><span>Price: ${parseFloat(tutorial.price).toFixed(2)} / session</span></div>
                            <div className="flex items-center gap-3"><FaCommentDots className="text-info" /><span>Total Reviews: {tutorial.reviewCount}</span></div>
                        </div>

                        <p className="text-base flex-grow">{tutorial.description}</p>

                        <div className="card-actions justify-end mt-4">
                            <button
                                className="btn btn-primary text-primary-content w-full sm:w-auto"
                                onClick={handleBookNow}
                                disabled={isBooking}
                            >
                                {isBooking ? <span className="loading loading-spinner"></span> : <FaBookmark className="mr-2" />}
                                {isBooking ? 'Booking...' : 'Book Now'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}