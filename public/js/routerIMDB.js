let favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

async function syncFavoritesToMongo() {
    const email = sessionStorage.getItem('email');
    if (!email) {
        console.warn("No user is logged in. Cannot sync favorites.");
        return;
    }

    try {
        const res = await fetch(`/api/users/${encodeURIComponent(email)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                newFavArray: favorites
            })
        });

        const data = await res.json();
        if (res.ok) {
            console.log("✅ Favorites synced to MongoDB:", data.message);
        } else {
            console.error("❌ Failed to sync favorites:", data.error || data.message);
        }
    } catch (err) {
        console.error("❌ Error syncing favorites:", err);
    }
}

window.addEventListener('beforeunload', () => {
    syncFavoritesToMongo();
});