document.addEventListener('DOMContentLoaded', () => {
    const logsTableBody = document.getElementById('logsTableBody');
    const searchInput = document.getElementById('logsSearchInput');
    const refreshButton = document.getElementById('refreshLogsBtn');
    const exportButton = document.getElementById('exportLogsBtn');

    const totalLogsElement = document.getElementById('totalLogs');
    const loginLogsElement = document.getElementById('loginLogs');
    const adminCountElement = document.getElementById('adminCount');
    const logsCountElement = document.getElementById('logsCount');

    let activityLogs = [];
    let filteredLogs = [];

    const themeToggleBtn = document.getElementById('themeToggleBtn');

    function applyTheme() {
        const isDarkMode = localStorage.getItem('theme') === 'dark';
        document.body.classList.toggle('dark-mode', isDarkMode);

        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDarkMode ? 'On' : 'Off';
        }
    }

    applyTheme();

    themeToggleBtn?.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
        applyTheme();
    });

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '../login/login.html';
    });

    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => {
            const entities = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };
            return entities[character];
        });
    }

    function formatDate(dateValue) {
        if (!dateValue) return '—';
        const date = new Date(dateValue);
        if (Number.isNaN(date.getTime())) {
            return '—';
        }
        return date.toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Manila'
        });
    }

    function getActionClass(action) {
        const normalized = String(action || '').toLowerCase();
        if (normalized.includes('login')) return 'login';
        if (normalized.includes('logout')) return 'logout';
        if (normalized.includes('checkout')) return 'checkout';
        if (normalized.includes('checkin')) return 'checkin';
        if (normalized.includes('restock')) return 'restock';
        return 'default';
    }

    function updateSummary() {
        const loginCount = activityLogs.filter(log =>
            String(log.action || '').toUpperCase() === 'LOGIN'
        ).length;

        const administrators = new Set(
            activityLogs
                .map(log => log.admin_id)
                .filter(id => id !== null && id !== undefined)
                .map(String)
        );

        if (totalLogsElement) {
            totalLogsElement.textContent = activityLogs.length;
        }

        if (loginLogsElement) {
            loginLogsElement.textContent = loginCount;
        }

        if (adminCountElement) {
            adminCountElement.textContent = administrators.size;
        }
    }

    function renderLogs(logs) {
        filteredLogs = logs;

        if (logs.length === 0) {
            logsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-message">
                        <i class="fa-solid fa-inbox"></i>
                        No activity logs found.
                    </td>
                </tr>
            `;
            logsCountElement.textContent = 'Showing 0 activities';
            return;
        }

        logsTableBody.innerHTML = logs.map(log => {
            const action = escapeHTML(log.action || 'UNKNOWN');
            const actionClass = getActionClass(log.action);
            const adminName = escapeHTML(log.admin_name || 'Unknown Administrator');
            const username = escapeHTML(log.username || 'No username');
            const description = escapeHTML(log.description || 'No description provided.');

            return `
                <tr>
                    <td>${escapeHTML(formatDate(log.created_at))}</td>
                    <td>
                        <div class="admin-cell">
                            <div class="admin-avatar">
                                ${escapeHTML((log.admin_name || 'A').charAt(0).toUpperCase())}
                            </div>
                            <div class="admin-details">
                                <strong>${adminName}</strong>
                                <span>@${username}</span>
                            </div>
                        </div>
                    </td>
                    <td>
                        <span class="badge-tag ${actionClass}">
                            ${action}
                        </span>
                    </td>
                    <td class="description-cell">
                        ${description}
                    </td>
                </tr>
            `;
        }).join('');

        logsCountElement.textContent = `Showing ${logs.length} of ${activityLogs.length} activities`;
    }

    function searchLogs() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        const results = activityLogs.filter(log => {
            const searchableText = [
                log.action,
                log.description,
                log.admin_name,
                log.username
            ].join(' ').toLowerCase();

            return searchableText.includes(searchTerm);
        });

        renderLogs(results);
    }

    searchInput?.addEventListener('input', searchLogs);

    async function loadLogs() {
        logsTableBody.innerHTML = `
            <tr>
                <td colspan="4" class="empty-message">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Loading activity logs...
                </td>
            </tr>
        `;

        try {
            const response = await fetch('/api/logs/activity');
            const result = await response.json();

            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to load activity logs.');
            }

            activityLogs = Array.isArray(result.data) ? result.data : [];
            activityLogs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            updateSummary();
            searchLogs();

        } catch (error) {
            console.error('Activity logs error:', error);
            activityLogs = [];
            filteredLogs = [];
            updateSummary();

            logsTableBody.innerHTML = `
                <tr>
                    <td colspan="4" class="empty-message">
                        <i class="fa-solid fa-circle-exclamation"></i>
                        Unable to load activity logs.
                        <br>
                        ${escapeHTML(error.message)}
                    </td>
                </tr>
            `;

            logsCountElement.textContent = 'Failed to load activities';
        }
    }

    refreshButton?.addEventListener('click', async () => {
        refreshButton.disabled = true;
        refreshButton.innerHTML = `
            <i class="fa-solid fa-spinner fa-spin"></i>
            Refreshing...
        `;

        await loadLogs();

        refreshButton.disabled = false;
        refreshButton.innerHTML = `
            <i class="fa-solid fa-rotate"></i>
            Refresh
        `;
    });

    function exportCSV() {
        if (filteredLogs.length === 0) {
            alert('There are no activity logs to export.');
            return;
        }

        const headers = ['Timestamp', 'Administrator', 'Username', 'Action', 'Description'];
        const rows = filteredLogs.map(log => [
            formatDate(log.created_at),
            log.admin_name || 'Unknown Administrator',
            log.username || '',
            log.action || '',
            log.description || ''
        ]);

        function escapeCSV(value) {
            return `"${String(value ?? '').replace(/"/g, '""')}"`;
        }

        const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\r\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = url;
        link.download = `school-library-activity-logs-${new Date().toISOString().slice(0, 10)}.csv`;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
    }

    exportButton?.addEventListener('click', exportCSV);

    loadLogs();
});