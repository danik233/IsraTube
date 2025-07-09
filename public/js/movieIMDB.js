const API_KEY = 'b7a4aa1e';
const container = document.getElementById('movieDetailPage');

const localImages = {
    "karate kid": "images/Karate Kid 1.png",
    "jab tak hai jaan": "images/Jab Tak Hai Jaan 1.png",
    "den of thieves": "images/movie3 1.png",
    "the life list": "images/movie4.png",
    "flight risk": "images/movie5 1.png",
    "mission: impossible - the final reckoning": "images/movie6.png",
    "tron: ares": "images/movie7.png"
};

const trailers = {
    "karate kid": "https://www.youtube.com/embed/LhRXf-yEQqA",
    "jab tak hai jaan": "https://www.youtube.com/embed/v0UXgoJ9Shg",
    "den of thieves": "https://www.youtube.com/embed/1kmjAnvFw3I",
    "the life list": "https://www.youtube.com/embed/nldAfgJrBr8",
    "flight risk": "https://www.youtube.com/embed/ojC9JBuccJA",
    "mission: impossible - the final reckoning": "https://www.youtube.com/embed/fsQgc9pCyDU",
    "tron: ares": "https://www.youtube.com/embed/9KVG_X_7Naw",
    "ted": "https://www.youtube.com/embed/9fbo_pQvU7M",
    "kal ho naa ho": "https://www.youtube.com/embed/1g1cJ56Zgvw"
};

async function fetchMovieDetails(id) {
    try {
        const r = await fetch(
            `https://www.omdbapi.com/?apikey=${API_KEY}&i=${id}&plot=full`
        );
        const data = await r.json();
        if (data.Response === 'True') displayMovieDetails(data);
        else container.innerHTML = '<p>Details not found.</p>';
    } catch (e) {
        console.error(e);
        container.innerHTML = '<p>Error loading details.</p>';
    }
}

function displayMovieDetails(m) {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    document.body.style.backgroundColor = isDarkMode ? "black" : "white";

    const normalizedTitle = m.Title.toLowerCase();

    // Decide poster source
    let posterSrc = '';
    if (localImages[normalizedTitle]) {
        posterSrc = localImages[normalizedTitle];
    } else if (m.Poster && m.Poster !== 'N/A') {
        posterSrc = m.Poster;
    } else {
        posterSrc = 'images/error-img.png';
    }

    // Decide trailer source
    let trailerSrc = trailers[normalizedTitle]
        ? trailers[normalizedTitle] + "?rel=0"
        : "https://www.youtube.com/embed/gDPb6YXKVrc?rel=0";


    container.innerHTML = `
    <div class="movie-box">
      <img
        src="${posterSrc}"
        alt="${m.Title} Poster"
        onerror="this.onerror=null;this.src='images/error-img.png';"
      />
      <div class="movie-details">
        <h2>${m.Title} (${m.Year})</h2><br>
        <p><strong>Released:</strong> ${m.Released}</p><br>
        <p><strong>IMDB Rating:</strong> ${m.imdbRating}</p><br>
        <p><strong>Genre:</strong> ${m.Genre}</p><br>
        <p><strong>Director:</strong> ${m.Director}</p><br>
        <p><strong>Writer:</strong> ${m.Writer}</p><br>
        <p><strong>Actors:</strong> ${m.Actors}</p><br>
        <p><strong>Plot:</strong> ${m.Plot}</p>
      </div>
    </div>

    <div class="trailer-container" style="margin-top:20px;">
      <iframe src="${trailerSrc}" title="Trailer for ${m.Title}" frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
    </div>
    `;

    // Style for dark/light mode
    const movieBox = container.querySelector('.movie-box');
    const movieDetailsText = container.querySelectorAll('.movie-details p, .movie-details h2');

    if (isDarkMode) {
        movieBox.style.backgroundColor = '#333333';
        movieDetailsText.forEach(el => el.style.color = 'white');
    } else {
        movieBox.style.backgroundColor = '#999999';
        movieDetailsText.forEach(el => el.style.color = 'black');
    }
}

const params = new URLSearchParams(window.location.search);
const id = params.get('imdbID');
if (id) fetchMovieDetails(id);
else container.innerHTML = '<p>No movie specified.</p>';



