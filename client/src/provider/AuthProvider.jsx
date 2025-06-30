import React, { useEffect, useState, useContext, createContext } from "react"; // Added createContext
import app from "../firebase/firebase.init";
import Loading from "../components/Loading";
import {
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
} from "firebase/auth";
import AuthContext from "./AuthContext";

export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const getFirebaseIdToken = async () => {
        if (auth.currentUser) {
            try {
                const idToken = await auth.currentUser.getIdToken(true); // true forces refresh if needed
                return idToken;
            } catch (error) {
                console.error("Error getting Firebase ID token:", error);
                return null;
            }
        }
        return null;
    };

    const createUser = (email, password) => {
        setLoading(true);
        return createUserWithEmailAndPassword(auth, email, password);
        // .then(result => { setLoading(false); return result; }) // setLoading(false) is handled by onAuthStateChanged
        // .catch(error => { setLoading(false); throw error; });
    };

    const signIn = (email, password) => {
        setLoading(true);
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signInWithGoogle = () => {
        setLoading(true);
        return signInWithPopup(auth, googleProvider);
    };

    const updateUserProfile = (profileData) => { // e.g., { displayName, photoURL }
        if (auth.currentUser) {
            return updateProfile(auth.currentUser, profileData);
        }
        return Promise.reject(new Error("No current user to update."));
    };

    const logOut = () => {
        setLoading(true);
        return signOut(auth);
    };

    // Listener for Firebase authentication state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            console.log("User from onAuthStateChanged:", currentUser);
            setUser(currentUser);
            setLoading(false);
        });
        return () => {
            unsubscribe();
        };
    }, []);

    const authInfo = {
        user, // Firebase user object
        loading,
        setLoading, // Expose if needed by components that trigger async auth ops
        createUser,
        signIn,
        signInWithGoogle,
        updateUserProfile,
        logOut,
        getFirebaseIdToken, // JWT
    };

    return (
        <AuthContext.Provider value={authInfo}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthProvider;