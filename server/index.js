// index.js
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require("firebase-admin");
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// --- Essential Environment Variable Checks ---
if (!process.env.MONGO_URI) {
    console.error("❌ FATAL: MONGO_URI is not defined.");
    throw new Error("FATAL: MONGO_URI is not defined.");
}
if (!process.env.FB_SERVICE_KEY) {
    console.error("❌ FATAL: FB_SERVICE_KEY is not defined.");
    throw new Error("FATAL: FB_SERVICE_KEY is not defined.");
}

const VITE_CLIENT_URL = process.env.VITE_CLIENT_URL || 'https://learnify009.web.app';

// --- Core Middleware ---
app.use(cors({ origin: [VITE_CLIENT_URL, 'http://localhost:5173', 'http://localhost:5174'] }));
app.use(express.json());

// --- Firebase Admin SDK Initialization ---
try {
    const decodedServiceAccountString = Buffer.from(process.env.FB_SERVICE_KEY, 'base64').toString('utf8');
    const serviceAccount = JSON.parse(decodedServiceAccountString);
    if (admin.apps.length === 0) {
        admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
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

// --- MongoDB Client Setup ---
const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

// --- Global MongoDB Collections ---
let usersCollection;
let tutorialsCollection;
let categoriesCollection;
let bookingsCollection;
let decksCollection;
let flashcardsCollection;

// --- Main Async Function to Connect to DB and Setup Routes ---
async function initializeDatabaseAndApp() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to MongoDB!");

        const db = client.db('learnifyDB');
        usersCollection = db.collection('users');
        tutorialsCollection = db.collection('tutorials');
        categoriesCollection = db.collection('categories');
        bookingsCollection = db.collection('bookings');
        decksCollection = db.collection('decks');
        flashcardsCollection = db.collection('flashcards');

        const ensureUserInDb = async (firebaseUser) => {
            if (!usersCollection) throw new Error("usersCollection not initialized.");
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
            res.send('🚀 Learnify Server (@vercel/node) is up and running!');
        });

        // Your provided routes start here
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

        app.get('/tutorials/:id', async (req, res) => {
            try {
                if (!tutorialsCollection) return res.status(503).send({ success: false, message: "Database services not ready." });
                const { id } = req.params;
                if (!ObjectId.isValid(id)) return res.status(400).send({ success: false, message: 'Invalid tutorial ID.' });
                const tutorial = await tutorialsCollection.findOne({ _id: new ObjectId(id) });
                if (!tutorial) return res.status(404).send({ success: false, message: 'Tutorial not found.' });
                res.send({ success: true, tutorial });
            } catch (error) {
                console.error("GET /tutorials/:id Error:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch tutorial details.' });
            }
        });

        app.get('/my-tutorials', verifyFireBaseToken, async (req, res) => {
            try {
                if (!tutorialsCollection) return res.status(503).send({ success: false, message: "Database services not ready." });
                const { uid } = req.decoded;
                const query = { tutorFirebaseUid: uid };
                const userTutorials = await tutorialsCollection.find(query).sort({ createdAt: -1 }).toArray();
                res.send({ success: true, tutorials: userTutorials });
            } catch (error) {
                console.error("Error fetching my-tutorials:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch your tutorials.' });
            }
        });

        app.put('/tutorials/:id', verifyFireBaseToken, async (req, res) => {
            try {
                if (!tutorialsCollection) return res.status(503).send({ success: false, message: "Database services not ready." });
                const { id } = req.params;
                const { uid } = req.decoded;
                const updatesFromBody = req.body;
                if (!ObjectId.isValid(id)) return res.status(400).send({ success: false, message: 'Invalid tutorial ID.' });
                const existingTutorial = await tutorialsCollection.findOne({ _id: new ObjectId(id) });
                if (!existingTutorial) return res.status(404).send({ success: false, message: 'Tutorial not found.' });
                if (existingTutorial.tutorFirebaseUid !== uid) return res.status(403).send({ success: false, message: 'Forbidden: You can only update your own tutorials.' });
                const { tutorFirebaseUid, tutorEmail, reviewCount, createdAt, tutorName, tutorPhotoURL, ...editableUpdates } = updatesFromBody;
                editableUpdates.updatedAt = new Date();
                if (typeof editableUpdates.price !== 'undefined') editableUpdates.price = parseFloat(editableUpdates.price);
                if (editableUpdates.price < 0) return res.status(400).send({ success: false, message: "Price cannot be negative." });
                const result = await tutorialsCollection.updateOne({ _id: new ObjectId(id), tutorFirebaseUid: uid }, { $set: editableUpdates });
                if (result.matchedCount === 0) return res.status(404).send({ success: false, message: 'Update failed (tutorial not found or no permission).' });
                const updatedTutorial = await tutorialsCollection.findOne({ _id: new ObjectId(id) });
                res.send({ success: true, message: 'Tutorial updated successfully.', tutorial: updatedTutorial });
            } catch (error) {
                console.error("PUT /tutorials/:id Error:", error);
                res.status(500).send({ success: false, message: 'Failed to update tutorial.' });
            }
        });

        app.delete('/tutorials/:id', verifyFireBaseToken, async (req, res) => {
            try {
                if (!tutorialsCollection || !bookingsCollection) {
                    return res.status(503).send({ success: false, message: "Database services not ready." });
                }
                const { id } = req.params;
                const { uid } = req.decoded;
                if (!ObjectId.isValid(id)) return res.status(400).send({ success: false, message: 'Invalid tutorial ID format.' });
                const query = { _id: new ObjectId(id), tutorFirebaseUid: uid };
                const tutorialToDelete = await tutorialsCollection.findOne(query);
                if (!tutorialToDelete) return res.status(404).send({ success: false, message: 'Tutorial not found or you do not have permission to delete it.' });
                const deleteTutorialResult = await tutorialsCollection.deleteOne(query);
                if (deleteTutorialResult.deletedCount === 0) return res.status(404).send({ success: false, message: 'Delete failed, tutorial not found.' });
                const deleteBookingsResult = await bookingsCollection.deleteMany({ tutorialId: new ObjectId(id) });
                console.log(`Tutorial ${id} deleted. Associated bookings deleted: ${deleteBookingsResult.deletedCount}`);
                res.send({ success: true, message: 'Tutorial and all associated bookings were deleted successfully.', deletedTutorialsCount: deleteTutorialResult.deletedCount, deletedBookingsCount: deleteBookingsResult.deletedCount });
            } catch (error) {
                console.error("DELETE /tutorials/:id Error:", error);
                res.status(500).send({ success: false, message: 'Failed to delete the tutorial and its related data.' });
            }
        });

        app.patch('/tutorials/:id/review', verifyFireBaseToken, async (req, res) => {
            try {
                if (!tutorialsCollection) return res.status(503).send({ success: false, message: "Database service is not available." });
                const { id } = req.params;
                if (!ObjectId.isValid(id)) return res.status(400).send({ success: false, message: 'Invalid tutorial ID.' });

                const filter = { _id: new ObjectId(id) };
                const updateDoc = { $inc: { reviewCount: 1 } };

                const result = await tutorialsCollection.updateOne(filter, updateDoc);
                if (result.matchedCount === 0) return res.status(404).send({ success: false, message: "Tutorial to review not found." });

                res.send({ success: true, message: 'Review count updated successfully.' });
            } catch (error) {
                console.error("PATCH /tutorials/:id/review Error:", error);
                res.status(500).send({ success: false, message: 'Failed to update review count.' });
            }
        });


        app.post('/bookings', verifyFireBaseToken, async (req, res) => {
            try {
                if (!bookingsCollection || !tutorialsCollection) return res.status(503).send({ success: false, message: "Database not ready." });

                const bookingClientData = req.body;
                const { uid: studentFirebaseUid, email: studentEmail } = req.decoded;

                await ensureUserInDb(req.decoded);

                if (!bookingClientData.tutorialId || !ObjectId.isValid(bookingClientData.tutorialId)) {
                    return res.status(400).send({ success: false, message: "Valid tutorialId is required." });
                }

                const tutorialToBook = await tutorialsCollection.findOne({ _id: new ObjectId(bookingClientData.tutorialId) });
                if (!tutorialToBook) {
                    return res.status(404).send({ success: false, message: "Cannot book a tutorial that does not exist." });
                }

                const newBooking = {
                    tutorialId: new ObjectId(bookingClientData.tutorialId),
                    studentFirebaseUid,
                    studentEmail,
                    tutorFirebaseUid: tutorialToBook.tutorFirebaseUid,
                    tutorEmail: tutorialToBook.tutorEmail,
                    image: bookingClientData.image,
                    language: bookingClientData.language,
                    price: parseFloat(bookingClientData.price),
                    bookingDate: new Date(),
                    status: 'Booked',
                };

                const result = await bookingsCollection.insertOne(newBooking);
                const createdBooking = await bookingsCollection.findOne({ _id: result.insertedId });
                res.status(201).send({ success: true, message: 'Booking successful!', booking: createdBooking });
            } catch (error) {
                console.error("POST /bookings Error:", error);
                res.status(500).send({ success: false, message: 'Failed to create booking.' });
            }
        });

        app.get('/my-bookings', verifyFireBaseToken, async (req, res) => {
            try {
                if (!bookingsCollection) return res.status(503).send({ success: false, message: "Database service is not available." });

                const query = { studentFirebaseUid: req.decoded.uid };
                const myBookings = await bookingsCollection.find(query).sort({ bookingDate: -1 }).toArray();

                res.send({ success: true, bookings: myBookings });
            } catch (error) {
                console.error("GET /my-bookings Error:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch your booked tutorials.' });
            }
        });

        app.get('/stats', async (req, res) => {
            try {
                if (!usersCollection || !tutorialsCollection) {
                    return res.status(503).send({ success: false, message: "Database services not ready." });
                }


                const userCountPromise = usersCollection.countDocuments();

                const tutorialsStatsPromise = tutorialsCollection.aggregate([
                    {
                        $facet: {
                            "totalReviews": [
                                { $group: { _id: null, total: { $sum: "$reviewCount" } } }
                            ],
                            "distinctTutors": [
                                { $group: { _id: "$tutorFirebaseUid" } },
                                { $count: "count" }
                            ],
                            "distinctLanguages": [
                                { $group: { _id: "$language" } },
                                { $count: "count" }
                            ]
                        }
                    }
                ]).toArray();

                const [userCount, tutorialsStatsResult] = await Promise.all([userCountPromise, tutorialsStatsPromise]);

                const stats = tutorialsStatsResult[0];
                const reviewCount = stats.totalReviews[0]?.total || 0;
                const tutorCount = stats.distinctTutors[0]?.count || 0;
                const languageCount = stats.distinctLanguages[0]?.count || 0;

                res.send({
                    success: true,
                    stats: {
                        users: userCount,
                        tutors: tutorCount,
                        languages: languageCount,
                        reviews: reviewCount
                    }
                });

            } catch (error) {
                console.error("GET /stats Error:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch platform statistics.' });
            }
        });

        app.get('/categories', async (req, res) => {
            try {
                if (!categoriesCollection) {
                    return res.status(503).send({ success: false, message: "Database services not ready." });
                }

                const allCategories = await categoriesCollection.find({}).sort({ name: 1 }).toArray();

                res.send({
                    success: true,
                    categories: allCategories
                });

            } catch (error) {
                console.error("GET /categories Error:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch language categories.' });
            }
        });


        console.log("👍 Express app routes configured.");

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
            res.status(500).send({ success: false, message: "Server failed to initialize. Please check logs." });
        });
        return errorApp;
    });

// Local development listener (Vercel ignores this)
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL_ENV) {
    const localPort = process.env.PORT || 5000;
    appInitializationPromise.then(() => {
        app.listen(localPort, () => {
            console.log(`🚀 Learnify server (local) running on port ${localPort}`);
        });
    }).catch(err => {
        console.error("Local server will not start due to initialization failure.");
    });
}