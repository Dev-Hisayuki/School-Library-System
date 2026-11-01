document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('borrowerTableBody');
    const registerForm = document.getElementById('registerForm');
    const registerCard = document.getElementById('registerCard');
    const messageBox = document.getElementById('messageBox');
    const searchInput = document.getElementById('searchInput');

    let borrowers = [];

    // Dark mode
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    document.getElementById('themeToggleBtn').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem(
            'theme',
            document.body.classList.contains('dark-mode') ? 'dark' : 'light'
        );
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '../login/login.html';
    });

    // Display messages
    function showMessage(message, type) {
        messageBox.textContent = message;
        messageBox.className = `message-box ${type}`;
    }

    // Load borrowers
    async function loadBorrowers() {
        tableBody.innerHTML = `
            <tr><td colspan="3">Loading borrowers...</td></tr>
        `;

        try {
            const response = await fetch('/api/borrowers');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to load borrowers');
            }

            borrowers = result.data;
            displayBorrowers(borrowers);

        } catch (error) {
            tableBody.innerHTML = `
                <tr><td colspan="3">Unable to load borrowers.</td></tr>
            `;
            showMessage(error.message, 'error');
        }
    }

    // Display borrower rows
    function displayBorrowers(list) {
        if (list.length === 0) {
            tableBody.innerHTML = `
                <tr><td colspan="3">No borrowers found.</td></tr>
            `;
            return;
        }

        tableBody.innerHTML = list.map(borrower => `
            <tr>
                <td>${borrower.borrower_id}</td>
                <td>${borrower.student_id}</td>
                <td>${escapeHTML(borrower.student_name)}</td>
            </tr>
        `).join('');
    }

    // Safely display student names
    function escapeHTML(value) {
        return String(value).replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    }

    // Open registration form
    document.getElementById('showRegisterBtn').addEventListener('click', () => {
        registerCard.hidden = false;
        document.getElementById('studentId').focus();
    });

    // Close registration form
    document.getElementById('cancelRegisterBtn').addEventListener('click', () => {
        registerCard.hidden = true;
        registerForm.reset();
    });

    // Register borrower
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const studentId = document.getElementById('studentId').value;

        try {
            const response = await fetch('/api/borrowers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    student_id: studentId
                })
            });

            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Registration failed');
            }

            showMessage('Borrower registered successfully!', 'success');

            registerForm.reset();
            registerCard.hidden = true;

            await loadBorrowers();

        } catch (error) {
            showMessage(error.message, 'error');
        }
    });

    // Search borrowers
    searchInput.addEventListener('input', () => {
        const search = searchInput.value.toLowerCase();

        const filtered = borrowers.filter(borrower =>
            String(borrower.borrower_id).includes(search) ||
            String(borrower.student_id).includes(search) ||
            borrower.student_name.toLowerCase().includes(search)
        );

        displayBorrowers(filtered);
    });

    // Refresh list
    document.getElementById('refreshBtn').addEventListener('click', loadBorrowers);

    // Initial loading
    loadBorrowers();
});
