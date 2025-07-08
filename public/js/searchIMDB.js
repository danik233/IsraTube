
const API_KEY = 'b7a4aa1e';
const searchInput = document.getElementById('searchInput');
const mainContent = document.getElementById('mainContent');
const filterBtn = document.getElementById('filterBtn');
const filterPanel = document.getElementById('filterPanel');
const genreContainer = document.getElementById('genreCheckboxes');
const loadMoreBtn = document.getElementById('loadMoreBtn');


const keyboardIcon = document.getElementById('keyboardIcon');
const searchIcon = document.getElementById('searchIcon');


let favorites = [],
    lastResults = [],
    detailedCache = {},
    selectedGenres = [],
    searchTerm = '',
    currentPage = 1;

window.addEventListener('load', () => {
    const stored = localStorage.getItem('favorites');
    if (stored) favorites = JSON.parse(stored);
    populateGenreList();
});


window.addEventListener('load', () => {
    searchInput.focus();
});



filterBtn.addEventListener('click', () => filterPanel.classList.toggle('hidden'));

genreContainer.addEventListener('change', () => {
    selectedGenres = Array.from(
        genreContainer.querySelectorAll('input:checked')
    ).map(cb => cb.value);
    renderResults();
});

searchInput.addEventListener('input', debounce(async () => {
    const newTerm = searchInput.value.trim();
    if (newTerm.length === 0) {
        searchTerm = '';
        mainContent.innerHTML = '';
        loadMoreBtn.classList.add('hidden');
        return;
    }
    if (newTerm === searchTerm) return; // skip if unchanged

    searchTerm = newTerm;
    currentPage = 1;
    detailedCache = {};
    lastResults = [];

    await fetchAndAppendPage(currentPage);
    renderResults();
}, 300));

async function fetchAndAppendPage(page) {
    const res = await fetch(
        `https://www.omdbapi.com/?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&page=${page}`
    ).then(r => r.json());
    if (res.Response === 'True') {
        lastResults.push(...res.Search);
    }
    updateLoadMoreVisibility(res);
}

function updateLoadMoreVisibility(apiResponse) {
    const maxReached = lastResults.length >= 30 || apiResponse.Response === 'False';
    const hideForFilter = selectedGenres.length > 0;
    if (maxReached || hideForFilter) {
        loadMoreBtn.classList.add('hidden');
    } else {
        loadMoreBtn.classList.remove('hidden');
    }
}

loadMoreBtn.addEventListener('click', async () => {
    if (searchTerm && currentPage < 3) {
        currentPage++;
        await fetchAndAppendPage(currentPage);
        renderResults();
    }
});

async function renderResults() {
    const detailed = await Promise.all(
        lastResults.map(m =>
            detailedCache[m.imdbID]
                ? Promise.resolve(detailedCache[m.imdbID])
                : fetch(
                    `https://www.omdbapi.com/?apikey=${API_KEY}&i=${m.imdbID}`
                )
                    .then(r => r.json())
                    .then(d => {
                        detailedCache[m.imdbID] = d;
                        return d;
                    })
        )
    );

    const validMovies = detailed.filter(d => {
        const runtimeMinutes = parseInt(d.Runtime);
        return (
            d.Response === 'True' &&
            d.Type === 'movie' &&
            runtimeMinutes &&
            runtimeMinutes > 40
        );
    });

    const toShow = selectedGenres.length
        ? validMovies.filter(d =>
            selectedGenres.every(g =>
                d.Genre?.split(',').map(x => x.trim()).includes(g)
            )
        )
        : validMovies;

    if (validMovies.length && toShow.length === 0) {
        mainContent.innerHTML = `<p>No matching genres for “${searchTerm}”.</p>`;
        loadMoreBtn.classList.add('hidden');
    } else if (toShow.length === 0) {
        mainContent.innerHTML = `<p>No results for “${searchTerm}”.</p>`;
        loadMoreBtn.classList.add('hidden');
    } else {
        displayMovies(toShow);
        updateLoadMoreVisibility({ Response: 'True' });
    }
}



