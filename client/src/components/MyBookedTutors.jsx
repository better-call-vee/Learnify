
import React, { useState, useEffect, useContext } from 'react';
import useAxiosSecure from '../hooks/useAxiosSecure';
import AuthContext from '../provider/AuthContext';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loading from './Loading';
import { FaStar } from 'react-icons/fa';
import { Fade } from "react-awesome-reveal";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";

const BookingCard = ({ booking, onReview }) => {
    const [isReviewed, setIsReviewed] = useState(false);

    const handleReviewClick = () => {
        onReview(booking.tutorialId, () => setIsReviewed(true));
    };

    return (
        <Fade cascade damping={0.1} triggerOnce>
            <div className="card lg:card-side bg-[var(--color-bgc)] text-[var(--color-txt)] shadow-lg hover:shadow-cyan-500/20 transition-all duration-300">
                <figure className="lg:w-1/3">
                    <img src={booking.image} alt={booking.language} className="w-full h-full object-cover" />
                </figure>
                <div className="card-body lg:w-2/3">
                    <h2 className="card-title text-2xl font-bold">{booking.language}</h2>
                    <p className="text-lg text-[var(--color-primary)] font-semibold">${parseFloat(booking.price).toFixed(2)}</p>
                    <p className="text-sm opacity-70">Booking Date: {new Date(booking.bookingDate).toLocaleDateString()}</p>

                    <div className="card-actions justify-end mt-4">
                        <button
                            data-tooltip-id="review-tooltip"
                            data-tooltip-content={isReviewed ? "You've already reviewed this!" : "Leave a review to help others"}
                            onClick={handleReviewClick}
                            disabled={isReviewed}
                            className={`btn btn-primary text-primary-content ${isReviewed ? 'btn-disabled' : ''}`}
                        >
                            <FaStar />
                            {isReviewed ? 'Reviewed' : 'Leave a Review'}
                        </button>
                    </div>
                </div>
            </div>
        </Fade>
    );
};


export default function MyBookedTutors() {
    const { user, loading: authIsLoading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const [bookings, setBookings] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user) {
            axiosSecure.get('/my-bookings')
                .then(res => {
                    if (res.data.success) {
                        setBookings(res.data.bookings);
                    } else {
                        throw new Error(res.data.message);
                    }
                })
                .catch(err => {
                    console.error("Failed to fetch bookings:", err);
                    setError(err.response?.data?.message || err.message);
                })
                .finally(() => setIsLoading(false));
        }
    }, [user, axiosSecure]);

    const handleReview = (tutorialId, onSuccessfulReview) => {
        Swal.fire({
            title: "Confirm Review",
            text: "Are you sure you want to submit a review? This action cannot be undone.",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Yes, submit!",
            background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
            color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.patch(`/tutorials/${tutorialId}/review`)
                    .then(res => {
                        if (res.data.success) {
                            Swal.fire("Thank You!", "Your review has been counted.", "success");
                            onSuccessfulReview();
                        } else {
                            throw new Error(res.data.message);
                        }
                    })
                    .catch(err => {
                        console.error("Review submission failed:", err);
                        Swal.fire("Error", err.response?.data?.message || "Could not submit review.", "error");
                    });
            }
        });
    };

    if (isLoading || authIsLoading) {
        return <Loading />;
    }

    if (error) {
        return <div className="text-center p-8 text-[var(--color-error)] min-h-screen">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-[var(--color-bbgc)] p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <Fade direction="down" triggerOnce>
                    <h1 className="text-4xl font-bold mb-2 text-center text-[var(--color-primary)]">My Booked Sessions</h1>
                    <p className="text-center max-w-2xl mx-auto mb-10 text-[var(--color-txt)] opacity-80">
                        Here are all the learning sessions you've booked. Leave a review to share your experience!
                    </p>
                </Fade>

                {bookings.length > 0 ? (
                    <div className="space-y-6">
                        {bookings.map(booking => (
                            <BookingCard key={booking._id} booking={booking} onReview={handleReview} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-10 card bg-[var(--color-bgc)]">
                        <p className="text-lg font-semibold text-[var(--color-txt)]">No Booked Tutors Yet</p>
                        <p className="text-[var(--color-txt)] opacity-70">
                            Go to the <Link to="/find-tutors" className="link link-primary">Find Tutors</Link> page to book your first session!
                        </p>
                    </div>
                )}
            </div>
            <Tooltip id="review-tooltip" />
        </div>
    );
}