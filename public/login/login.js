const loginForm = document.getElementById('loginForm');
const errorEl = document.getElementById('error');
const loadingEl = document.getElementById('loading');
const passwordInput = document.getElementById('password');
const togglePasswordBtn = document.getElementById('togglePassword');

// Password Visibility Toggle
togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.textContent = isPassword ? '🙈' : '👁️';
});

// Login Form Submit Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.style.display = 'none';
    errorEl.textContent = '';
    loadingEl.style.display = 'block';

    const usernameInput = document.getElementById('username').value.trim();
    const passwordInputValue = passwordInput.value.trim();

    const credentials = {
        username: usernameInput,
        password: passwordInputValue
    };

    try {
        // 1. Attempt API authentication with Express backend
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(credentials)
        });

        const result = await response.json();

        if (response.ok && result.success) {
            localStorage.setItem('authToken', result.token || 'active-session');
            window.location.href = 'catalog.html';
            return;
        } else {
            throw new Error(result.message || 'Invalid username or password.');
        }

    } catch (err) {
        // 2. Offline Fallback Validation: user123 / admin123
        if (usernameInput === 'user123' && passwordInputValue === 'admin123') {
            localStorage.setItem('authToken', 'offline-session-token');
            window.location.href = 'catalog.html';
        } else {
            errorEl.textContent = err.message || 'Invalid username or password.';
            errorEl.style.display = 'block';
        }
    } finally {
        loadingEl.style.display = 'none';
    }
});