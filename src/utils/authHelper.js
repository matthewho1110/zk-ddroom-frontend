import { createHash } from "crypto";

// Define a function to hash the password
function hashPassword(password) {
    const hash = createHash("sha256");
    hash.update(password);
    return hash.digest("hex");
}

module.exports = { hashPassword };
