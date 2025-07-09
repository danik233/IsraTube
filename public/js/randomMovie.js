const diceBtn = document.getElementById('random-dice-btn');

diceBtn?.addEventListener('click', () => {
    console.log("[🎲 RandomMovie] Button clicked");

    const originalText = diceBtn.querySelector('p');
    if (originalText) {
        originalText.textContent = "Finding...";
    }

    getRandomMovie().finally(() => {
        // If we didn't redirect, restore the button text
        if (originalText) {
            originalText.textContent = "Random";
        }
    });
});

async function getRandomMovie() {
    const fallbackKeywords = [
        "life", "star", "love", "war", "hero", "future", "ghost", "dark", "day", "game",
        "night", "fire", "water", "earth", "sky", "dream", "shadow", "king", "queen", "battle",
        "moon", "sun", "death", "secret", "lost", "power", "magic", "quest", "legend", "road",
        "escape", "storm", "angel", "demon", "city", "forest", "river", "island", "kingdom", "warrior"
    ];

    const minYear = 2010;
    const maxYear = 2025;

    for (let i = 0; i < fallbackKeywords.length; i++) {
        const keyword = fallbackKeywords[i];
        const year = Math.floor(Math.random() * (maxYear - minYear + 1)) + minYear;
        console.log(`[🎲 Attempt ${i + 1}] Searching for "${keyword}" in ${year}`);

        try {
            const res = await fetch(`https://www.omdbapi.com/?apikey=b7a4aa1e&s=${encodeURIComponent(keyword)}&y=${year}&type=movie`);
            const data = await res.json();

            if (data.Response === "True" && Array.isArray(data.Search)) {
                const filtered = data.Search.filter(m => m.Type === "movie" && m.Poster !== "N/A");

                if (filtered.length > 0) {
                    const randomMovie = filtered[Math.floor(Math.random() * filtered.length)];
                    console.log(`[🎯 Redirecting to movieIMDB.html?imdbID=${randomMovie.imdbID}]`);

                    // ✅ Redirect will end execution here, so no need to restore text
                    window.location.href = `movieIMDB.html?imdbID=${randomMovie.imdbID}`;
                    return;
                }
            }

            console.warn(`[⚠️ Attempt ${i + 1}] No suitable movies found for "${keyword}" in ${year}`);
        } catch (err) {
            console.error(`[❌ Attempt ${i + 1}] Error:`, err);
        }
    }

    alert("🎲 No random movie found after all attempts. Try again.");
}
