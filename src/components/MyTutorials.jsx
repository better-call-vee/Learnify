
import React, { useState, useEffect, useContext } from 'react';
import useAxiosSecure from '../hooks/useAxiosSecure';
import AuthContext from '../provider/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Loading from './Loading';
import { FaEdit, FaTrashAlt } from 'react-icons/fa';
import Lottie from 'lottie-react';

const EmptyTutorialsState = () => {
    const [lottieData, setLottieData] = useState(null);
    const [lottieError, setLottieError] = useState(false);

    useEffect(() => {
        fetch('/mytut.json') // Assumes mytut.json is in the public folder
            .then(res => {
                if (!res.ok) throw new Error("Lottie file not found");
                return res.json();
            })
            .then(data => setLottieData(data))
            .catch(err => {
                console.error("Failed to load mytut.json:", err);
                setLottieError(true);
            });
    }, []);

    return (
        <div className="text-center p-6 sm:p-10 card bg-[var(--color-bgc)] shadow-lg items-center">
            <div className="w-48 sm:w-64">
                {lottieError ? (
                    <p className="text-sm text-[var(--color-error)]">Could not load animation.</p>
                ) : lottieData ? (
                    <Lottie animationData={lottieData} loop={true} />
                ) : (
                    <div className="h-48 sm:h-64 flex items-center justify-center">
                        <Loading />
                    </div>
                )}
            </div>
            <p className="text-lg text-[var(--color-txt)] opacity-80 mt-4">You haven't added any tutorials yet.</p>
            <p className="text-sm text-[var(--color-txt)] opacity-60">Share your knowledge with the world!</p>
            <Link to="/add-tutorials" className="btn btn-primary mt-6">Add Your First Tutorial</Link>
        </div>
    );
};


export default function MyTutorials() {
    const { user, loading: authIsLoading } = useContext(AuthContext);
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();

    const [myTutorials, setMyTutorials] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [refetchTrigger, setRefetchTrigger] = useState(0);

    useEffect(() => {
        let isMounted = true;
        if (user) {
            setIsLoading(true);
            setError(null);
            axiosSecure.get('/my-tutorials')
                .then(response => {
                    if (isMounted) {
                        if (response.data.success) {
                            setMyTutorials(response.data.tutorials);
                        } else {
                            throw new Error(response.data.message || "Failed to fetch tutorials.");
                        }
                    }
                })
                .catch(err => {
                    if (isMounted) {
                        console.error("Error fetching my tutorials:", err);
                        setError(err.response?.data?.message || err.message || "Could not fetch data.");
                    }
                })
                .finally(() => {
                    if (isMounted) {
                        setIsLoading(false);
                    }
                });
        } else {
            setIsLoading(false);
        }
        return () => {
            isMounted = false;
        };
    }, [user, axiosSecure, refetchTrigger]);

    const handleDelete = (tutorialId, tutorialLanguage) => {
        Swal.fire({
            title: `Delete "${tutorialLanguage}" Tutorial?`,
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.getAttribute('data-theme') === 'dark' ? '#1f2937' : '#ffffff',
            color: document.documentElement.getAttribute('data-theme') === 'dark' ? '#f1f5f9' : '#1e293b'
        }).then((result) => {
            if (result.isConfirmed) {
                axiosSecure.delete(`/tutorials/${tutorialId}`)
                    .then(response => {
                        if (response.data.success) {
                            Swal.fire('Deleted!', 'Your tutorial has been deleted.', 'success');
                            setRefetchTrigger(prev => prev + 1);
                        } else {
                            throw new Error(response.data.message || "Delete failed.");
                        }
                    })
                    .catch(err => {
                        console.error("Error deleting tutorial:", err);
                        Swal.fire('Error!', err.response?.data?.message || err.message || 'Could not delete tutorial.', 'error');
                    });
            }
        });
    };

    const handleUpdate = (tutorialId) => {
        navigate(`/my-tutorials/update/${tutorialId}`);
    };

    if (isLoading || authIsLoading) {
        return <Loading />;
    }

    if (error) {
        return <div className="text-center p-8 text-[var(--color-error)] min-h-screen">Error: {error}</div>;
    }

    return (
        <div className="min-h-screen bg-[var(--color-bbgc)] p-4 sm:p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl sm:text-4xl font-bold mb-8 text-center text-[var(--color-primary)]">My Tutorials</h1>
                
                {myTutorials.length > 0 ? (
                    <div className="overflow-x-auto rounded-lg shadow-md bg-[var(--color-bgc)]">
                        <table className="table w-full text-[var(--color-txt)]">
                            <thead className="bg-base-200 text-base-content text-sm">
                                <tr>
                                    <th className="p-4 w-[35%] sm:w-[30%] md:w-[25%]">Tutorial</th> 
                                    <th className="p-4 hidden sm:table-cell">Description</th>
                                    <th className="p-4 text-center">Price</th>
                                    <th className="p-4 text-center">Reviews</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {myTutorials.map(tutorial => (
                                    <tr key={tutorial._id} className="hover:bg-[var(--icon-hover-bg)] border-b border-base-300 transition-colors last:border-b-0">
                                        <td className="p-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="avatar">
                                                    <div className="mask mask-squircle w-12 h-12">
                                                        <img src={tutorial.image} alt={`${tutorial.language} tutorial`} />
                                                    </div>
                                                </div>
                                                <div>
                                                    <div className="font-bold">{tutorial.language}</div>
                                                    <div className="text-sm opacity-70">by {tutorial.tutorName}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 hidden sm:table-cell max-w-xs lg:max-w-md">
                                            <p className="truncate" title={tutorial.description}>
                                                {tutorial.description}
                                            </p>
                                        </td>
                                        <td className="p-4 font-mono text-center">${parseFloat(tutorial.price).toFixed(2)}</td>
                                        <td className="p-4 text-center font-semibold">{tutorial.reviewCount}</td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleUpdate(tutorial._id)}
                                                    className="btn btn-sm btn-info text-info-content tooltip" data-tip="Update"
                                                >
                                                    <FaEdit />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(tutorial._id, tutorial.language)}
                                                    className="btn btn-sm btn-error text-error-content tooltip" data-tip="Delete"
                                                >
                                                    <FaTrashAlt />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                   <EmptyTutorialsState /> // ✨ Now using the component defined outside
                )}
            </div>
        </div>
    );
}