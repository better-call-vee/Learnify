const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const serverless = require("serverless-http");
const { MongoClient, ServerApiVersion } = require("mongodb");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// JWT Secret
// 🔑 Make sure JWT_SECRET is set in your Vercel environment variables!
const JWT_SECRET = process.env.JWT_SECRET || "your_strong_default_secret_for_local_dev_only";
if (JWT_SECRET === "your_strong_default_secret_for_local_dev_only" && process.env.NODE_ENV === "production") {
    console.warn("⚠️ WARNING: Using default JWT_SECRET in production. Please set a strong JWT_SECRET environment variable.");
}


// MongoDB Client Instance
// 🔑 Make sure MONGO_URI is correctly set in your Vercel environment variables!
const mongoUri = process.env.MONGO_URI;

if (!mongoUri) {
    console.error("❌ FATAL: MONGO_URI is not defined in environment variables. Database connectivity will fail.");
    // Optionally, you could throw an error here to prevent the app from starting improperly in some contexts,
    // though for serverless, logging the error and failing gracefully on DB operations is also an approach.
}

const client = new MongoClient(mongoUri || "", { // Fallback to empty string if mongoUri is undefined to prevent immediate crash, though the check above should be primary.
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
    connectTimeoutMS: 5000, // Optional: Set a connection timeout
    socketTimeoutMS: 30000, // Optional: Set a socket timeout
});

let dbInstance = null; // Cache the database instance for reuse

// Function to connect to MongoDB and get the database instance
async function getDb() {
    if (dbInstance) {
        // If instance is already cached, return it
        // console.log("🔄 Reusing cached DB instance."); // Optional: for debugging
        return dbInstance;
    }
    if (!mongoUri) {
        // This check is crucial if the initial check didn't stop the process
        console.error("❌ MONGO_URI environment variable is not set. Cannot connect to database.");
        throw new Error("MONGO_URI environment variable is not set.");
    }
    try {
        console.log("⏳ Attempting to connect to MongoDB...");
        await client.connect(); // Connect the client
        dbInstance = client.db("learnifyDB"); // Get the database instance and cache it
        console.log("✅ Connected to MongoDB and db instance is ready.");
        return dbInstance;
    } catch (err) {
        console.error("❌ MongoDB connection failed:", err);
        // dbInstance will remain null if connection fails
        // Rethrow the error so the calling function knows the DB operation can't proceed
        throw err;
    }
}

// Optional: "Warm up" the connection when the serverless function initializes.
// This is fire-and-forget; routes should still use getDb() to ensure the connection is active.
// This helps reduce cold start latency for the first DB operation.
if (mongoUri) {
    getDb().catch(err => {
        // Log the error, but don't crash the entire application initialization
        // The actual routes will handle the error again if getDb fails there.
        console.error("Initial DB connection attempt (warm-up) failed:", err.message);
    });
}


// --- Routes ---

app.get("/", (req, res) => {
    res.send("🚀 LEARNIFY Server is up and running!");
});

// Example: Basic JWT generation for login (you'll expand this)
app.post("/login", async (req, res) => {
    // In a real app, you would:
    // 1. Validate req.body (e.g., email, password)
    // 2. Find the user in your database (e.g., using await getDb())
    // 3. Verify the password
    // 4. If valid, then generate the token.
    const { email, name } = req.body; // Assuming email/name is sent for simplicity

    if (!email) {
        return res.status(400).json({ message: "Email is required for login." });
    }

    const userPayload = { email, name }; // Add more user details as needed in the token

    const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: "1h" }); // '1h' for 1 hour, '7d' for 7 days
    res.json({ token });
});

// Example: Protected route
app.get("/protected", (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided or incorrect format." });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        // Token is valid
        res.json({ message: "Authorized access granted", user: decoded });
    } catch (err) {
        // Token is invalid (e.g., expired, malformed, signature mismatch)
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Unauthorized: Token expired." });
        }
        console.error("JWT verification error:", err.message);
        return res.status(403).json({ message: "Forbidden: Invalid token." });
    }
});

// Example DB test route using the getDb function
app.get("/test-db", async (req, res) => {
    try {
        const db = await getDb(); // Get DB instance, this ensures connection
        const result = await db.collection("test").insertOne({ ping: "pong", timestamp: new Date() });
        res.json({ message: "Successfully inserted document into 'test' collection!", insertedId: result.insertedId });
    } catch (err) {
        // Log the error on the server for more details
        console.error("Error in /test-db route:", err);
        res.status(500).json({ error: "DB operation failed", details: err.message });
    }
});


// --- Serverless Handler ---
module.exports = app; // Export the app for Vercel (or other serverless platforms)
module.exports.handler = serverless(app); // Main handler for AWS Lambda compatibility