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

    const logs = [
        { timestamp: '2026-10-28 14:32', action: 'CHECK OUT', item: 'Dell Latitude Laptops', user: 'Mr. Alan Turing', qty: 5, details: 'For CS101 Lab Session' },
        { timestamp: '2026-10-28 11:15', action: 'CHECK IN', item: 'Basketball Official Size 7', user: 'Coach Davies', qty: 4, details: 'Good Condition' },
        { timestamp: '2026-10-27 09:40', action: 'RESTOCK', item: 'Compound Microscope X400', user: 'Admin Sarah', qty: 6, details: 'New Shipment Received' }
    ];

    document.getElementById('logsTableBody').innerHTML = logs.map(log => `
        <tr>
            <td style="color: var(--text-muted);">${log.timestamp}</td>
            <td><span class="badge-tag ${log.action.toLowerCase().replace(' ', '')}">${log.action}</span></td>
            <td><strong>${log.item}</strong></td>
            <td>${log.user}</td>
            <td><strong>${log.qty}</strong></td>
            <td style="color: var(--text-muted);">${log.details}</td>
        </tr>
    `).join('');
});