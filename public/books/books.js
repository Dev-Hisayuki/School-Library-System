document.addEventListener('DOMContentLoaded', () => {
    const API = {
        books: '/api/books',
        categories: '/api/categories',
        publishers: '/api/publishers'
    };

    const $ = id => document.getElementById(id);

    const elements = {
        tableBody: $('booksTableBody'),
        search: $('bookSearch'),
        bookCount: $('bookCount'),

        totalTitles: $('totalTitles'),
        totalCopies: $('totalCopies'),
        availableCopies: $('availableCopies'),
        borrowedCopies: $('borrowedCopies'),

        modal: $('bookModal'),
        form: $('bookForm'),
        modalTitle: $('bookModalTitle'),
        bookId: $('bookId'),
        title: $('bookTitle'),
        isbn: $('bookIsbn'),
        category: $('bookCategory'),
        publisher: $('bookPublisher'),
        publicationYear: $('publicationYear'),
        totalCopiesInput: $('totalCopiesInput'),
        saveButton: $('saveBookBtn'),
        cancelButton: $('cancelBookBtn'),
        closeButton: $('closeBookModalBtn'),

        addButton: $('addBookBtn'),
        message: $('bookMessage'),

        categoryModal: $('categoryModal'),
        manageCategoriesButton: $('manageCategoriesBtn'),
        closeCategoryModalButton: $('closeCategoryModalBtn'),
        categoryForm: $('categoryForm'),
        categoryId: $('categoryId'),
        categoryName: $('categoryName'),
        categoryDescription: $('categoryDescription'),
        saveCategoryButton: $('saveCategoryBtn'),
        cancelCategoryEditButton: $('cancelCategoryEditBtn'),
        categoryTableBody: $('categoryTableBody'),
        categoryCount: $('categoryCount'),
        categoryMessage: $('categoryMessage'),

        themeButton: $('themeToggleBtn'),
        logoutButton: $('logoutBtn')
    };

    let books = [];
    let categories = [];
    let publishers = [];
    let editingBookId = null;

    // =========================================
    // CATEGORY MANAGER STYLES
    // =========================================

    const categoryStyles = document.createElement('style');

    categoryStyles.textContent = `
        .category-select-row {
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .category-select-row select {
            flex: 1;
            min-width: 0;
        }

        .category-manage-button {
            white-space: nowrap;
            min-height: 42px;
        }

        .category-modal-card {
            width: min(680px, calc(100% - 30px));
            max-height: 90vh;
            overflow-y: auto;
        }

        .category-form {
            padding: 18px;
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 12px;
            margin-bottom: 22px;
        }

        .category-form textarea {
            width: 100%;
            padding: 12px;
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 8px;
            background: var(--bg-card, #fff);
            color: var(--text-primary, #1e293b);
            font: inherit;
            resize: vertical;
        }

        .category-list-heading {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 12px;
            margin: 18px 0 12px;
        }

        .category-list-heading h3 {
            font-size: 16px;
        }

        .category-list-heading span {
            color: var(--text-muted, #64748b);
            font-size: 13px;
        }

        .category-table-wrapper {
            width: 100%;
            overflow-x: auto;
        }

        .category-table {
            width: 100%;
            border-collapse: collapse;
        }

        .category-table th,
        .category-table td {
            padding: 12px;
            border-bottom: 1px solid var(--border-color, #e2e8f0);
            text-align: left;
            font-size: 13px;
        }

        .category-table th {
            color: var(--text-muted, #64748b);
            font-weight: 600;
        }

        .category-table td:last-child {
            white-space: nowrap;
        }

        .category-action-btn {
            width: 32px;
            height: 32px;
            border: 1px solid var(--border-color, #e2e8f0);
            border-radius: 7px;
            background: var(--bg-card, #fff);
            color: var(--text-primary, #1e293b);
            cursor: pointer;
            margin-right: 4px;
        }

        .category-action-btn:hover {
            background: var(--bg-main, #f5f7fb);
        }

        .category-action-btn.delete {
            color: #dc2626;
        }

        .category-empty {
            text-align: center !important;
            padding: 22px !important;
            color: var(--text-muted, #64748b);
        }

        body.dark-mode .category-form textarea {
            background: var(--bg-card);
            color: var(--text-primary);
        }

        @media (max-width: 520px) {
            .category-select-row {
                align-items: stretch;
                flex-direction: column;
            }

            .category-manage-button {
                width: 100%;
            }

            .category-modal-card {
                padding: 16px;
            }
        }
    `;

    document.head.appendChild(categoryStyles);

    // =========================================
    // API REQUEST
    // =========================================

    async function request(url, options = {}) {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
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
    // LOAD PAGE DATA
    // =========================================

    async function loadPageData() {
        try {
            showTableMessage('Loading books...');

            const [bookResult, categoryResult, publisherResult] =
                await Promise.all([
                    request(API.books),
                    request(API.categories),
                    request(API.publishers)
                ]);

            books = Array.isArray(bookResult.data)
                ? bookResult.data
                : [];

            categories = Array.isArray(categoryResult.data)
                ? categoryResult.data
                : [];

            publishers = Array.isArray(publisherResult.data)
                ? publisherResult.data
                : [];

            populateCategoryDropdown();
            populatePublisherDropdown();
            renderBooks();
            updateStatistics();

        } catch (error) {
            console.error('Books page loading error:', error);
            showTableMessage(error.message);
            showMessage(error.message, 'error');
        }
    }

    async function loadCategories() {
        const result = await request(API.categories);

        categories = Array.isArray(result.data)
            ? result.data
            : [];

        populateCategoryDropdown();
        renderCategories();
    }

    // =========================================
    // DROPDOWNS
    // =========================================

    function populateCategoryDropdown(selectedId = null) {
        if (!elements.category) return;

        const previousValue = selectedId !== null
            ? String(selectedId)
            : elements.category.value;

        elements.category.innerHTML =
            '<option value="">No Category</option>';

        categories.forEach(category => {
            const option = document.createElement('option');

            option.value = category.category_id;
            option.textContent = category.category_name;

            elements.category.appendChild(option);
        });

        elements.category.value = previousValue;
    }

    function populatePublisherDropdown() {
        if (!elements.publisher) return;

        elements.publisher.innerHTML =
            '<option value="">No Publisher</option>';

        publishers.forEach(publisher => {
            const option = document.createElement('option');

            option.value = publisher.publisher_id;
            option.textContent = publisher.publisher_name;

            elements.publisher.appendChild(option);
        });
    }

    // =========================================
    // BOOK TABLE
    // =========================================

    function renderBooks() {
        if (!elements.tableBody) return;

        const searchTerm = elements.search
            ? elements.search.value.trim().toLowerCase()
            : '';

        const filteredBooks = books.filter(book => {
            const title = String(book.title || '').toLowerCase();
            const isbn = String(book.isbn || '').toLowerCase();
            const category = String(book.category_name || '').toLowerCase();
            const publisher = String(book.publisher_name || '').toLowerCase();

            return (
                title.includes(searchTerm) ||
                isbn.includes(searchTerm) ||
                category.includes(searchTerm) ||
                publisher.includes(searchTerm)
            );
        });

        if (filteredBooks.length === 0) {
            showTableMessage(
                searchTerm
                    ? 'No books match your search.'
                    : 'No books have been added yet.'
            );

            updateBookCount(0);
            return;
        }

        elements.tableBody.innerHTML = filteredBooks.map(book => {
            const total = Number(book.total_copies) || 0;
            const available = Number(book.available_copies) || 0;
            const borrowed = Math.max(total - available, 0);

            let statusClass = 'status-available';
            let statusText = 'Available';

            if (available <= 0) {
                statusClass = 'status-unavailable';
                statusText = 'Unavailable';
            } else if (available <= 2) {
                statusClass = 'status-low-stock';
                statusText = 'Low Stock';
            }

            return `
                <tr>
                    <td>
                        <div class="book-title">${escapeHTML(book.title)}</div>
                        <span class="book-year">
                            ${escapeHTML(book.publication_year || 'Year not specified')}
                        </span>
                    </td>

                    <td>${escapeHTML(book.isbn || '—')}</td>
                    <td>${escapeHTML(book.category_name || 'Uncategorized')}</td>
                    <td>${escapeHTML(book.publisher_name || 'No Publisher')}</td>
                    <td><span class="copy-count">${total}</span></td>
                    <td><span class="copy-count">${available}</span></td>
                    <td><span class="copy-count">${borrowed}</span></td>

                    <td>
                        <span class="status-badge ${statusClass}">
                            ${statusText}
                        </span>
                    </td>

                    <td>
                        <div class="action-buttons">
                            <button
                                type="button"
                                class="action-btn"
                                title="Edit Book"
                                data-action="edit"
                                data-id="${book.book_id}">
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                type="button"
                                class="action-btn delete"
                                title="Delete Book"
                                data-action="delete"
                                data-id="${book.book_id}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');

        updateBookCount(filteredBooks.length);
    }

    function showTableMessage(message) {
        if (!elements.tableBody) return;

        elements.tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="table-message">
                    ${escapeHTML(message)}
                </td>
            </tr>
        `;
    }

    function updateBookCount(count) {
        if (elements.bookCount) {
            elements.bookCount.textContent =
                `${count} ${count === 1 ? 'book' : 'books'} found`;
        }
    }

    // =========================================
    // BOOK STATISTICS
    // =========================================

    function updateStatistics() {
        const totalTitles = books.length;

        const totalCopies = books.reduce(
            (sum, book) => sum + (Number(book.total_copies) || 0),
            0
        );

        const availableCopies = books.reduce(
            (sum, book) => sum + (Number(book.available_copies) || 0),
            0
        );

        const borrowedCopies = Math.max(
            totalCopies - availableCopies,
            0
        );

        if (elements.totalTitles) {
            elements.totalTitles.textContent = totalTitles;
        }

        if (elements.totalCopies) {
            elements.totalCopies.textContent = totalCopies;
        }

        if (elements.availableCopies) {
            elements.availableCopies.textContent = availableCopies;
        }

        if (elements.borrowedCopies) {
            elements.borrowedCopies.textContent = borrowedCopies;
        }
    }

    // =========================================
    // BOOK MODAL
    // =========================================

    function openModal(book = null) {
        if (!elements.modal || !elements.form) return;

        elements.form.reset();
        editingBookId = book ? Number(book.book_id) : null;

        if (elements.bookId) {
            elements.bookId.value = book ? book.book_id : '';
        }

        if (elements.modalTitle) {
            elements.modalTitle.textContent = book
                ? 'Edit Book'
                : 'Add New Book';
        }

        if (elements.title) {
            elements.title.value = book ? book.title : '';
        }

        if (elements.isbn) {
            elements.isbn.value = book ? book.isbn : '';
        }

        populateCategoryDropdown(book?.category_id || '');
        populatePublisherDropdown();

        if (elements.category) {
            elements.category.value = book?.category_id || '';
        }

        if (elements.publisher) {
            elements.publisher.value = book?.publisher_id || '';
        }

        if (elements.publicationYear) {
            elements.publicationYear.value =
                book?.publication_year || '';
        }

        if (elements.totalCopiesInput) {
            elements.totalCopiesInput.value =
                book ? Number(book.total_copies) : 1;
        }

        elements.form.dataset.availableCopies =
            book ? Number(book.available_copies) : '';

        if (elements.saveButton) {
            elements.saveButton.disabled = false;
            elements.saveButton.innerHTML = book
                ? '<i class="fa-solid fa-floppy-disk"></i> Save Changes'
                : '<i class="fa-solid fa-floppy-disk"></i> Save Book';
        }

        hideMessage();

        elements.modal.classList.add('show');
        document.body.classList.add('modal-open');

        if (elements.title) {
            elements.title.focus();
        }
    }

    function closeModal() {
        if (!elements.modal) return;

        elements.modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        editingBookId = null;
    }

    // =========================================
    // SAVE BOOK
    // =========================================

    async function saveBook(event) {
        event.preventDefault();

        const title = elements.title.value.trim();
        const isbn = elements.isbn.value.trim();
        const totalCopies = Number(elements.totalCopiesInput.value);
        const publicationYear = elements.publicationYear.value.trim();

        if (!title || !isbn) {
            showMessage('Please enter the book title and ISBN.', 'error');
            return;
        }

        if (!Number.isInteger(totalCopies) || totalCopies < 0) {
            showMessage(
                'Total copies must be a valid non-negative whole number.',
                'error'
            );
            return;
        }

        const currentBook = editingBookId
            ? books.find(book => Number(book.book_id) === editingBookId)
            : null;

        const availableCopies = currentBook
            ? Number(currentBook.available_copies)
            : totalCopies;

        if (currentBook && totalCopies < availableCopies) {
            showMessage(
                `Total copies cannot be less than the ${availableCopies} copies currently available.`,
                'error'
            );
            return;
        }

        const payload = {
            title,
            isbn,
            category_id: elements.category.value || null,
            publisher_id: elements.publisher.value || null,
            publication_year: publicationYear || null,
            total_copies: totalCopies,
            available_copies: availableCopies
        };

        try {
            elements.saveButton.disabled = true;
            elements.saveButton.textContent = 'Saving...';

            if (editingBookId) {
                await request(`${API.books}/${editingBookId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });

                closeModal();
                await loadBooksOnly();
                showMessage('Book updated successfully.', 'success');

            } else {
                await request(API.books, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                closeModal();
                await loadBooksOnly();
                showMessage('Book added successfully.', 'success');
            }

        } catch (error) {
            console.error('Save book error:', error);
            showMessage(error.message, 'error');

        } finally {
            elements.saveButton.disabled = false;
            elements.saveButton.innerHTML =
                '<i class="fa-solid fa-floppy-disk"></i> Save Book';
        }
    }

    async function loadBooksOnly() {
        try {
            const result = await request(API.books);

            books = Array.isArray(result.data) ? result.data : [];

            renderBooks();
            updateStatistics();

        } catch (error) {
            console.error('Refresh books error:', error);
            showMessage(error.message, 'error');
        }
    }

    // =========================================
    // EDIT BOOK
    // =========================================

    function editBook(bookId) {
        const book = books.find(
            item => Number(item.book_id) === Number(bookId)
        );

        if (!book) {
            showMessage('Book not found.', 'error');
            return;
        }

        openModal(book);
    }

    // =========================================
    // DELETE BOOK
    // =========================================

    async function deleteBook(bookId) {
        const book = books.find(
            item => Number(item.book_id) === Number(bookId)
        );

        if (!book) {
            showMessage('Book not found.', 'error');
            return;
        }

        const confirmed = await showConfirmDialog(
            'Delete Book?',
            `Are you sure you want to delete "${book.title}"? This action cannot be undone.`,
            'Delete Book'
        );

        if (!confirmed) return;

        try {
            await request(`${API.books}/${bookId}`, {
                method: 'DELETE'
            });

            await loadBooksOnly();
            showMessage('Book deleted successfully.', 'success');

        } catch (error) {
            console.error('Delete book error:', error);
            showMessage(error.message, 'error');
        }
    }

    // =========================================
    // CATEGORY MODAL
    // =========================================

    async function openCategoryManager() {
        if (!elements.categoryModal) return;

        resetCategoryForm();
        hideCategoryMessage();

        elements.categoryModal.classList.add('show');

        try {
            await loadCategories();
        } catch (error) {
            showCategoryTableMessage(error.message);
            showCategoryMessage(error.message, 'error');
        }
    }

    function closeCategoryManager() {
        if (!elements.categoryModal) return;

        elements.categoryModal.classList.remove('show');
        resetCategoryForm();
        hideCategoryMessage();
    }

    function resetCategoryForm() {
        if (!elements.categoryForm) return;

        elements.categoryForm.reset();
        elements.categoryId.value = '';

        elements.saveCategoryButton.disabled = false;
        elements.saveCategoryButton.innerHTML =
            '<i class="fa-solid fa-plus"></i> Add Category';

        elements.cancelCategoryEditButton.textContent = 'Clear';
    }

    // =========================================
    // CATEGORY TABLE
    // =========================================

    function renderCategories() {
        if (!elements.categoryTableBody) return;

        if (elements.categoryCount) {
            elements.categoryCount.textContent =
                `${categories.length} ${categories.length === 1 ? 'category' : 'categories'}`;
        }

        if (categories.length === 0) {
            showCategoryTableMessage('No categories have been added yet.');
            return;
        }

        elements.categoryTableBody.innerHTML = categories.map(category => `
            <tr>
                <td>${escapeHTML(category.category_name)}</td>

                <td>${escapeHTML(category.description || '—')}</td>

                <td>
                    <button
                        type="button"
                        class="category-action-btn"
                        title="Edit Category"
                        data-category-action="edit"
                        data-id="${category.category_id}">
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        type="button"
                        class="category-action-btn delete"
                        title="Delete Category"
                        data-category-action="delete"
                        data-id="${category.category_id}">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }

    function showCategoryTableMessage(message) {
        if (!elements.categoryTableBody) return;

        elements.categoryTableBody.innerHTML = `
            <tr>
                <td colspan="3" class="category-empty">
                    ${escapeHTML(message)}
                </td>
            </tr>
        `;
    }

    // =========================================
    // ADD / UPDATE CATEGORY
    // =========================================

    async function saveCategory(event) {
        event.preventDefault();

        const categoryId = elements.categoryId.value;
        const categoryName = elements.categoryName.value.trim();
        const description = elements.categoryDescription.value.trim();

        if (!categoryName) {
            showCategoryMessage('Please enter a category name.', 'error');
            return;
        }

        const payload = {
            category_name: categoryName,
            description: description || null
        };

        try {
            elements.saveCategoryButton.disabled = true;
            elements.saveCategoryButton.textContent = 'Saving...';

            let selectedCategoryId = null;

            if (categoryId) {
                await request(`${API.categories}/${categoryId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });

                selectedCategoryId = Number(categoryId);

                showCategoryMessage(
                    'Category updated successfully.',
                    'success'
                );

            } else {
                const result = await request(API.categories, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                selectedCategoryId = result.category_id
                    ? Number(result.category_id)
                    : null;

                showCategoryMessage(
                    'Category added successfully.',
                    'success'
                );
            }

            await loadCategories();

            if (selectedCategoryId !== null) {
                populateCategoryDropdown(selectedCategoryId);
            }

            resetCategoryForm();

        } catch (error) {
            console.error('Save category error:', error);
            showCategoryMessage(error.message, 'error');

        } finally {
            elements.saveCategoryButton.disabled = false;
            elements.saveCategoryButton.innerHTML =
                '<i class="fa-solid fa-plus"></i> Add Category';
        }
    }

    // =========================================
    // EDIT CATEGORY
    // =========================================

    function editCategory(categoryId) {
        const category = categories.find(
            item => Number(item.category_id) === Number(categoryId)
        );

        if (!category) {
            showCategoryMessage('Category not found.', 'error');
            return;
        }

        elements.categoryId.value = category.category_id;
        elements.categoryName.value = category.category_name;
        elements.categoryDescription.value = category.description || '';

        elements.saveCategoryButton.innerHTML =
            '<i class="fa-solid fa-floppy-disk"></i> Save Changes';

        elements.cancelCategoryEditButton.textContent = 'Cancel Edit';

        elements.categoryName.focus();
        hideCategoryMessage();
    }

    // =========================================
    // DELETE CATEGORY
    // =========================================

    async function deleteCategory(categoryId) {
        const category = categories.find(
            item => Number(item.category_id) === Number(categoryId)
        );

        if (!category) {
            showCategoryMessage('Category not found.', 'error');
            return;
        }

        const confirmed = await showConfirmDialog(
            'Delete Category?',
            `Are you sure you want to delete "${category.category_name}"?`,
            'Delete Category'
        );

        if (!confirmed) return;

        try {
            await request(`${API.categories}/${categoryId}`, {
                method: 'DELETE'
            });

            await loadCategories();

            showCategoryMessage(
                'Category deleted successfully.',
                'success'
            );

        } catch (error) {
            console.error('Delete category error:', error);
            showCategoryMessage(error.message, 'error');
        }
    }

    // =========================================
    // CUSTOM CONFIRM DIALOG
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

                        <button type="button" class="close-btn" data-choice="cancel">
                            <i class="fa-solid fa-xmark"></i>
                        </button>
                    </div>

                    <div class="form-actions">
                        <button type="button" class="btn-secondary" data-choice="cancel">
                            Cancel
                        </button>

                        <button type="button" class="btn-primary" data-choice="confirm">
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

                const choiceButton = event.target.closest('[data-choice]');

                if (!choiceButton) return;

                finish(choiceButton.dataset.choice === 'confirm');
            });
        });
    }

    // =========================================
    // TOAST NOTIFICATIONS
    // =========================================

    function showMessage(message, type = 'success') {
        if (!elements.message) return;

        window.clearTimeout(showMessage.timeout);

        elements.message.textContent = message;
        elements.message.className = `message-box ${type}`;
        elements.message.style.display = 'block';
        elements.message.setAttribute('role', 'alert');

        showMessage.timeout = window.setTimeout(hideMessage, 4000);
    }

    function hideMessage() {
        if (!elements.message) return;

        window.clearTimeout(showMessage.timeout);

        elements.message.textContent = '';
        elements.message.className = 'message-box';
        elements.message.style.display = 'none';
    }

    function showCategoryMessage(message, type = 'success') {
        if (!elements.categoryMessage) return;

        window.clearTimeout(showCategoryMessage.timeout);

        elements.categoryMessage.textContent = message;
        elements.categoryMessage.className = `message-box ${type}`;
        elements.categoryMessage.style.display = 'block';
        elements.categoryMessage.setAttribute('role', 'alert');

        showCategoryMessage.timeout = window.setTimeout(
            hideCategoryMessage,
            4000
        );
    }

    function hideCategoryMessage() {
        if (!elements.categoryMessage) return;

        window.clearTimeout(showCategoryMessage.timeout);

        elements.categoryMessage.textContent = '';
        elements.categoryMessage.className = 'message-box';
        elements.categoryMessage.style.display = 'none';
    }

    // =========================================
    // THEME
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
        localStorage.setItem('theme', isDark ? 'dark' : 'light');

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

    elements.form?.addEventListener('submit', saveBook);

    elements.cancelButton?.addEventListener('click', closeModal);
    elements.closeButton?.addEventListener('click', closeModal);

    elements.modal?.addEventListener('click', event => {
        if (event.target === elements.modal) {
            closeModal();
        }
    });

    elements.search?.addEventListener('input', renderBooks);

    elements.tableBody?.addEventListener('click', event => {
        const button = event.target.closest('[data-action]');

        if (!button) return;

        const action = button.dataset.action;
        const bookId = button.dataset.id;

        if (action === 'edit') {
            editBook(bookId);
        }

        if (action === 'delete') {
            deleteBook(bookId);
        }
    });

    // CATEGORY MANAGER EVENTS

    elements.manageCategoriesButton?.addEventListener(
        'click',
        openCategoryManager
    );

    elements.closeCategoryModalButton?.addEventListener(
        'click',
        closeCategoryManager
    );

    elements.categoryModal?.addEventListener('click', event => {
        if (event.target === elements.categoryModal) {
            closeCategoryManager();
        }
    });

    elements.categoryForm?.addEventListener('submit', saveCategory);

    elements.cancelCategoryEditButton?.addEventListener('click', () => {
        resetCategoryForm();
        hideCategoryMessage();
    });

    elements.categoryTableBody?.addEventListener('click', event => {
        const button = event.target.closest('[data-category-action]');

        if (!button) return;

        const action = button.dataset.categoryAction;
        const categoryId = button.dataset.id;

        if (action === 'edit') {
            editCategory(categoryId);
        }

        if (action === 'delete') {
            deleteCategory(categoryId);
        }
    });

    elements.themeButton?.addEventListener('click', toggleTheme);
    elements.logoutButton?.addEventListener('click', logout);

    // =========================================
    // INITIALIZE
    // =========================================

    applyTheme();
    loadPageData();
});