function displayMovies(movies) {
    mainContent.innerHTML = '';
    const isDarkMode = localStorage.getItem("darkMode") === "true";

    movies.forEach(m => {
        const div = document.createElement('div');
        div.className = 'movie';
        div.style.backgroundColor = isDarkMode ? '#333333' : '#999999';

        const isFav = favorites.some(f => f.imdbID === m.imdbID);

        div.innerHTML = `
            <a href="movieIMDB.html?imdbID=${m.imdbID}">
                <img src="${m.Poster && m.Poster !== 'N/A' ? m.Poster : 'images/error-img.png'}"
                     alt="${m.Title}"
                     onerror="this.onerror=null;this.src='images/error-img.png';"/>
            </a>
            <div class="movieText">
                <h2>${m.Title}</h2><br>
                <p><strong>Year:</strong> ${m.Year}</p><br>
                <p><strong>Genre:</strong> ${m.Genre}</p><br>
                <p><strong>Rating:</strong> ${m.imdbRating}</p><br>
                <button class="fav-btn" data-id="${m.imdbID}" ${isFav ? 'disabled' : ''}>
                    ${isFav ? 'In Favorites' : 'Add to Favorites'}
                </button>
            </div>
        `;

        const textElements = div.querySelectorAll('.movieText p, .movieText h2');
        textElements.forEach(el => {
            el.style.color = isDarkMode ? 'white' : 'black';
        });

        const btn = div.querySelector('.fav-btn');
        btn.style.backgroundColor = isFav ? 'green' : 'rgb(245,197,24)';
        btn.style.color = isFav ? 'black' : 'initial';
        btn.style.opacity = '1';

        if (!isFav) {
            btn.addEventListener('click', () => {
                if (!favorites.some(f => f.imdbID === m.imdbID)) {
                    favorites.push(m);
                    localStorage.setItem('favorites', JSON.stringify(favorites));
                    btn.textContent = 'In Favorites';
                    btn.style.backgroundColor = 'green';
                    btn.style.color = 'black';
                    btn.disabled = true;
                }
            });
        }

        mainContent.appendChild(div);
    });
}



function populateGenreList() {
    const genres = [
        'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
        'Documentary', 'Drama', 'Family', 'Fantasy', 'History',
        'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
    ];
    genreContainer.innerHTML = genres.map(g =>
        `<label><input type=\"checkbox\" value=\"${g}\" /> ${g}</label>`
    ).join('');
}

function debounce(fn, delay) {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
}

// === VIRTUAL KEYBOARD === //
window.addEventListener('load', () => {
    // 1. Create & inject keyboard container
    const keyboardContainer = document.createElement('div');
    keyboardContainer.id = 'virtualKeyboard';
    keyboardContainer.classList.add('hidden');
    document.body.appendChild(keyboardContainer);

    // 2. State + layout
    let capsLock = false;
    const keysLayout = [
        ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
        ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
        ['caps', 'z', 'x', 'c', 'v', 'b', 'n', 'm', '←'],
        ['space', 'clear', 'close']
    ];

    // 3. Toggle & render function
    keyboardIcon.addEventListener('click', () => {
        keyboardContainer.classList.toggle('hidden');
        if (!keyboardContainer.classList.contains('hidden')) renderKeyboard();
    });

    function renderKeyboard() {
        keyboardContainer.innerHTML = '';
        keysLayout.forEach(row => {
            const rowDiv = document.createElement('div');
            rowDiv.style.display = 'flex';

            row.forEach(key => {
                const btn = document.createElement('button');
                btn.textContent = key === 'space' ? '␣' : key;

                // Add class for function or space keys
                if (['caps', 'clear', 'close'].includes(key)) {
                    btn.classList.add('function-key');
                    if (key === 'caps' && capsLock) {
                        btn.classList.add('caps-active'); // Toggle caps style
                    }
                } else if (key === 'space') {
                    btn.classList.add('space-key');
                }

                btn.addEventListener('click', () => handleKeyPress(key));
                rowDiv.appendChild(btn);
            });

            keyboardContainer.appendChild(rowDiv);
        });
    }


    // 4. Handle presses
    function handleKeyPress(key) {
        // focus & place caret at end
        searchInput.focus();
        const end = searchInput.value.length;
        searchInput.setSelectionRange(end, end);

        if (key === 'space') {
            searchInput.value += ' ';
        } else if (key === 'clear') {
            searchInput.value = '';
        } else if (key === 'close') {
            keyboardContainer.classList.add('hidden');
            return;
        } else if (key === 'caps') {
            capsLock = !capsLock;
            renderKeyboard();
            return;
        } else if (key === '←') {
            searchInput.value = searchInput.value.slice(0, -1);
        } else {
            searchInput.value += (capsLock ? key.toUpperCase() : key);
        }

        // trigger your live search handler
        searchInput.dispatchEvent(new Event('input'));
    }
});
