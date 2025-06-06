// src/components/FindTutors.jsx
import React, { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import Loading from './Loading';
import { FaSearch, FaGlobe, FaCommentDots } from 'react-icons/fa';

const API_BASE_URL = import.meta.env.VITE_API_URL || "https://learnify-psi-ten.vercel.app";

const TutorRow = ({ tutorial }) => (
    <div className="flex flex-col sm:flex-row items-center bg-[var(--color-bgc)] text-[var(--color-txt)] shadow-md hover:shadow-xl transition-all duration-300 rounded-lg overflow-hidden my-4">
        {/* Tutor Image */}
        <div className="w-full sm:w-48 h-48 sm:h-full flex-shrink-0">
            <img src={tutorial.image} alt={`${tutorial.language} tutorial cover`} className="w-full h-full object-cover" />
        </div>

        {/* Tutor Info */}
        <div className="p-5 flex flex-col justify-between w-full">
            <div>
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <p className="text-sm opacity-70 flex items-center gap-1.5"><FaGlobe /> Language</p>
                        <h2 className="text-xl font-bold text-[var(--color-primary)]">{tutorial.language}</h2>
                    </div>
                    <div className="badge badge-lg badge-accent text-accent-content font-bold">{`$${parseFloat(tutorial.price).toFixed(2)}`}</div>
                </div>
                <div className="flex items-center gap-3 mb-4 border-b border-[var(--color-divider)] pb-4">
                    <div className="avatar">
                        <div className="w-10 h-10 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                            <img src={tutorial.tutorPhotoURL} alt={tutorial.tutorName} />
                        </div>
                    </div>
                    <span className="font-semibold">{tutorial.tutorName}</span>
                </div>
                <p className="text-sm opacity-80 h-24 overflow-auto">{tutorial.description}</p>
            </div>

            <div className="flex justify-between items-center mt-4">
                <div className="flex items-center gap-2 text-sm opacity-70">
                    <FaCommentDots className="text-[var(--color-primary)]" />
                    <span>{tutorial.reviewCount} Reviews</span>
                </div>
                <Link to={`/tutorials/${tutorial._id}`} className="btn btn-secondary btn-sm text-secondary-content">
                    View Details
                </Link>
            </div>
        </div>
    </div>
);


export default function FindTutors() {
    const [tutorials, setTutorials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();
    const { categoryName } = useParams();
    const location = useLocation();

    // Function to get search term from URL query params
    const getSearchParam = () => new URLSearchParams(location.search).get('search') || '';

    // State for the search input field, initialized from URL
    const [inputValue, setInputValue] = useState(getSearchParam());
    // State for the actual search being performed
    const [searchQuery, setSearchQuery] = useState(getSearchParam());


    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);
        setError(null);

        const params = new URLSearchParams();
        // Prioritize category if it exists in the path
        if (categoryName) {
            params.append('category', categoryName);
        }
        // Otherwise use the search query if it exists
        else if (searchQuery) {
            params.append('search', searchQuery);
        }

        const endpoint = `${API_BASE_URL}/tutorials?${params.toString()}`;

        axios.get(endpoint)
            .then(response => {
                if (isMounted && response.data.success) {
                    setTutorials(response.data.tutorials);
                } else if (isMounted) {
                    throw new Error(response.data.message || "Failed to fetch tutorials.");
                }
            })
            .catch(err => {
                if (isMounted) {
                    console.error("Error fetching tutors:", err);
                    setError(err.message || "Could not fetch data.");
                }
            })
            .finally(() => {
                if (isMounted) setIsLoading(false);
            });

        return () => { isMounted = false; };
    }, [searchQuery, categoryName]);

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        setSearchQuery(inputValue); // Trigger search with the current input value
        // Update URL to reflect the new search term
        if (inputValue) {
            navigate(`/find-tutors?search=${inputValue}`);
        } else {
            // If search is empty, navigate to the base page to clear the query param
            navigate(`/find-tutors`);
        }
    };

    // ✨ FIX: New handler for input changes
    const handleInputChange = (e) => {
        const newInputValue = e.target.value;
        setInputValue(newInputValue);

        // If the user clears the input field, reset the search immediately
        if (newInputValue === '') {
            setSearchQuery('');
            navigate('/find-tutors');
        }
    };


    return (
        <div className="min-h-screen bg-[var(--color-bbgc)] p-4 sm:p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-center text-[var(--color-primary)]">Find Your Perfect Tutor</h1>
                <p className="text-center max-w-2xl mx-auto mb-8 text-[var(--color-txt)] opacity-80">
                    Search by language to discover experienced tutors from around the world.
                </p>

                {/* Search Bar */}
                <form onSubmit={handleSearchSubmit} className="max-w-xl mx-auto mb-12">
                    <div className="relative">
                        <input
                            type="search"
                            name="search"
                            // ✨ FIX: Using `value` and `onChange` to make it a controlled component
                            value={inputValue}
                            onChange={handleInputChange}
                            className="input-style w-full !rounded-full !py-3 !pl-5 !pr-16"
                            placeholder="Type a language (e.g., French, Japanese)..."
                        />
                        <button type="submit" className="btn btn-primary btn-circle absolute top-1/2 right-1.5 -translate-y-1/2">
                            <FaSearch />
                        </button>
                    </div>
                </form>

                {/* Display Area */}
                {isLoading ? (
                    <Loading />
                ) : error ? (
                    <div className="text-center text-[var(--color-error)]">Error: {error}</div>
                ) : tutorials.length > 0 ? (
                    <div className="flex flex-col gap-4">
                        {tutorials.map(tutorial => (
                            <TutorRow key={tutorial._id} tutorial={tutorial} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center p-10 card bg-[var(--color-bgc)]">
                        <p className="text-lg font-semibold text-[var(--color-txt)]">No Tutors Found</p>
                        <p className="text-[var(--color-txt)] opacity-70">Try a different language or clear your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
}