const params = new URLSearchParams(window.location.search);
const title = decodeURIComponent(params.get('title') || '').trim();

const movieTitleEl = document.getElementById('movieTitle');
const ratingEl = document.getElementById('rating');
const descriptionEl = document.getElementById('description');
const posterEl = document.getElementById('moviePoster');
const trailerFrame = document.getElementById('movieTrailer');

if (!title) {
    movieTitleEl.textContent = "No movie specified";
    ratingEl.textContent = "Please provide a movie title in the URL.";
} else {
    movieTitleEl.textContent = title;
}

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

const normalizedTitle = title.toLowerCase();

if (title) {
    fetch(`https://www.omdbapi.com/?t=${encodeURIComponent(title)}&apikey=42b45790`)
        .then(response => response.json())
        .then(data => {
            if (data.Response === "True") {
                ratingEl.textContent = `IMDb Rating: ${data.imdbRating} / 10`;
                descriptionEl.textContent = `Description: ${data.Plot}`;

                // Handle poster
                if (localImages[normalizedTitle]) {
                    posterEl.src = localImages[normalizedTitle];
                    posterEl.alt = `${title} Poster`;
                    posterEl.style.display = "block";
                } else if (data.Poster && data.Poster !== "N/A") {
                    posterEl.src = data.Poster;
                    posterEl.alt = `${data.Title} Poster`;
                    posterEl.style.display = "block";
                } else {
                    posterEl.style.display = "none";
                }

                // Handle trailer
                if (trailers[normalizedTitle]) {
                    trailerFrame.src = trailers[normalizedTitle] + "?autoplay=1&rel=0";
                    trailerFrame.style.display = "block";
                } else {
                    trailerFrame.src = "https://www.youtube.com/embed/gDPb6YXKVrc?autoplay=1&rel=0";
                    trailerFrame.style.display = "block";
                }
            } else {
                ratingEl.textContent = "Movie not found.";
                descriptionEl.textContent = "";
                posterEl.style.display = "none";
                trailerFrame.style.display = "none";
            }
        })
        .catch(err => {
            ratingEl.textContent = "Error fetching rating.";
            console.error(err);
        });
}

// Comment system
const comments = [];
document.getElementById('submitComment').addEventListener('click', () => {
    const input = document.getElementById('commentInput');
    const text = input.value.trim();
    if (text) {
        comments.push(text);
        input.value = '';
        renderComments();
    }
});

function renderComments() {
    const list = document.getElementById('commentsList');
    list.innerHTML = '';
    comments.forEach(comment => {
        const li = document.createElement('li');
        li.className = 'comment';
        li.textContent = comment;
        list.appendChild(li);
    });
}