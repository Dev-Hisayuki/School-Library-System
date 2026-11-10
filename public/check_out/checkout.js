
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

const themeToggleBtn = document.getElementById('themeToggleBtn');
const logoutBtn = document.getElementById('logoutBtn');

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

// DATE HANDLING - USES THE EXACT DATABASE DATE
function getDateKey(value) {
    if (!value) return null;

    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);

    if (!match) return null;

    const dateKey = match[1];
    const [year, month, day] = dateKey.split('-').map(Number);

    const date = new Date(Date.UTC(year, month - 1, day));

    if (
        date.getUTCFullYear() !== year ||
        date.getUTCMonth() !== month - 1 ||
        date.getUTCDate() !== day
    ) {
        return null;
    }

    return dateKey;
}

function formatDate(value) {
    const dateKey = getDateKey(value);

    if (!dateKey) return '—';

    const [year, month, day] = dateKey.split('-').map(Number);

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return `${months[month - 1]} ${day}, ${year}`;
}

function isDateOverdue(dueDate) {
    const dueDateKey = getDateKey(dueDate);

    if (!dueDateKey) return false;

    const todayKey = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Manila',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).format(new Date());

    return dueDateKey < todayKey;
}

// BORROWING STATUS
function getDisplayStatus(record) {
    if (record.status === 'Returned') {
        return 'Returned';
    }

    if (
        record.status === 'Overdue' ||
        isDateOverdue(record.due_date)
    ) {
        return 'Overdue';
    }

    return record.status || 'Borrowed';
}

// SUMMARY CARDS
function updateSummary(records) {
    const activeRecords = records.filter(record => {
        return getDisplayStatus(record) !== 'Returned';
    });

    const borrowedRecords = activeRecords.filter(record => {
        return getDisplayStatus(record) === 'Borrowed';
    });

    const overdueRecords = activeRecords.filter(record => {
        return getDisplayStatus(record) === 'Overdue';
    });

    if (totalActive) {
        totalActive.textContent = activeRecords.length;
    }

    if (totalBorrowed) {
        totalBorrowed.textContent = borrowedRecords.length;
    }

    if (totalOverdue) {
        totalOverdue.textContent = overdueRecords.length;
    }
}

// RENDER BORROWING RECORDS
function renderBorrowings(records) {
    if (!tableBody) return;

    if (!records.length) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-cell">
                    <i class="fa-solid fa-book-open"></i>
                    <p>No borrowing records found.</p>
                </td>
            </tr>
        `;

        if (recordCount) {
            recordCount.textContent = 'Showing 0 records';
        }

        return;
    }

    tableBody.innerHTML = records.map(record => {
        const status = getDisplayStatus(record);

        const isOverdue = status === 'Overdue';
        const isReturned = status === 'Returned';

        const statusClass = isReturned
            ? 'returned'
            : isOverdue
                ? 'overdue'
                : 'borrowed';

        const statusIcon = isReturned
            ? 'fa-circle-check'
            : isOverdue
                ? 'fa-triangle-exclamation'
                : 'fa-clock';

        return `
            <tr>
                <td class="borrow-id">
                    #${escapeHTML(record.borrow_id)}
                </td>

                <td>
                    <span class="student-name">
                        ${escapeHTML(record.student_name || 'Unknown Student')}
                    </span>

                    <span class="student-number">
                        ${escapeHTML(record.student_number || '—')}
                    </span>
                </td>

                <td class="book-title">
                    ${escapeHTML(record.book_title || 'Unknown Book')}
                </td>

                <td>
                    ${formatDate(record.borrow_date)}
                </td>

                <td>
                    ${formatDate(record.due_date)}
                </td>

                <td>
                    <span class="status-badge ${statusClass}">
                        <i class="fa-solid ${statusIcon}"></i>
                        ${escapeHTML(status)}
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

// SEARCH AND FILTER
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
            formatDate(record.borrow_date),
            formatDate(record.due_date),
            getDisplayStatus(record)
        ];

        return searchableValues.some(value =>
            String(value ?? '').toLowerCase().includes(searchTerm)
        );
    });

    renderBorrowings(filteredRecords);
}

// LOAD BORROWING RECORDS
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

    tableBody.innerHTML = `
        <tr>
            <td colspan="6" class="empty-cell">
                Loading borrowing records...
            </td>
        </tr>
    `;

    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        let result;

        try {
            result = await response.json();
        } catch {
            throw new Error('The server returned an invalid response.');
        }

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
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>Unable to load borrowing records.</p>
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

// THEME
function applyTheme() {
    const isDark = localStorage.getItem('theme') === 'dark';

    document.body.classList.toggle('dark-mode', isDark);

    if (themeToggleBtn) {
        themeToggleBtn.textContent = isDark ? 'On' : 'Off';
    }
}

applyTheme();

themeToggleBtn?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-mode');

    localStorage.setItem(
        'theme',
        isDark ? 'light' : 'dark'
    );

    applyTheme();
});

// LOGOUT
logoutBtn?.addEventListener('click', () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('admin');

    sessionStorage.clear();

    window.location.href = '../login/login.html';
});

// EVENT LISTENERS
refreshBtn?.addEventListener('click', loadBorrowings);
searchInput?.addEventListener('input', filterBorrowings);

// INITIAL LOAD
loadBorrowings();
