// index.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require("firebase-admin");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000; // For local development

// --- Essential Environment Variable Checks ---
if (!process.env.MONGO_URI) {
    console.error("❌ FATAL: MONGO_URI is not defined in .env. This app will not connect to the database.");
    throw new Error("FATAL: MONGO_URI is not defined.");
}
if (!process.env.FB_SERVICE_KEY) {
    console.error("❌ FATAL: FB_SERVICE_KEY is not defined in .env. Firebase Admin SDK cannot initialize.");
    throw new Error("FATAL: FB_SERVICE_KEY is not defined.");
}

const VITE_CLIENT_URL = process.env.VITE_CLIENT_URL || 'https://learnify009.web.app';

// --- Core Middleware ---
app.use(cors({
    origin: [VITE_CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'],
}));
app.use(express.json());

try {
    const decodedServiceAccountString = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(decodedServiceAccountString);
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });
        console.log('✅ Firebase Admin SDK initialized successfully.');
    }
} catch (error) {
    console.error('❌ Error initializing Firebase Admin SDK:', error.message);
    throw new Error(`Firebase Admin SDK Init Error: ${error.message}`);
}

// --- JWT Verification Middleware ---
const verifyFireBaseToken = async (req, res, next) => {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ success: false, message: 'Unauthorized: No token or incorrect format.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        req.decoded = await admin.auth().verifyIdToken(token);
        next();
    } catch (error) {
        console.error('Firebase ID Token verification error:', error.code, error.message);
        const status = (error.code === 'auth/id-token-expired') ? 401 : 403;
        return res.status(status).send({ success: false, message: `Unauthorized: ${error.message}` });
    }
};

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

// --- Global MongoDB Collections ---
let usersCollection;
let tutorialsCollection;

// --- Main Async Function to Connect to DB and Setup Routes ---
async function initializeDatabaseAndApp() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to MongoDB!");

        const db = client.db('learnifyDB');
        usersCollection = db.collection('users');
        tutorialsCollection = db.collection('tutorials');

        // Ensure User in DB (Upsert)
        const ensureUserInDb = async (firebaseUser) => {
            if (!usersCollection) { // if collection is initialized
                console.error("ensureUserInDb: usersCollection not initialized!");
                throw new Error("Database not ready for user operations.");
            }
            if (!firebaseUser || !firebaseUser.email) return null;
            const query = { email: firebaseUser.email };
            const update = {
                $setOnInsert: { firebaseUid: firebaseUser.uid, email: firebaseUser.email, createdAt: new Date(), role: 'student' },
                $set: { name: firebaseUser.name || firebaseUser.displayName || 'N/A', photoURL: firebaseUser.picture || firebaseUser.photoURL || null, lastLogin: new Date() }
            };
            const options = { upsert: true, returnDocument: 'after' };
            const result = await usersCollection.findOneAndUpdate(query, update, options);
            return result.value;
        };

        // --- API Routes ---
        app.get('/', (req, res) => {
            console.log("GET / route hit on Vercel");
            res.send('🚀 Learnify Server (@vercel/node) is up and running!');
        });

        app.post('/tutorials', verifyFireBaseToken, async (req, res) => {
            try {
                if (!tutorialsCollection || !usersCollection) {
                    return res.status(503).send({ success: false, message: "Database services not ready." });
                }
                const tutorialData = req.body;
                const { uid, email, name: firebaseName, picture } = req.decoded;
                await ensureUserInDb(req.decoded);
                const newTutorial = {
                    tutorFirebaseUid: uid, tutorEmail: email,
                    tutorName: firebaseName || tutorialData.tutorName || 'Tutor',
                    tutorPhotoURL: picture || tutorialData.tutorPhotoURL,
                    image: tutorialData.image, language: tutorialData.language,
                    price: parseFloat(tutorialData.price) || 0,
                    description: tutorialData.description,
                    reviewCount: 0, createdAt: new Date(), updatedAt: new Date(),
                };
                if (!newTutorial.language || !newTutorial.description || newTutorial.price < 0 || !newTutorial.image) {
                    return res.status(400).send({ success: false, message: "Missing required tutorial fields or invalid price." });
                }
                const result = await tutorialsCollection.insertOne(newTutorial);
                const createdTutorial = await tutorialsCollection.findOne({ _id: result.insertedId });
                res.status(201).send({ success: true, message: 'Tutorial added!', tutorial: createdTutorial });
            } catch (error) {
                console.error("POST /tutorials Error:", error);
                res.status(500).send({ success: false, message: 'Failed to add tutorial.' });
            }
        });

        app.get('/tutorials', async (req, res) => {
            try {
                if (!tutorialsCollection) {
                    return res.status(503).send({ success: false, message: "Database services not ready." });
                }
                const { language, category, search } = req.query;
                const query = {};
                if (search) {
                    query.$or = [
                        { language: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } },
                        { tutorName: { $regex: search, $options: 'i' } }
                    ];
                } else if (language) {
                    query.language = { $regex: `^${language}$`, $options: 'i' };
                } else if (category) {
                    query.language = { $regex: `^${category}$`, $options: 'i' };
                }
                const tutorials = await tutorialsCollection.find(query).sort({ createdAt: -1 }).toArray();
                res.send({ success: true, tutorials });
            } catch (error) {
                console.error("GET /tutorials Error:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch tutorials.' });
            }
        });

        console.log("👍 Express app routes configured after DB connection.");

    } catch (err) {
        console.error("❌ CRITICAL: MongoDB connection or initial route setup failed:", err);
        throw new Error(`Application initialization failed: ${err.message}`);
    }
}


const appInitializationPromise = initializeDatabaseAndApp();

module.exports = appInitializationPromise
    .then(() => {
        console.log("✅ Application fully initialized. Exporting Express app for Vercel.");
        return app;
    })
    .catch(initError => {
        console.error("💀 App export failed due to initialization error:", initError);
        const errorApp = express();
        errorApp.use((req, res, next) => {
            res.status(500).send("Server failed to initialize. Please check logs.");
        });
        return errorApp;
    });



if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV) { 
    const localPort = process.env.PORT || 5000;
    appInitializationPromise.then(() => {
        app.listen(localPort, () => {
            console.log(`🚀 Learnify server (local with @vercel/node setup) running on port ${localPort}`);
        });
    }).catch(err => {
        console.error("Local server will not start due to initialization failure.");
    });
}