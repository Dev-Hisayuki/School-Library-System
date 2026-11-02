const API_URL = `${window.location.origin}/api/borrows`;

const tableBody = document.getElementById('borrowingsTableBody');
const loadingMessage = document.getElementById('loadingMessage');
const errorMessage = document.getElementById('errorMessage');
const searchInput = document.getElementById('borrowSearch');
const refreshBtn = document.getElementById('refreshBtn');

const totalActive = document.getElementById('totalActive');
const totalBorrowed = document.getElementById('totalBorrowed');
const totalOverdue = document.getElementById('totalOverdue');
const recordCount = document.getElementById('recordCount');

let borrowings = [];

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, character => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    })[character]);
}

function formatDate(value) {
    if (!value) return '—';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return date.toLocaleDateString('en-PH', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'Asia/Manila'
    });
}

function updateSummary(records) {
    if (totalActive) {
        totalActive.textContent = records.length;
    }

    if (totalBorrowed) {
        totalBorrowed.textContent = records.filter(
            record => record.status === 'Borrowed'
        ).length;
    }

    if (totalOverdue) {
        totalOverdue.textContent = records.filter(
            record => record.status === 'Overdue'
        ).length;
    }
}

function renderBorrowings(records) {
    if (!tableBody) return;

    if (!records.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cell">
                    <i class="fa-solid fa-book-open"></i>
                    <p>No active borrowing records found.</p>
                </td>
            </tr>
        `;

        if (recordCount) {
            recordCount.textContent = 'Showing 0 records';
        }

        return;
    }

    tableBody.innerHTML = records.map(record => {
        const isOverdue = record.status === 'Overdue';
        const statusClass = isOverdue ? 'overdue' : 'borrowed';

        return `
            <tr>
                <td class="borrow-id">
                    #${escapeHTML(record.borrow_id)}
                </td>

                <td>
                    <span class="student-name">
                        ${escapeHTML(record.student_name)}
                    </span>

                    <span class="student-number">
                        ${escapeHTML(record.student_number)}
                    </span>
                </td>

                <td class="book-title">
                    ${escapeHTML(record.book_title)}
                </td>

                <td>${formatDate(record.borrow_date)}</td>

                <td>${formatDate(record.due_date)}</td>

                <td>
                    <span class="status-badge ${statusClass}">
                        <i class="fa-solid ${
                            isOverdue
                                ? 'fa-triangle-exclamation'
                                : 'fa-clock'
                        }"></i>

                        ${escapeHTML(record.status)}
                    </span>
                </td>
            </tr>
        `;
    }).join('');

    if (recordCount) {
        recordCount.textContent =
            `Showing ${records.length} record${records.length === 1 ? '' : 's'}`;
    }
}

function filterBorrowings() {
    if (!searchInput) {
        renderBorrowings(borrowings);
        return;
    }

    const searchTerm = searchInput.value.trim().toLowerCase();

    const filteredRecords = borrowings.filter(record => {
        const searchableValues = [
            record.borrow_id,
            record.student_name,
            record.student_number,
            record.book_title,
            record.borrow_date,
            record.due_date,
            record.status
        ];

        return searchableValues.some(value =>
            String(value ?? '').toLowerCase().includes(searchTerm)
        );
    });

    renderBorrowings(filteredRecords);
}

async function loadBorrowings() {
    if (!tableBody) return;

    if (loadingMessage) {
        loadingMessage.hidden = false;
    }

    if (errorMessage) {
        errorMessage.hidden = true;
        errorMessage.textContent = '';
    }

    if (refreshBtn) {
        refreshBtn.disabled = true;
    }

    tableBody.innerHTML = '';

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || `Request failed (${response.status})`
            );
        }

        borrowings = Array.isArray(result.data)
            ? result.data
            : [];

        updateSummary(borrowings);
        filterBorrowings();

    } catch (error) {
        console.error('Failed to load borrowing records:', error);

        borrowings = [];
        updateSummary([]);

        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cell">
                    Unable to load borrowing records.
                </td>
            </tr>
        `;

        if (errorMessage) {
            errorMessage.textContent =
                error.message || 'An unexpected error occurred.';

            errorMessage.hidden = false;
        }

        if (recordCount) {
            recordCount.textContent = 'Unable to retrieve records';
        }

    } finally {
        if (loadingMessage) {
            loadingMessage.hidden = true;
        }

        if (refreshBtn) {
            refreshBtn.disabled = false;
        }
    }
}

const themeToggleBtn = document.getElementById('themeToggleBtn');

function applyTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';

    document.body.classList.toggle('dark-mode', isDark);

    if (themeToggleBtn) {
        themeToggleBtn.textContent = isDark ? 'On' : 'Off';
    }
}

applyTheme();

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-mode');

        localStorage.setItem(
            'theme',
            isDark ? 'light' : 'dark'
        );

        applyTheme();
    });
}

const logoutBtn = document.getElementById('logoutBtn');

if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '../login/login.html';
    });
}

if (refreshBtn) {
    refreshBtn.addEventListener('click', loadBorrowings);
}

if (searchInput) {
    searchInput.addEventListener('input', filterBorrowings);
}

loadBorrowings();