
const fs = require('fs');
const path = require('path');

const keyFilePath = path.join(__dirname, 'firebase-admin-service-key.json');

try {
    const keyFileContent = fs.readFileSync(keyFilePath, 'utf8');
    const base64ServiceKey = Buffer.from(keyFileContent).toString('base64');
    console.log(base64ServiceKey);
} catch (error) {
    console.error("Error reading or converting the service key JSON file:", error.message);
    console.error("Please ensure 'firebase-admin-service-key.json' is in the same directory as this script, or update the path.");
}