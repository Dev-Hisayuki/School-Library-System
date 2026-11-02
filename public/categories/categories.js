
document.addEventListener('DOMContentLoaded', () => {
    const API = '/api/categories';

    const $ = id => document.getElementById(id);

    const elements = {
        tableBody: $('categoriesTableBody'),
        search: $('categorySearch'),
        count: $('categoryCount'),

        total: $('totalCategories'),
        categorizedBooks: $('categorizedBooks'),
        emptyCategories: $('emptyCategories'),

        modal: $('categoryModal'),
        form: $('categoryForm'),
        modalTitle: $('categoryModalTitle'),
        id: $('categoryId'),
        name: $('categoryName'),
        description: $('categoryDescription'),

        addButton: $('addCategoryBtn'),
        saveButton: $('saveCategoryBtn'),
        cancelButton: $('cancelCategoryBtn'),
        closeButton: $('closeCategoryModalBtn'),

        message: $('categoryMessage'),
        pageMessage: $('pageMessage'),

        themeButton: $('themeToggleBtn'),
        logoutButton: $('logoutBtn')
    };

    let categories = [];
    let editingCategoryId = null;

    // =========================================
    // API REQUEST
    // =========================================

    async function request(url, options = {}) {
        const token = localStorage.getItem('authToken');

        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
                ...(options.headers || {})
            }
        });

        let result;

        try {
            result = await response.json();
        } catch {
            throw new Error('The server returned an invalid response.');
        }

        if (!response.ok || result.success === false) {
            throw new Error(result.message || 'Something went wrong.');
        }

        return result;
    }

    // =========================================
    // CATEGORY DATA HELPERS
    // =========================================

    function getCategoryId(category) {
        return category.category_id ?? category.id ?? '';
    }

    function getCategoryName(category) {
        return category.category_name || category.name || '';
    }

    function getCategoryDescription(category) {
        return category.description || category.category_description || '';
    }

    function getBookCount(category) {
        return Number(
            category.total_books ??
            category.book_count ??
            category.books_count ??
            0
        );
    }

    // =========================================
    // LOAD CATEGORIES
    // =========================================

    async function loadCategories() {
        showTableMessage('Loading categories...');

        try {
            const result = await request(API);

            categories = Array.isArray(result.data)
                ? result.data
                : [];

            renderCategories();
            updateStatistics();

            return true;

        } catch (error) {
            console.error('Load categories error:', error);
            showTableMessage(error.message);
            showMessage(error.message, 'error');

            return false;
        }
    }

    // =========================================
    // RENDER TABLE
    // =========================================

    function renderCategories() {
        if (!elements.tableBody) return;

        const searchTerm = elements.search
            ? elements.search.value.trim().toLowerCase()
            : '';

        const filtered = categories.filter(category => {
            const name = String(getCategoryName(category)).toLowerCase();
            const description = String(getCategoryDescription(category)).toLowerCase();

            return (
                name.includes(searchTerm) ||
                description.includes(searchTerm)
            );
        });

        if (filtered.length === 0) {
            showTableMessage(
                searchTerm
                    ? 'No categories match your search.'
                    : 'No categories have been added yet.'
            );

            updateCount(0);
            return;
        }

        elements.tableBody.innerHTML = filtered.map(category => `
            <tr>
                <td>
                    <div class="category-name">
                        ${escapeHTML(getCategoryName(category))}
                    </div>
                </td>

                <td>
                    ${escapeHTML(getCategoryDescription(category) || '—')}
                </td>

                <td>${getBookCount(category)}</td>

                <td>
                    <div class="action-buttons">
                        <button
                            type="button"
                            class="action-btn"
                            title="Edit Category"
                            data-action="edit"
                            data-id="${escapeHTML(getCategoryId(category))}">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn delete"
                            title="Delete Category"
                            data-action="delete"
                            data-id="${escapeHTML(getCategoryId(category))}">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        updateCount(filtered.length);
    }

    function showTableMessage(message) {
        if (!elements.tableBody) return;

        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="4" class="table-message">
                    ${escapeHTML(message)}
                </td>
            </tr>
        `;
    }

    function updateCount(count) {
        if (!elements.count) return;

        elements.count.textContent =
            `${count} ${count === 1 ? 'category' : 'categories'} found`;
    }

    // =========================================
    // STATISTICS
    // =========================================

    function updateStatistics() {
        const total = categories.length;

        const categorizedBooks = categories.reduce(
            (sum, category) => sum + getBookCount(category),
            0
        );

        const emptyCategories = categories.filter(
            category => getBookCount(category) === 0
        ).length;

        if (elements.total) {
            elements.total.textContent = total;
        }

        if (elements.categorizedBooks) {
            elements.categorizedBooks.textContent = categorizedBooks;
        }

        if (elements.emptyCategories) {
            elements.emptyCategories.textContent = emptyCategories;
        }
    }

    // =========================================
    // OPEN / CLOSE MODAL
    // =========================================

    function openModal(category = null) {
        if (!elements.modal || !elements.form) return;

        elements.form.reset();

        editingCategoryId = category
            ? getCategoryId(category)
            : null;

        elements.id.value = category
            ? getCategoryId(category)
            : '';

        elements.name.value = category
            ? getCategoryName(category)
            : '';

        elements.description.value = category
            ? getCategoryDescription(category)
            : '';

        elements.modalTitle.textContent = category
            ? 'Edit Category'
            : 'Add New Category';

        elements.saveButton.disabled = false;

        elements.saveButton.innerHTML = category
            ? '<i class="fa-solid fa-floppy-disk"></i> Save Changes'
            : '<i class="fa-solid fa-floppy-disk"></i> Save Category';

        hideMessage();

        elements.modal.classList.add('show');
        document.body.classList.add('modal-open');

        elements.name.focus();
    }

    function closeModal() {
        if (!elements.modal) return;

        elements.modal.classList.remove('show');
        document.body.classList.remove('modal-open');

        editingCategoryId = null;
        elements.form?.reset();
        hideMessage();
    }

    // =========================================
    // SAVE CATEGORY
    // =========================================

    async function saveCategory(event) {
        event.preventDefault();

        const name = elements.name.value.trim();
        const description = elements.description.value.trim();

        if (!name) {
            showMessage('Please enter a category name.', 'error');
            elements.name.focus();
            return;
        }

        const payload = {
            category_name: name,
            description: description || null
        };

        try {
            elements.saveButton.disabled = true;
            elements.saveButton.textContent = 'Saving...';

            if (editingCategoryId) {
                await request(`${API}/${encodeURIComponent(editingCategoryId)}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });

                closeModal();

                const loaded = await loadCategories();

                showMessage(
                    loaded
                        ? 'Category updated successfully.'
                        : 'Category updated, but the list could not be refreshed.',
                    loaded ? 'success' : 'error'
                );

            } else {
                await request(API, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                closeModal();

                const loaded = await loadCategories();

                showMessage(
                    loaded
                        ? 'Category added successfully.'
                        : 'Category added, but the list could not be refreshed.',
                    loaded ? 'success' : 'error'
                );
            }

        } catch (error) {
            console.error('Save category error:', error);
            showMessage(error.message, 'error');

        } finally {
            elements.saveButton.disabled = false;
            elements.saveButton.innerHTML =
                '<i class="fa-solid fa-floppy-disk"></i> Save Category';
        }
    }

    // =========================================
    // EDIT CATEGORY
    // =========================================

    function editCategory(categoryId) {
        const category = categories.find(
            item => String(getCategoryId(item)) === String(categoryId)
        );

        if (!category) {
            showMessage('Category not found.', 'error');
            return;
        }

        openModal(category);
    }

    // =========================================
    // DELETE CATEGORY
    // =========================================

    async function deleteCategory(categoryId) {
        const category = categories.find(
            item => String(getCategoryId(item)) === String(categoryId)
        );

        if (!category) {
            showMessage('Category not found.', 'error');
            return;
        }

        const confirmed = await showConfirmDialog(
            'Delete Category?',
            `Are you sure you want to delete "${getCategoryName(category)}"? This action cannot be undone.`,
            'Delete Category'
        );

        if (!confirmed) return;

        try {
            await request(`${API}/${encodeURIComponent(categoryId)}`, {
                method: 'DELETE'
            });

            const loaded = await loadCategories();

            showMessage(
                loaded
                    ? 'Category deleted successfully.'
                    : 'Category deleted, but the list could not be refreshed.',
                loaded ? 'success' : 'error'
            );

        } catch (error) {
            console.error('Delete category error:', error);
            showMessage(error.message, 'error');
        }
    }

    // =========================================
    // CONFIRM DIALOG
    // =========================================

    function showConfirmDialog(title, message, confirmText = 'Confirm') {
        return new Promise(resolve => {
            const overlay = document.createElement('div');

            overlay.className = 'modal-overlay show';

            overlay.innerHTML = `
                <div class="modal-card" role="dialog" aria-modal="true">
                    <div class="modal-header">
                        <div>
                            <h2>${escapeHTML(title)}</h2>
                            <p>${escapeHTML(message)}</p>
                        </div>

                        <button
                            type="button"
                            class="close-btn"
                            data-choice="cancel"
                            aria-label="Close dialog">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div class="form-actions">
                        <button
                            type="button"
                            class="btn-secondary"
                            data-choice="cancel">
                            Cancel
                        </button>

                        <button
                            type="button"
                            class="btn-primary"
                            data-choice="confirm">
                            ${escapeHTML(confirmText)}
                        </button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);

            function finish(value) {
                overlay.remove();
                resolve(value);
            }

            overlay.addEventListener('click', event => {
                if (event.target === overlay) {
                    finish(false);
                    return;
                }

                const button = event.target.closest('[data-choice]');

                if (button) {
                    finish(button.dataset.choice === 'confirm');
                }
            });
        });
    }

    // =========================================
    // NOTIFICATIONS
    // =========================================

    function showMessage(message, type = 'success') {
        const target = elements.modal?.classList.contains('show')
            ? elements.message
            : elements.pageMessage || elements.message;

        if (!target) return;

        clearTimeout(showMessage.timeout);

        target.textContent = message;
        target.className = `message-box ${type}`;
        target.style.display = 'block';

        showMessage.timeout = setTimeout(() => {
            target.textContent = '';
            target.className = 'message-box';
            target.style.display = 'none';
        }, 4000);
    }

    function hideMessage() {
        [elements.message, elements.pageMessage].forEach(target => {
            if (!target) return;

            target.textContent = '';
            target.className = 'message-box';
            target.style.display = 'none';
        });

        clearTimeout(showMessage.timeout);
    }

    // =========================================
    // DARK MODE
    // =========================================

    function updateThemeButton(isDark) {
        if (!elements.themeButton) return;

        elements.themeButton.textContent = isDark ? 'On' : 'Off';

        elements.themeButton.setAttribute(
            'aria-pressed',
            isDark ? 'true' : 'false'
        );
    }

    function applyTheme() {
        const isDark = localStorage.getItem('theme') === 'dark';

        document.body.classList.toggle('dark-mode', isDark);
        updateThemeButton(isDark);
    }

    function toggleTheme() {
        const isDark = !document.body.classList.contains('dark-mode');

        document.body.classList.toggle('dark-mode', isDark);

        localStorage.setItem(
            'theme',
            isDark ? 'dark' : 'light'
        );

        updateThemeButton(isDark);
    }

    // =========================================
    // LOGOUT
    // =========================================

    async function logout() {
        const confirmed = await showConfirmDialog(
            'Log Out?',
            'Are you sure you want to log out?',
            'Logout'
        );

        if (!confirmed) return;

        localStorage.removeItem('authToken');
        localStorage.removeItem('admin');
        sessionStorage.clear();

        window.location.href = '../login/login.html';
    }

    // =========================================
    // HTML ESCAPING
    // =========================================

    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => {
            const replacements = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };

            return replacements[character];
        });
    }

    // =========================================
    // EVENT LISTENERS
    // =========================================

    elements.addButton?.addEventListener('click', () => openModal());

    elements.form?.addEventListener('submit', saveCategory);

    elements.cancelButton?.addEventListener('click', closeModal);
    elements.closeButton?.addEventListener('click', closeModal);

    elements.modal?.addEventListener('click', event => {
        if (event.target === elements.modal) {
            closeModal();
        }
    });

    elements.search?.addEventListener('input', renderCategories);

    elements.tableBody?.addEventListener('click', event => {
        const button = event.target.closest('[data-action]');

        if (!button) return;

        const categoryId = button.dataset.id;

        if (button.dataset.action === 'edit') {
            editCategory(categoryId);
        }

        if (button.dataset.action === 'delete') {
            deleteCategory(categoryId);
        }
    });

    elements.themeButton?.addEventListener('click', toggleTheme);
    elements.logoutButton?.addEventListener('click', logout);

    // =========================================
    // INITIALIZE
    // =========================================

    applyTheme();
    loadCategories();
});
