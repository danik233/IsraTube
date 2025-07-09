// modules/user.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: String,
    paid: Boolean,
    favArray: {
        type: Array,
        default: [],
    },
    signupDate: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("User", userSchema);
