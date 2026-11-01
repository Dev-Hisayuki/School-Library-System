document.addEventListener('DOMContentLoaded', () => {
    const isDarkMode = localStorage.getItem('theme') === 'dark';
    if (isDarkMode) document.body.classList.add('dark-mode');

    document.getElementById('themeToggleBtn').addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
    });

    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '../login/login.html';
    });

    const categories = ['Science & Lab', 'IT & Electronics', 'Sports & Athletics', 'Classroom Supplies', 'Audio/Visual'];
    const colors = ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const heights = [75, 60, 35, 12, 12];

    document.getElementById('categoryChart').innerHTML = categories.map((cat, idx) => `
        <div class="chart-column">
            <div class="chart-bar" style="height: ${heights[idx]}%; background-color: ${colors[idx]};"></div>
            <span class="chart-label">${cat}</span>
        </div>
    `).join('');

    const logs = [
        { action: 'CHECK OUT', item: 'Dell Latitude Laptops', user: 'Mr. Alan Turing', qty: 5, time: '2026-10-28 14:32' },
        { action: 'CHECK IN', item: 'Basketball Official Size 7', user: 'Coach Davies', qty: 4, time: '2026-10-28 11:15' },
        { action: 'RESTOCK', item: 'Compound Microscope X400', user: 'Admin Sarah', qty: 6, time: '2026-10-27 09:40' }
    ];

    document.getElementById('recentMovements').innerHTML = logs.map(log => `
        <div class="movement-item">
            <div class="movement-info">
                <strong>${log.item}</strong>
                <span style="font-size: 0.75rem; color: var(--text-muted);">${log.user} • ${log.time}</span>
            </div>
            <span class="badge-tag ${log.action.toLowerCase().replace(' ', '')}">${log.action} (${log.qty})</span>
        </div>
    `).join('');
});