// Helper to format date or show "N/A"
function formatDate(date) {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
}

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const res = await fetch("/api/users");
        if (!res.ok) throw new Error("Failed to fetch users");

        const users = await res.json();
        const table = document.querySelector("table");

        // Clear all previous rows except header
        document.querySelectorAll("tr:not(:first-child)").forEach(r => r.remove());

        users.forEach(user => {
            const row = document.createElement("tr");

            // Generate favorite movies thumbnails
            let favHtml = "None";
            if (Array.isArray(user.favArray) && user.favArray.length > 0) {
                favHtml = "<div style='display: flex; flex-wrap: wrap; gap: 8px;'>";
                favHtml += user.favArray.map(fav => {
                    const title = fav.Title || "Untitled";
                    const imdbID = fav.imdbID || "#";
                    const poster = fav.Poster && fav.Poster !== "N/A" ? fav.Poster : "images/error-img.png";

                    return `
                        <a href="movieIMDB.html?imdbID=${imdbID}&admin=true" title="${title}">
                            <img 
                                src="${poster}" 
                                alt="${title}" 
                                style="width: 60px; height: 90px; object-fit: cover; border-radius: 4px; box-shadow: 0 0 4px rgba(0,0,0,0.3);" 
                                onerror="this.src='images/error-img.png';"
                            />
                        </a>
                    `;
                }).join("");
                favHtml += "</div>";
            }

            // Format signup date
            const signedDate = formatDate(user.signupDate);

            // Calculate trial END date if user is not paid
            let endDate = "N/A";
            if (user.signupDate && user.paid === false) {
                const signup = new Date(user.signupDate);
                const trialEnd = new Date(signup.getTime() + 30 * 24 * 60 * 60 * 1000); // +30 days
                endDate = formatDate(trialEnd);
            }

            // Add one more <td> for END date
            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.paid ? "✅" : "❌"}</td>
                <td>${favHtml}</td>
                <td>${signedDate}</td>
                <td>${endDate}</td>
                <td>
                    <button onclick="deleteUser('${user.email}')">🗑️</button>
                    <button onclick="changeUser('${user.email}')">✏️</button>
                </td>
            `;

            table.appendChild(row);
        });

    } catch (err) {
        console.error("❌ Failed to load users:", err);
        alert("Failed to load users.");
    }
});

// Delete user (no changes)
async function deleteUser(email) {
    if (!confirm(`Delete ${email}?`)) return;

    try {
        const res = await fetch(`/api/users/${encodeURIComponent(email)}`, {
            method: "DELETE"
        });
        const data = await res.json();
        alert(data.message);
        location.reload();
    } catch (err) {
        console.error("❌ Delete error:", err);
        alert("Failed to delete user.");
    }
}

// Update user WITHOUT changing paid status (no changes)
let currentEditingEmail = null;

function changeUser(email) {
    currentEditingEmail = email;

    // Pre-fill modal fields
    document.getElementById("modalEmail").value = email;
    document.getElementById("modalPassword").value = "";

    // Show modal
    document.getElementById("editModal").style.display = "block";
}

// Handle modal close
document.getElementById("closeModal").onclick = () => {
    document.getElementById("editModal").style.display = "none";
    document.getElementById("editStatus").textContent = "";
};

// Handle form submission
document.getElementById("editForm").onsubmit = async (e) => {
    e.preventDefault();

    const newEmail = document.getElementById("modalEmail").value.trim();
    const newPassword = document.getElementById("modalPassword").value.trim();

    // Enforce password requirement
    if (!newPassword) {
        document.getElementById("editStatus").textContent = "❌ Password is required to update email.";
        return;
    }

    const updatePayload = {
        newEmail,
        newPassword
    };

    try {
        const res = await fetch(`/api/users/${encodeURIComponent(currentEditingEmail)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatePayload)
        });

        const data = await res.json();

        if (!res.ok) {
            document.getElementById("editStatus").textContent = "❌ " + (data.error || data.message);
            return;
        }

        document.getElementById("editStatus").textContent = "✅ " + data.message;
        setTimeout(() => location.reload(), 1000);
    } catch (err) {
        console.error("❌ Update error:", err);
        document.getElementById("editStatus").textContent = "Failed to update user.";
    }
};

// Close modal on outside click
window.onclick = (event) => {
    const modal = document.getElementById("editModal");
    if (event.target === modal) {
        modal.style.display = "none";
        document.getElementById("editStatus").textContent = "";
    }
};


