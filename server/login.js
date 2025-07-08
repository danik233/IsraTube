const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, "users.json");

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public"))); // Serve frontend files

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    const data = fs.readFileSync(USERS_FILE, "utf-8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Failed to parse users.json:", err);
    return [];
  }
}

function writeUsers(users) {
  try {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
  } catch (err) {
    console.error("Failed to write users.json:", err);
  }
}

// LOGIN endpoint
app.post("/login", (req, res) => {
  let { email, password } = req.body;
  if (email) email = email.toLowerCase();

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const users = readUsers();
  const user = users.find(u => u.email === email);

  if (email === "admin@admin" && password === "admin") {
    return res.json({ role: "admin", message: "Admin login successful." });
  }

  if (!user) {
    return res.status(404).json({ message: "User not found. Please signup." });
  }

  if (user.password !== password) {
    return res.status(401).json({ message: "Incorrect password." });
  }

  if (!user.paid) {
    return res.json({ message: "Login successful. Free trial 30 days." });
  }

  res.json({ message: "Login successful." });
});

// SIGNUP endpoint
app.post("/signup", (req, res) => {
  let { email, password, repeatPassword, paid } = req.body;
  if (email) email = email.toLowerCase();

  if (!email || !password || !repeatPassword || typeof paid !== "boolean") {
    return res.status(400).json({ message: "All fields including paid status are required." });
  }

  if (password !== repeatPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  const users = readUsers();
  if (users.some(u => u.email === email)) {
    return res.status(409).json({ message: "Email already exists." });
  }

  users.push({ email, password, paid });
  writeUsers(users);

  res.status(201).json({
    message: paid
      ? "Signup successful."
      : "Signup successful. Free trial 30 days."
  });
});

// Admin: Get all users
app.get("/users", (req, res) => {
  const users = readUsers();
  res.json(users);
});

// Admin: Delete a user by email
app.delete("/users/:email", (req, res) => {
  const emailToDelete = req.params.email.toLowerCase();
  let users = readUsers();
  const initialLength = users.length;

  users = users.filter(u => u.email !== emailToDelete);
  if (users.length === initialLength) {
    return res.status(404).json({ message: "User not found." });
  }

  writeUsers(users);
  res.json({ message: `User ${emailToDelete} deleted.` });
});


app.listen(PORT, () => {
  console.log(`🚀 Login server running on http://localhost:${PORT}`);
});
