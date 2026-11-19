const express = require('express');
const crypto = require('crypto');

const app = express();
app.use(express.json());

// Serve static frontend files from a "public" folder (Ready for Phase 3!)
app.use(express.static('public'));

// --- SECURITY GUARD: API KEY MIDDLEWARE ---
const VALID_API_KEY = "cyber-secret-key-2026";

function checkApiKey(req, res, next) {
    // Look for 'x-api-key' inside the request headers
    const userKey = req.headers['x-api-key'];

    if (!userKey || userKey !== VALID_API_KEY) {
        return res.status(401).json({ error: "ACCESS DENIED: Invalid or missing API Key!" });
    }
    next(); // Key is valid! Let the request pass through to the route.
}

// Encryption setup
const algorithm = 'aes-256-cbc';
const secretKey = crypto.randomBytes(32);
const vaultStorage = {};

// DOOR 1: Protected by checkApiKey middleware
app.post('/lock', checkApiKey, (req, res) => {
    const plainText = req.body.message;
    if (!plainText) {
        return res.status(400).json({ error: "Please provide a message!" });
    }

    const id = crypto.randomBytes(4).toString('hex');
    const iv = crypto.randomBytes(16);

    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    vaultStorage[id] = {
        encryptedData: encrypted,
        iv: iv.toString('hex')
    };

    res.json({
        status: "Locked safely in vault!",
        secretId: id
    });
});

// DOOR 2: Protected by checkApiKey middleware
app.get('/unlock/:id', checkApiKey, (req, res) => {
    const id = req.params.id;
    const record = vaultStorage[id];

    if (!record) {
        return res.status(404).json({ error: "Secret not found or already destroyed!" });
    }

    const decipher = crypto.createDecipheriv(
        algorithm,
        secretKey,
        Buffer.from(record.iv, 'hex')
    );
    let decrypted = decipher.update(record.encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    delete vaultStorage[id];

    res.json({
        status: "Decrypted and destroyed from server!",
        secretMessage: decrypted
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Secured Cyber Vault API is live on port ${PORT}`);
});

