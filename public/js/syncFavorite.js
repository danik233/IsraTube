// syncFavorites.js
(async function syncFavoritesImmediately() {
    const email = sessionStorage.getItem("email");
    const localFavs = JSON.parse(localStorage.getItem("favorites") || "[]");

    if (!email || !localFavs.length) return;

    try {
        const res = await fetch(`/api/users/${encodeURIComponent(email)}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ newFavArray: localFavs })
        });

        const data = await res.json();

        if (res.ok) {
            console.log("✅ Synced favorites immediately on page load.");
        } else {
            console.error("❌ Failed to sync favorites:", data.error || data.message);
        }
    } catch (err) {
        console.error("❌ Error syncing favorites:", err);
    }
})();
