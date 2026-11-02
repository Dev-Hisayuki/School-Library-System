document.addEventListener('DOMContentLoaded', () => {
    const API_URL = '/api/dashboard';

    const colors = [
        '#2563eb',
        '#3b82f6',
        '#10b981',
        '#f59e0b',
        '#8b5cf6',
        '#ec4899',
        '#06b6d4'
    ];

    function getElement(id) {
        return document.getElementById(id);
    }

    function setText(id, value) {
        const element = getElement(id);

        if (element) {
            element.textContent = value ?? 0;
        }
    }

    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[character]);
    }

    function formatDate(dateValue) {
        if (!dateValue) return 'Unknown date';

        const date = new Date(dateValue);

        if (Number.isNaN(date.getTime())) {
            return String(dateValue);
        }

        return date.toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const themeToggleBtn = getElement('themeToggleBtn');

    function applyTheme() {
        const isDarkMode = localStorage.getItem('theme') === 'dark';

        document.body.classList.toggle('dark-mode', isDarkMode);

        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDarkMode ? 'On' : 'Off';
            themeToggleBtn.setAttribute(
                'aria-pressed',
                String(isDarkMode)
            );
        }
    }

    applyTheme();

    themeToggleBtn?.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');

        localStorage.setItem(
            'theme',
            isDarkMode ? 'light' : 'dark'
        );

        applyTheme();
    });

    getElement('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('admin');
        sessionStorage.clear();

        window.location.href = '../login/login.html';
    });

    function renderCategories(categories) {
        const chart = getElement('categoryChart');

        if (!chart) return;

        if (!Array.isArray(categories) || categories.length === 0) {
            chart.innerHTML = '<p>No category data available.</p>';
            return;
        }

        const maxValue = Math.max(
            ...categories.map(category =>
                Number(category.total_titles) || 0
            ),
            1
        );

        chart.innerHTML = categories.map((category, index) => {
            const total = Number(category.total_titles) || 0;

            const barHeight = total > 0
                ? Math.max((total / maxValue) * 110, 6)
                : 6;

            return `
                <div class="chart-column">
                    <span class="chart-count">${total}</span>

                    <div
                        class="chart-bar"
                        style="
                            height: ${barHeight}px;
                            background-color: ${colors[index % colors.length]};
                        "
                        title="${escapeHTML(category.category_name)}: ${total} titles"
                    ></div>

                    <span class="chart-label">
                        ${escapeHTML(category.category_name)}
                    </span>
                </div>
            `;
        }).join('');
    }

    function renderMovements(activities) {
        const container = getElement('recentMovements');

        if (!container) return;

        if (!Array.isArray(activities) || activities.length === 0) {
            container.innerHTML = '<p>No recent activity recorded.</p>';
            return;
        }

        container.innerHTML = activities.map(activity => {
            const action = String(activity.action || 'ACTIVITY');
            const description = activity.description || 'No description available.';
            const admin = activity.admin_name || activity.username || 'System';

            const badgeClass = action
                .toLowerCase()
                .replace(/[^a-z0-9]/g, '');

            const safeDescription = escapeHTML(description);

            return `
                <div class="movement-item">
                    <div class="movement-info">
                        <strong title="${safeDescription}">
                            ${safeDescription}
                        </strong>

                        <span>
                            ${escapeHTML(admin)}
                            •
                            ${escapeHTML(formatDate(activity.created_at))}
                        </span>
                    </div>

                    <span class="badge-tag ${escapeHTML(badgeClass)}">
                        ${escapeHTML(action)}
                    </span>
                </div>
            `;
        }).join('');
    }

    function renderStatistics(statistics) {
        const books = statistics.books || {};
        const borrowing = statistics.borrowing || {};
        const stock = statistics.stock || {};
        const conditions = statistics.conditions || {};

        setText('kpiTotal', books.total_copies);
        setText('kpiBorrowed', borrowing.active_borrowed);
        setText('kpiDueToday', borrowing.due_today);
        setText('kpiOverdue', borrowing.overdue);
        setText('kpiLowStock', stock.low_stock_books);
        setText('kpiDamaged', conditions.damaged_copies);
        setText('kpiLost', conditions.lost_copies);

        setText('kpiTitles', books.total_titles);
        setText('kpiAvailable', books.available_copies);
        setText('lowStockThreshold', stock.low_stock_threshold);
    }

    function renderLowStockBooks(books) {
        const container = getElement('lowStockBooks');

        if (!container) return;

        if (!Array.isArray(books) || books.length === 0) {
            container.innerHTML = '<p>No low-stock books found.</p>';
            return;
        }

        container.innerHTML = books.map(book => {
            const title = escapeHTML(book.title);

            return `
                <div class="movement-item">
                    <div class="movement-info">
                        <strong title="${title}">
                            ${title}
                        </strong>

                        <span>
                            ${Number(book.available_copies)} available
                            / ${Number(book.total_copies)} total
                        </span>
                    </div>

                    <span class="badge-tag">LOW STOCK</span>
                </div>
            `;
        }).join('');
    }

    async function loadDashboard() {
        try {
            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error(
                    `Server returned HTTP ${response.status}`
                );
            }

            const result = await response.json();

            if (!result.success || !result.data) {
                throw new Error(
                    result.message || 'Unable to retrieve dashboard data.'
                );
            }

            const data = result.data;

            renderStatistics(data.statistics || {});
            renderCategories(data.categories || []);
            renderMovements(data.activities || []);
            renderLowStockBooks(data.lowStockBooks || []);

        } catch (error) {
            console.error('Dashboard loading error:', error);

            const chart = getElement('categoryChart');
            const movements = getElement('recentMovements');
            const lowStock = getElement('lowStockBooks');

            if (chart) {
                chart.innerHTML =
                    '<p>Unable to load category information.</p>';
            }

            if (movements) {
                movements.innerHTML =
                    '<p>Unable to load recent activities.</p>';
            }

            if (lowStock) {
                lowStock.innerHTML =
                    '<p>Unable to load low-stock books.</p>';
            }
        }
    }

    loadDashboard();
});