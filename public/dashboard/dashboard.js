document.addEventListener('DOMContentLoaded', () => {
    // Theme & Logout Controls
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

    // Dashboard Data State
    let totalStockCount = 94;
    const logs = [
        { action: 'CHECK OUT', item: 'Dell Latitude Laptops', user: 'Mr. Alan Turing', qty: 5, time: '2026-10-28 14:32' },
        { action: 'CHECK IN', item: 'Basketball Official Size 7', user: 'Coach Davies', qty: 4, time: '2026-10-28 11:15' },
        { action: 'RESTOCK', item: 'Compound Microscope X400', user: 'Admin Sarah', qty: 6, time: '2026-10-27 09:40' }
    ];

    function renderMovements() {
        document.getElementById('recentMovements').innerHTML = logs.slice(0, 3).map(log => `
            <div class="movement-item">
                <div class="movement-info">
                    <strong>${log.item}</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${log.user} • ${log.time}</span>
                </div>
                <span class="badge-tag ${log.action.toLowerCase().replace(/\s+/g, '')}">${log.action} (${log.qty})</span>
            </div>
        `).join('');
    }

    // Category Distribution Chart
    const categories = ['Science & Lab', 'IT & Electronics', 'Sports & Athletics', 'Classroom Supplies', 'Audio/Visual'];
    const colors = ['#2563eb', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];
    const heights = [75, 60, 35, 12, 12];

    function renderChart() {
        document.getElementById('categoryChart').innerHTML = categories.map((cat, idx) => `
            <div class="chart-column">
                <div class="chart-bar" style="height: ${heights[idx]}%; background-color: ${colors[idx]};"></div>
                <span class="chart-label">${cat}</span>
            </div>
        `).join('');
    }

    renderChart();
    renderMovements();

    // Modal Control Logic
    const addItemModal = document.getElementById('addItemModal');
    const openAddItemBtn = document.getElementById('openAddItemBtn');
    const openAddItemBannerBtn = document.getElementById('openAddItemBannerBtn');
    const closeAddItemBtn = document.getElementById('closeAddItemBtn');
    const cancelAddItemBtn = document.getElementById('cancelAddItemBtn');
    const addItemForm = document.getElementById('addItemForm');

    function openModal() { addItemModal.classList.add('active'); }
    function closeModal() { addItemModal.classList.remove('active'); addItemForm.reset(); }

    openAddItemBtn.addEventListener('click', openModal);
    openAddItemBannerBtn.addEventListener('click', openModal);
    closeAddItemBtn.addEventListener('click', closeModal);
    cancelAddItemBtn.addEventListener('click', closeModal);

    // Form Submission using itemname, itemcategory, and itemquantity
    addItemForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('itemname').value.trim();
        const category = document.getElementById('itemcategory').value;
        const qty = parseInt(document.getElementById('itemquantity').value, 10);

        if (!name || !qty) return;

        // Update Total Items counter dynamically
        totalStockCount += qty;
        document.getElementById('kpiTotal').textContent = totalStockCount;

        // Add to recent activity stream
        const now = new Date();
        const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

        logs.unshift({
            action: 'ADD ITEM',
            item: name,
            user: 'Allen Jay Alcorcon',
            qty: qty,
            time: formattedDate
        });

        renderMovements();
        closeModal();
        alert(`Successfully added "${name}" (${qty} units under ${category})!`);
    });
});