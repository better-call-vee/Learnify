import axios from 'axios';
import { useContext, useEffect } from 'react';
import AuthContext from '../provider/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = "https://learnify-psi-ten.vercel.app";

const axiosSecure = axios.create({
    baseURL: API_BASE_URL,
});

const useAxiosSecure = () => {
    const { user, getFirebaseIdToken, logOut } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        const requestIntercept = axiosSecure.interceptors.request.use(
            async (config) => {
                if (user) {
                    const token = await getFirebaseIdToken();
                    if (token) {
                        config.headers['Authorization'] = `Bearer ${token}`;
                    }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        const responseIntercept = axiosSecure.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                if (error.response && (error.response.status === 401 || error.response.status === 403) && !originalRequest._retry) {
                    originalRequest._retry = true;

                    console.warn(`Authentication error (${error.response.status}) from backend. Logging out.`);
                    try {
                        await logOut();
                        navigate('/auth/login', { state: { from: window.location.pathname }, replace: true });
                    } catch (logoutError) {
                        console.error("Error during automatic logout after auth failure:", logoutError);
                        navigate('/auth/login', { replace: true });
                    }
                }
                return Promise.reject(error);
            }
        );

        return () => {
            axiosSecure.interceptors.request.eject(requestIntercept);
            axiosSecure.interceptors.response.eject(responseIntercept);
        };
    }, [user, getFirebaseIdToken, logOut, navigate]);

    return axiosSecure;
};

export default useAxiosSecure;