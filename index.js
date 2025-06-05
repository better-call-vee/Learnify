const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require("firebase-admin");
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

if (!process.env.MONGO_URI) {
    console.error("❌ FATAL: MONGO_URI is not defined. Exiting.");
    process.exit(1);
}
if (!process.env.FB_SERVICE_KEY) {
    console.error("❌ FATAL: FB_SERVICE_KEY is not defined. Exiting.");
    process.exit(1);
}

const VITE_CLIENT_URL = process.env.VITE_CLIENT_URL || 'https://learnify009.web.app';

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
    process.exit(1);
}

const verifyFireBaseToken = async (req, res, next) => {
    const authHeader = req.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).send({ success: false, message: 'Unauthorized: No token provided or incorrect format.' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decodedToken = await admin.auth().verifyIdToken(token);
        req.decoded = decodedToken;
        next();
    } catch (error) {
        console.error('Firebase ID Token verification error:', error.message);
        if (error.code === 'auth/id-token-expired') {
            return res.status(401).send({ success: false, message: 'Unauthorized: Token expired.' });
        }
        return res.status(401).send({ success: false, message: 'Unauthorized: Invalid token.' });
    }
};

const mongoUri = process.env.MONGO_URI;
const client = new MongoClient(mongoUri, {
    serverApi: { version: ServerApiVersion.v1, strict: true, deprecationErrors: true }
});

