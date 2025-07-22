const loginBtn = document.getElementById("loginBtn");

async function handleLogin() {
    const emailInput = document.getElementById("emailInput");
    const passInput = document.getElementById("passInput");

    const email = emailInput.value.trim().toLowerCase();
    const password = passInput.value;

    if (!email || !password) {
        alert("Please enter both email and password.");
        return;
    }

    try {
        const response = await fetch("/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (!response.ok) {
            alert(data.message || "Login failed.");
            return;
        }

        sessionStorage.setItem("email", email);
        if (data.role) sessionStorage.setItem("role", data.role);

        alert(data.message || "Login successful.");

        if (data.redirect) {
            await syncLocalFavoritesToMongo(email);  // 🔄 Sync localStorage to MongoDB
            window.location.href = data.redirect;
        }

    } catch (error) {
        console.error("Login error:", error);
        alert("Server error. Please try again later.");
    }
}

loginBtn.addEventListener("click", handleLogin);

// Enter key support
["emailInput", "passInput"].forEach(id => {
    const input = document.getElementById(id);
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            handleLogin();
        }
    });
});

document.getElementById("signupBtn").addEventListener("click", () => {
    window.location.href = "signup.html";
});

async function syncLocalFavoritesToMongo(email) {
    const favorites = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (!favorites.length) return;

    try {
        const res = await fetch(`/api/users/${encodeURIComponent(email)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newFavArray: favorites })
        });

        const data = await res.json();
        if (res.ok) {
            console.log("✅ Synced local favorites to MongoDB after login");
        } else {
            console.error("❌ Failed to sync favorites:", data.error || data.message);
        }
    } catch (err) {
        console.error("❌ Error syncing favorites:", err);
    }
}

// ✅ Forgot Password Feature
// document.getElementById("forgotPasswordBtn").addEventListener("click", async () => {
//     const email = prompt("Enter your registered email:");
//     if (!email) return alert("Email is required.");

//     const newPassword = prompt("Enter your new password:");
//     if (!newPassword) return alert("New password is required.");

//     try {
//         const res = await fetch(`/api/users/${encodeURIComponent(email.trim().toLowerCase())}`, {
//             method: "PUT",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ newPassword })
//         });

//         const data = await res.json();
//         if (res.ok) {
//             alert("✅ Password changed successfully. You can now login with your new password.");
//         } else {
//             alert("❌ " + (data.message || "Failed to change password."));
//         }
//     } catch (err) {
//         console.error("❌ Forgot password error:", err);
//         alert("Server error. Please try again later.");
//     }
// });

const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const editModal = document.getElementById("editModal");
const closeModalBtn = document.getElementById("closeModal");
const editForm = document.getElementById("editForm");
const editStatus = document.getElementById("editStatus");

// Open modal on forgot password button click
forgotPasswordBtn.addEventListener("click", () => {
    // Clear form and status
    editForm.reset();
    editStatus.textContent = "";
    editModal.style.display = "block";
});

// Close modal when clicking the X button
closeModalBtn.addEventListener("click", () => {
    editModal.style.display = "none";
});

// Close modal if user clicks outside modal content
window.addEventListener("click", (event) => {
    if (event.target === editModal) {
        editModal.style.display = "none";
    }
});

// Handle form submission for forgot password update
editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("modalEmail").value.trim().toLowerCase();
    const newPassword = document.getElementById("modalPassword").value;

    if (!email) {
        editStatus.textContent = "Email is required.";
        return;
    }
    if (!newPassword) {
        editStatus.textContent = "New password is required.";
        return;
    }

    editStatus.textContent = "Updating password...";

    try {
        const res = await fetch(`/api/users/${encodeURIComponent(email)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ newPassword })
        });

        const data = await res.json();

        if (res.ok) {
            editStatus.textContent = "✅ Password changed successfully. You can now login with your new password.";
            // Optionally close modal after a delay
            setTimeout(() => {
                editModal.style.display = "none";
            }, 2500);
        } else {
            editStatus.textContent = "❌ " + (data.message || "Failed to change password.");
        }
    } catch (err) {
        console.error("Forgot password modal error:", err);
        editStatus.textContent = "Server error. Please try again later.";
    }
});