// src/pages/UpdateTutorial.jsx
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../hooks/useAxiosSecure';
import AuthContext from '../provider/AuthContext';
import Swal from 'sweetalert2';
import Loading from './Loading';

export default function UpdateTutorial() {
    const { tutorialId } = useParams(); // Get the tutorial ID from the URL
    const { user, loading: authIsLoading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    const [tutorial, setTutorial] = useState(null); // To store the tutorial data
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formError, setFormError] = useState("");

    // Step 1: Fetch the existing tutorial data
    useEffect(() => {
        setIsLoading(true);
        axiosSecure.get(`/tutorials/${tutorialId}`)
            .then(response => {
                if (response.data.success) {
                    // Check if the logged-in user is the owner of this tutorial
                    if (user?.uid === response.data.tutorial.tutorFirebaseUid) {
                        setTutorial(response.data.tutorial);
                    } else {
                        // If not the owner, show an error and redirect
                        Swal.fire('Access Denied!', "You can only edit your own tutorials.", 'error');
                        navigate('/my-tutorials');
                    }
                } else {
                    throw new Error(response.data.message || 'Failed to fetch tutorial data.');
                }
            })
            .catch(error => {
                console.error("Error fetching tutorial for update:", error);
                Swal.fire('Error!', error.response?.data?.message || error.message || 'Could not fetch tutorial data.', 'error');
                navigate('/my-tutorials');
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [tutorialId, user, axiosSecure, navigate]);

    // Handle the update form submission
    const handleSubmit = async (event) => {
        event.preventDefault();
        setFormError("");
        setIsSubmitting(true);

        const form = event.target;
        const updatedData = {
            image: form.image.value.trim(),
            language: form.language.value.trim(),
            price: form.price.value,
            description: form.description.value.trim(),
        };

        // Basic validation
        if (!updatedData.image || !updatedData.language || !updatedData.price || !updatedData.description) {
            setFormError("Please fill in all required fields.");
            setIsSubmitting(false);
            return;
        }
        if (parseFloat(updatedData.price) < 0) {
            setFormError("Price cannot be negative.");
            setIsSubmitting(false);
            return;
        }

        try {
            // Make a PUT request to update the tutorial
            const response = await axiosSecure.put(`/tutorials/${tutorialId}`, updatedData);

            if (response.data.success) {
                Swal.fire('Updated!', 'Your tutorial has been updated successfully.', 'success');
                navigate('/my-tutorials'); // Navigate back to the list
            } else {
                throw new Error(response.data.message || 'Failed to update tutorial.');
            }
        } catch (error) {
            console.error("Error updating tutorial:", error);
            const errorMessage = error.response?.data?.message || error.message || 'Could not update tutorial.';
            setFormError(errorMessage);
            Swal.fire('Update Failed!', errorMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || authIsLoading) {
        return <Loading />;
    }

    if (!tutorial) {
        // This can show if there was an error fetching or if the user was redirected
        return <div className="text-center p-8 text-[var(--color-error)]">Could not load tutorial for editing.</div>;
    }

    return (
        <div className="min-h-screen bg-[var(--color-bbgc)] py-8 px-4">
            <div className="max-w-2xl mx-auto card bg-[var(--color-bgc)] text-[var(--color-txt)] p-6 sm:p-8 shadow-xl rounded-lg">
                <h2 className="text-3xl font-bold text-center mb-6 text-[var(--color-primary)]">
                    Update Tutorial
                </h2>

                {/* Non-editable fields display */}
                <div className="space-y-2 p-4 mb-6 border border-[var(--color-divider)] rounded-lg bg-base-100/50">
                    <p className="text-sm"><strong>Tutor Name:</strong> {tutorial.tutorName} (Not Editable)</p>
                    <p className="text-sm"><strong>Tutor Email:</strong> {tutorial.tutorEmail} (Not Editable)</p>
                    <p className="text-sm"><strong>Current Reviews:</strong> {tutorial.reviewCount} (Not Editable)</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="image" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">
                            Tutorial Cover Image URL:
                        </label>
                        <input type="url" id="image" name="image" defaultValue={tutorial.image} required className="input-style placeholder:text-opacity-70" />
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">
                            Language You Teach:
                        </label>
                        <input type="text" id="language" name="language" defaultValue={tutorial.language} required className="input-style placeholder:text-opacity-70" />
                    </div>
                    <div>
                        <label htmlFor="price" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">
                            Price (per session/hour, in USD):
                        </label>
                        <input type="number" id="price" name="price" defaultValue={tutorial.price} step="0.01" min="0" required className="input-style placeholder:text-opacity-70" />
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-[var(--color-txt)] opacity-80 mb-1">
                            Tutorial Description:
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            defaultValue={tutorial.description}
                            rows="6"
                            required
                            className="input-style placeholder:text-opacity-70 h-auto"
                        ></textarea>
                    </div>

                    {formError && <p className="text-sm text-[var(--color-error)] text-center p-2 bg-[var(--color-error)] bg-opacity-10 rounded-md">{formError}</p>}

                    <button
                        type="submit"
                        className="btn btn-primary w-full text-primary-content disabled:opacity-70 py-3 text-base font-semibold"
                        disabled={isSubmitting || authIsLoading}
                    >
                        {isSubmitting ? 'Updating...' : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
}