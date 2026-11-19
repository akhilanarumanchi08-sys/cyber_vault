// 1. Import Node's built-in cybersecurity module
const crypto = require('crypto');

// 2. Define the encryption algorithm and generate a secret key + IV (Initialization Vector)
const algorithm = 'aes-256-cbc';
const secretKey = crypto.randomBytes(32); // 32 bytes = 256-bit key
const iv = crypto.randomBytes(16);        // 16 bytes randomizer so identical messages look different

// 3. Function to LOCK (Encrypt) a message
function encryptMessage(plainText) {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(plainText, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}

// 4. Function to UNLOCK (Decrypt) a message
function decryptMessage(encryptedHex) {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, iv);
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// --- TEST OUR BACKEND ENGINE ---
const mySecret = "Meet at the hidden server room at 02:00 AM.";

console.log("1. Original Message:", mySecret);

const lockedMessage = encryptMessage(mySecret);
console.log("2. Encrypted (Stored in Vault):", lockedMessage);

const unlockedMessage = decryptMessage(lockedMessage);
console.log("3. Decrypted (After Unlocking):", unlockedMessage);
