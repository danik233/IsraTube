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