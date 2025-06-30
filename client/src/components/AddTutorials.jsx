import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../provider/AuthContext';
import useAxiosSecure from '../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import Loading from '../components/Loading';
import Lottie from "lottie-react";

export default function AddTutorials() {
    const { user, loading: authIsLoading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    const [addTutorLottieData, setAddTutorLottieData] = useState(null);
    const [addTutorLottieError, setAddTutorLottieError] = useState(null);

    useEffect(() => {
        fetch('/add-tutor.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to fetch add-tutor Lottie: ${response.status} ${response.statusText}`);
                }
                return response.json();
            })
            .then(data => {
                setAddTutorLottieData(data);
            })
            .catch(error => {
                console.error("Error loading add-tutor Lottie animation:", error);
                setAddTutorLottieError(error.message);
            });
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");
        setIsSubmitting(true);

        const form = event.target;
        const tutorialData = {
            image: form.image.value.trim(),
            language: form.language.value.trim(),
            price: form.price.value,
            description: form.description.value.trim(),
        };

        if (!tutorialData.image || !tutorialData.language || !tutorialData.price || !tutorialData.description) {
            setFormError("Please fill in all required fields.");
            setIsSubmitting(false);
            return;
        }
        if (parseFloat(tutorialData.price) < 0) {
            setFormError("Price cannot be negative.");
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await axiosSecure.post('/tutorials', tutorialData);

            if (response.data.success) {
                Swal.fire({
                    title: 'Success!',
                    text: 'Tutorial added successfully!',
                    icon: 'success',
                    timer: 2000,
                    showConfirmButton: false,
                    background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
                    color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
                });
                navigate('/my-tutorials');
            } else {
                throw new Error(response.data.message || 'Failed to add tutorial (server indicated failure).');
            }
        } catch (error) {
            let displayErrorMessage = 'Could not add tutorial. Please try again.';
            if (error.response) {
                displayErrorMessage = error.response.data?.message || `Server error: ${error.response.status}. Please try again.`;
            } else if (error.request) {
                displayErrorMessage = "No response from server. Please check your internet connection and try again.";
            } else {
                displayErrorMessage = `Request setup error: ${error.message}. Please try again.`;
            }

            setFormError(displayErrorMessage);
            Swal.fire({
                title: 'Submission Error!',
                text: displayErrorMessage,
                icon: 'error',
                background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
                color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (authIsLoading && !user) {
        return <Loading />;
    }

    if (!user) {
        return (
            <div className="text-center p-10 min-h-screen bg-[var(--color-bbgc)] flex flex-col justify-center items-center">
                <p className="text-xl text-[var(--color-error)]">Access Denied</p>
                <p className="text-[var(--color-txt)]">Please log in to add a tutorial.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--color-bbgc)] py-8 px-4 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full mx-auto card bg-[var(--color-bgc)] text-[var(--color-txt)] p-6 sm:p-8 shadow-xl rounded-lg">

                <div className="w-full flex justify-center mb-6 md:mb-8">
                    <div className="w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64">
                        {addTutorLottieError ? (
                            <div className="text-center text-[var(--color-error)] text-sm">Could not load animation.</div>
                        ) : addTutorLottieData ? (
                            <Lottie animationData={addTutorLottieData} loop={true} autoplay={true} />
                        ) : (
                            <div className="text-center text-[var(--color-txt)] opacity-75 flex justify-center items-center h-full">
                                <Loading />
                            </div>
                        )}
                    </div>
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-center mb-6 text-[var(--color-primary)]">
                    Share Your Knowledge
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">
                            Tutorial Cover Image URL:
                        </label>
                        <input type="url" id="image" name="image" required className="input-style placeholder:text-opacity-70" placeholder="https://example.com/your-tutorial-image.png" />
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">
                            Language You Teach:
                        </label>
                        <input type="text" id="language" name="language" required className="input-style placeholder:text-opacity-70" placeholder="e.g., English, Advanced Spanish Grammar" />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">
                            Price (per session/hour, in USD):
                        </label>
                        <input type="number" id="price" name="price" step="0.01" min="0" required className="input-style placeholder:text-opacity-70" placeholder="e.g., 25.00" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">
                            Tutorial Description:
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            required
                            className="input-style placeholder:text-opacity-70 h-auto"
                            placeholder="Describe what this tutorial covers, your teaching approach, what students will learn, prerequisites, etc."
                        ></textarea>
                    </div>

                    {formError && <p className="text-sm text-[var(--color-error)] text-center p-2 bg-[var(--color-error)] bg-opacity-10 rounded-md">{formError}</p>}

                    <button
                        type="submit"
                        className="btn btn-primary w-full text-primary-content disabled:opacity-70 py-3 text-base font-semibold"
                        disabled={isSubmitting || authIsLoading}
                    >
                        {isSubmitting ? (
                            <span className="loading loading-spinner loading-xs mr-2"></span>
                        ) : null}
                        {isSubmitting ? 'Submitting Tutorial...' : 'Add My Tutorial'}
                    </button>
                </form>
            </div>
        </div>
    );
}