async function runMongoConnectionAndSetupRoutes() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to MongoDB!");
        const db = client.db('learnifyDB');
        const usersCollection = db.collection('users');
        const tutorialsCollection = db.collection('tutorials');
        const categoriesCollection = db.collection('categories');
        const bookingsCollection = db.collection('bookings');

        const ensureUserInDb = async (firebaseUser) => {
            if (!firebaseUser || !firebaseUser.email) return null;
            const query = { email: firebaseUser.email };
            const update = {
                $setOnInsert: {
                    firebaseUid: firebaseUser.uid,
                    email: firebaseUser.email,
                    createdAt: new Date(),
                    role: 'student',
                },
                $set: {
                    name: firebaseUser.name || firebaseUser.displayName || 'N/A',
                    photoURL: firebaseUser.picture || firebaseUser.photoURL || null,
                    lastLogin: new Date()
                }
            };
            const options = { upsert: true, returnDocument: 'after' };
            const result = await usersCollection.findOneAndUpdate(query, update, options);
            return result.value;
        };

        app.get('/', (req, res) => {
            res.send('🚀 Learnify Server (Firebase JWT Bearer Auth) is up and running!');
        });

        app.get('/users/me', verifyFireBaseToken, async (req, res) => {
            try {
                const appUser = await ensureUserInDb(req.decoded);
                if (!appUser) return res.status(404).send({ success: false, message: 'User not found or could not be synced.' });
                const { firebaseUid, ...userToSend } = appUser;
                res.send({ success: true, user: userToSend });
            } catch (error) {
                console.error("Error fetching /users/me:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch user profile.' });
            }
        });

        app.get('/stats', async (req, res) => {
            try {
                const totalUsers = await usersCollection.countDocuments();
                const totalTutorials = await tutorialsCollection.countDocuments();
                const reviewAggregation = await tutorialsCollection.aggregate([{ $group: { _id: null, totalReviews: { $sum: "$reviewCount" } } }]).toArray();
                const totalReviews = reviewAggregation.length > 0 ? reviewAggregation[0].totalReviews : 0;
                const distinctLanguages = await tutorialsCollection.distinct("language", { language: { $ne: null, $ne: "" } });
                const totalLanguages = distinctLanguages.length;
                res.send({
                    success: true,
                    stats: { users: totalUsers, tutorials: totalTutorials, reviews: totalReviews, languages: totalLanguages }
                });
            } catch (error) {
                console.error("Error fetching stats:", error);
                res.status(500).send({ success: false, message: "Failed to fetch stats." });
            }
        });

        app.get('/categories', async (req, res) => {
            try {
                const categories = await categoriesCollection.find({}).toArray();
                if (categories.length === 0 && process.env.NODE_ENV !== 'production') {
                    console.log("No categories found, attempting to seed initial categories...");
                    const initialCategories = [
                        { name: "English", logo: "logos/english.png", description: "Learn English with native tutors." },
                        { name: "Spanish", logo: "logos/spanish.png", description: "Master Spanish from beginner to advanced." },
                        { name: "French", logo: "logos/french.png", description: "Explore the beauty of the French language." },
                        { name: "German", logo: "logos/german.png", description: "Speak German confidently." },
                        { name: "Japanese", logo: "logos/japanese.png", description: "Dive into Japanese language and culture." },
                        { name: "Chinese (Mandarin)", logo: "logos/chinese.png", description: "Unlock Mandarin Chinese." },
                        { name: "Italian", logo: "logos/italian.png", description: "Discover Italian language and its charm." },
                        { name: "Korean", logo: "logos/korean.png", description: "Learn Korean for K-pop, K-drama, or travel." },
                        { name: "Russian", logo: "logos/russian.png", description: "Understand the Russian language." },
                    ];
                    const categoriesToInsert = initialCategories.map(cat => ({ ...cat }));
                    if (categoriesToInsert.length > 0) {
                        await categoriesCollection.insertMany(categoriesToInsert);
                    }
                    const seededCategories = await categoriesCollection.find({}).toArray();
                    return res.send({ success: true, categories: seededCategories });
                }
                res.send({ success: true, categories });
            } catch (error) {
                console.error("Error fetching/seeding categories:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch categories.' });
            }
        });

        app.post('/tutorials', verifyFireBaseToken, async (req, res) => {
            try {
                const tutorialData = req.body;
                const { uid, email, name: firebaseName, picture } = req.decoded;
                await ensureUserInDb(req.decoded);
                const newTutorial = {
                    tutorFirebaseUid: uid,
                    tutorEmail: email,
                    tutorName: firebaseName || tutorialData.tutorName || 'Tutor',
                    tutorPhotoURL: picture || tutorialData.tutorPhotoURL,
                    image: tutorialData.image,
                    language: tutorialData.language,
                    price: parseFloat(tutorialData.price) || 0,
                    description: tutorialData.description,
                    reviewCount: 0,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                if (!newTutorial.language || !newTutorial.description || newTutorial.price < 0 || !newTutorial.image) {
                    return res.status(400).send({ success: false, message: "Missing required tutorial fields (language, description, image) or invalid price." });
                }
                const result = await tutorialsCollection.insertOne(newTutorial);
                const createdTutorial = await tutorialsCollection.findOne({ _id: result.insertedId });
                res.status(201).send({ success: true, message: 'Tutorial added!', tutorial: createdTutorial });
            } catch (error) {
                console.error("Error adding tutorial:", error);
                res.status(500).send({ success: false, message: 'Failed to add tutorial.' });
            }
        });

        app.get('/tutorials', async (req, res) => {
            try {
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
                console.error("Error fetching tutorials:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch tutorials.' });
            }
        });

        app.get('/tutorials/category/:categoryName', async (req, res) => {
            try {
                const { categoryName } = req.params;
                const tutorials = await tutorialsCollection.find({ language: { $regex: `^${categoryName}$`, $options: 'i' } }).sort({ createdAt: -1 }).toArray();
                res.send({ success: true, tutorials });
            } catch (error) {
                console.error("Error fetching tutorials by category:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch tutorials by category.' });
            }
        });

        app.get('/tutorials/:id', async (req, res) => {
            try {
                const { id } = req.params;
                if (!ObjectId.isValid(id)) return res.status(400).send({ success: false, message: 'Invalid tutorial ID.' });
                const tutorial = await tutorialsCollection.findOne({ _id: new ObjectId(id) });
                if (!tutorial) return res.status(404).send({ success: false, message: 'Tutorial not found.' });
                res.send({ success: true, tutorial });
            } catch (error) {
                console.error("Error fetching tutorial details:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch tutorial details.' });
            }
        });

        app.get('/my-tutorials', verifyFireBaseToken, async (req, res) => {
            try {
                const { uid } = req.decoded;
                const tutorials = await tutorialsCollection.find({ tutorFirebaseUid: uid }).sort({ createdAt: -1 }).toArray();
                res.send({ success: true, tutorials });
            } catch (error) {
                console.error("Error fetching my tutorials:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch your tutorials.' });
            }
        });

        app.put('/tutorials/:id', verifyFireBaseToken, async (req, res) => {
            try {
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
                const result = await tutorialsCollection.updateOne(
                    { _id: new ObjectId(id), tutorFirebaseUid: uid },
                    { $set: editableUpdates }
                );
                if (result.matchedCount === 0) return res.status(404).send({ success: false, message: 'Update failed (tutorial not found or no permission).' });
                const updatedTutorial = await tutorialsCollection.findOne({ _id: new ObjectId(id) });
                res.send({ success: true, message: 'Tutorial updated successfully.', tutorial: updatedTutorial });
            } catch (error) {
                console.error("Error updating tutorial:", error);
                res.status(500).send({ success: false, message: 'Failed to update tutorial.' });
            }
        });

        app.delete('/tutorials/:id', verifyFireBaseToken, async (req, res) => {
            try {
                const { id } = req.params;
                const { uid } = req.decoded;
                if (!ObjectId.isValid(id)) return res.status(400).send({ success: false, message: 'Invalid tutorial ID.' });
                const existingTutorial = await tutorialsCollection.findOne({ _id: new ObjectId(id) });
                if (!existingTutorial) return res.status(404).send({ success: false, message: 'Tutorial not found.' });
                if (existingTutorial.tutorFirebaseUid !== uid) return res.status(403).send({ success: false, message: 'Forbidden: You can only delete your own tutorials.' });
                const result = await tutorialsCollection.deleteOne({ _id: new ObjectId(id), tutorFirebaseUid: uid });
                if (result.deletedCount === 0) return res.status(404).send({ success: false, message: 'Delete failed (tutorial not found or no permission).' });
                res.send({ success: true, message: 'Tutorial deleted successfully.' });
            } catch (error) {
                console.error("Error deleting tutorial:", error);
                res.status(500).send({ success: false, message: 'Failed to delete tutorial.' });
            }
        });

        app.patch('/tutorials/:id/review', verifyFireBaseToken, async (req, res) => {
            try {
                const { id: tutorialId } = req.params;
                const { uid: studentFirebaseUid } = req.decoded;
                if (!ObjectId.isValid(tutorialId)) return res.status(400).send({ success: false, message: 'Invalid tutorial ID.' });
                const result = await tutorialsCollection.updateOne(
                    { _id: new ObjectId(tutorialId) },
                    { $inc: { reviewCount: 1 } }
                );
                if (result.matchedCount === 0) return res.status(404).send({ success: false, message: 'Tutorial not found.' });
                const updatedTutorial = await tutorialsCollection.findOne({ _id: new ObjectId(tutorialId) });
                res.send({ success: true, message: 'Review count updated.', tutorial: updatedTutorial });
            } catch (error) {
                console.error("Error updating review count:", error);
                res.status(500).send({ success: false, message: 'Failed to update review count.' });
            }
        });

        app.post('/bookings', verifyFireBaseToken, async (req, res) => {
            try {
                const bookingClientData = req.body;
                const { uid: studentFirebaseUid, email: studentEmail } = req.decoded;
                await ensureUserInDb(req.decoded);
                if (!bookingClientData.tutorialId || !ObjectId.isValid(bookingClientData.tutorialId)) {
                    return res.status(400).send({ success: false, message: "Valid tutorialId is required." });
                }
                const tutorialToBook = await tutorialsCollection.findOne({ _id: new ObjectId(bookingClientData.tutorialId) });
                if (!tutorialToBook) {
                    return res.status(404).send({ success: false, message: "Tutorial not found for booking." });
                }
                const newBooking = {
                    tutorialId: new ObjectId(bookingClientData.tutorialId),
                    studentFirebaseUid,
                    studentEmail,
                    tutorFirebaseUid: tutorialToBook.tutorFirebaseUid,
                    tutorEmail: tutorialToBook.tutorEmail,
                    tutorialImage: bookingClientData.image || tutorialToBook.image,
                    tutorialLanguage: bookingClientData.language || tutorialToBook.language,
                    priceAtBooking: parseFloat(bookingClientData.price) || parseFloat(tutorialToBook.price),
                    bookingDate: new Date(),
                    status: 'Booked',
                };
                const result = await bookingsCollection.insertOne(newBooking);
                const createdBooking = await bookingsCollection.findOne({ _id: result.insertedId });
                res.status(201).send({ success: true, message: 'Booking successful!', booking: createdBooking });
            } catch (error) {
                console.error("Error creating booking:", error);
                res.status(500).send({ success: false, message: 'Failed to create booking.' });
            }
        });

        app.get('/my-bookings', verifyFireBaseToken, async (req, res) => {
            try {
                const { uid: studentFirebaseUid } = req.decoded;
                const bookings = await bookingsCollection.aggregate([
                    { $match: { studentFirebaseUid } },
                    { $sort: { bookingDate: -1 } },
                    { $lookup: { from: "tutorials", localField: "tutorialId", foreignField: "_id", as: "tutorialDetailsArr" } },
                    { $unwind: { path: "$tutorialDetailsArr", preserveNullAndEmptyArrays: true } },
                    {
                        $project: {
                            _id: 1, studentEmail: 1,
                            tutorEmail: "$tutorialDetailsArr.tutorEmail",
                            tutorialImage: "$tutorialDetailsArr.image",
                            tutorialLanguage: "$tutorialDetailsArr.language",
                            tutorialName: "$tutorialDetailsArr.tutorName",
                            tutorialDescription: "$tutorialDetailsArr.description",
                            priceAtBooking: 1, bookingDate: 1, status: 1, tutorialId: 1,
                        }
                    }
                ]).toArray();
                res.send({ success: true, bookings });
            } catch (error) {
                console.error("Error fetching my bookings:", error);
                res.status(500).send({ success: false, message: 'Failed to fetch your bookings.' });
            }
        });

        console.log("👍 All routes configured. Learnify Server ready to handle requests.");
    } catch (err) {
        console.error("❌ MongoDB connection failed or critical error during setup:", err);
    }
}

runMongoConnectionAndSetupRoutes().catch(console.error);

app.listen(port, () => {
    console.log(`🚀 Learnify server (Firebase JWT Bearer) is cooking on port ${port}`);
});