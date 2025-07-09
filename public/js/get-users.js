// ✅ DOMContentLoaded handler (no changes here)
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

            row.innerHTML = `
                <td>${user.email}</td>
                <td>${user.paid ? "✅" : "❌"}</td>
                <td>${favHtml}</td>
                <td>${user.signupDate ? new Date(user.signupDate).toLocaleDateString() : "N/A"}</td>
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

// ✅ Delete user (no changes)
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

// ✅ Update user WITHOUT changing paid status
async function changeUser(email) {
    const newEmail = prompt("New email:", email);
    if (!newEmail) return alert("Email is required");

    const newPassword = prompt("New password:");

    const updatePayload = { newEmail };
    if (newPassword) updatePayload.newPassword = newPassword;

    try {
        const res = await fetch(`/api/users/${encodeURIComponent(email)}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatePayload)
        });

        const data = await res.json();

        if (!res.ok) {
            alert("Failed to update: " + (data.error || data.message));
            return;
        }

        alert(data.message);
        location.reload();
    } catch (err) {
        console.error("❌ Update error:", err);
        alert("Failed to update user.");
    }
}
