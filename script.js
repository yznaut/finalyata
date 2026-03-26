let movies = [];
let users = JSON.parse(localStorage.getItem('mwm_users')) || [];
let isSignUpMode = false;
let movieToFinish = null;
let currentTab = 'Watching';

// --- PASSWORD & AUTH ---
function togglePass(id) {
    const el = document.getElementById(id);
    el.type = el.type === "password" ? "text" : "password";
}

document.getElementById('toggle-auth').onclick = (e) => {
    e.preventDefault();
    isSignUpMode = !isSignUpMode;
    document.getElementById('auth-title').innerText = isSignUpMode ? "Sign Up" : "Sign In";
    document.getElementById('auth-submit-btn').innerText = isSignUpMode ? "Register" : "Login";
    document.getElementById('register-only-fields').style.display = isSignUpMode ? "block" : "none";
};

document.getElementById('auth-submit-btn').onclick = () => {
    const user = document.getElementById('auth-username').value;
    const pass = document.getElementById('auth-password').value;
    const confirm = document.getElementById('auth-confirm-password').value;

    if (isSignUpMode) {
        const hasSymbol = /[!@#$%^&*]/.test(pass);
        const hasNumber = /\d/.test(pass);
        if (pass.length < 8 || !hasSymbol || !hasNumber) return alert("Password needs 8+ chars, 1 number, 1 symbol.");
        if (pass !== confirm) return alert("Passwords do not match!");
        
        users.push({ user, pass });
        localStorage.setItem('mwm_users', JSON.stringify(users));
        alert("Account created! Now Sign In.");
        location.reload();
    } else {
        const found = users.find(u => u.user === user && u.pass === pass);
        if (found) {
            document.getElementById('auth-overlay').style.display = 'none';
            document.getElementById('main-app').style.display = 'flex';
            document.getElementById('display-user').innerText = user;
            document.getElementById('profile-name').innerText = user;
            renderMovies();
        } else {
            alert("Login failed. Sign up if you don't have an account.");
        }
    }
};

// --- SYSTEM LOGIC ---
function showPage(id) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.getElementById('page-' + id).style.display = 'block';
    document.getElementById('nav-' + id).classList.add('active');
}

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('tab-watching').classList.toggle('active', tab === 'Watching');
    document.getElementById('tab-watched').classList.toggle('active', tab === 'Watched');
    document.getElementById('add-btn-main').style.display = (tab === 'Watching') ? 'block' : 'none';
    renderMovies();
}

function openModal(id) { document.getElementById(id).style.display = 'flex'; }
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

function saveMovie() {
    const title = document.getElementById('inp-title').value;
    const genre = document.getElementById('inp-genre').value;
    const poster = document.getElementById('inp-poster').value;
    const date = document.getElementById('inp-date').value;

    if (title) {
        movies.push({ title, genre, poster: poster || 'https://via.placeholder.com/200x280?text=No+Poster', date, status: 'Watching', rating: '', comment: '' });
        closeModal('movie-modal');
        renderMovies();
    }
}

function openFinishModal(title) {
    movieToFinish = title;
    openModal('rate-modal');
}

document.getElementById('confirm-finish-btn').onclick = () => {
    const movie = movies.find(m => m.title === movieToFinish);
    if (movie) {
        movie.status = 'Watched';
        movie.rating = "★".repeat(document.getElementById('inp-rating').value);
        movie.comment = document.getElementById('inp-comment').value;
    }
    closeModal('rate-modal');
    renderMovies();
};

function deleteMovie(title) {
    movies = movies.filter(m => m.title !== title);
    renderMovies();
}

function renderMovies() {
    const grid = document.getElementById('movie-grid');
    grid.innerHTML = '';
    const filtered = movies.filter(m => m.status === currentTab);

    filtered.forEach(m => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img src="${m.poster}" class="movie-poster">
            <h4>${m.title}</h4>
            <p><strong>Genre:</strong> ${m.genre}</p>
            ${m.status === 'Watched' ? `<p><strong>Rating:</strong> ${m.rating}</p><p><strong>Comment:</strong> ${m.comment}</p>` : ''}
            <div style="margin-top:10px; display:flex; gap:10px;">
                ${m.status === 'Watching' ? `<button onclick="openFinishModal('${m.title}')" class="primary-btn" style="padding:5px">Finish</button>` : ''}
                <button onclick="deleteMovie('${m.title}')" style="color:red; background:none; border:none; cursor:pointer;">Delete</button>
            </div>
        `;
        grid.appendChild(card);
    });
}

function logout() { location.reload(); }
