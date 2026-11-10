
document.addEventListener('DOMContentLoaded', () => {
    const API = '/api/publishers';

    const $ = id => document.getElementById(id);

    const elements = {
        tableBody: $('publishersTableBody'),
        search: $('publisherSearch'),
        count: $('publisherCount'),

        total: $('totalPublishers'),
        withEmail: $('publishersWithEmail'),
        withContact: $('publishersWithContact'),

        modal: $('publisherModal'),
        form: $('publisherForm'),
        modalTitle: $('publisherModalTitle'),
        id: $('publisherId'),
        name: $('publisherName'),
        email: $('publisherEmail'),
        contact: $('publisherContact'),
        address: $('publisherAddress'),

        addButton: $('addPublisherBtn'),
        saveButton: $('savePublisherBtn'),
        cancelButton: $('cancelPublisherBtn'),
        closeButton: $('closePublisherModal'),

        message: $('publisherMessage'),
        themeButton: $('themeToggleBtn'),
        logoutButton: $('logoutBtn')
    };

    let publishers = [];
    let editingPublisherId = null;



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



    function getPublisherEmail(publisher) {
        return publisher.email ||
               publisher.email_address ||
               publisher.publisher_email ||
               '';
    }



    async function loadPublishers() {
        showTableMessage('Loading publishers...');

        try {
            const result = await request(API);

            publishers = Array.isArray(result.data)
                ? result.data
                : [];

            renderPublishers();
            updateStatistics();

        } catch (error) {
            console.error('Load publishers error:', error);
            showTableMessage(error.message);
            showMessage(error.message, 'error');
        }
    }



    function renderPublishers() {
        if (!elements.tableBody) return;

        const searchTerm = elements.search
            ? elements.search.value.trim().toLowerCase()
            : '';

        const filtered = publishers.filter(publisher => {
            const name = String(publisher.publisher_name || '').toLowerCase();
            const email = String(getPublisherEmail(publisher)).toLowerCase();
            const contact = String(publisher.contact_number || '').toLowerCase();
            const address = String(publisher.address || '').toLowerCase();

            return (
                name.includes(searchTerm) ||
                email.includes(searchTerm) ||
                contact.includes(searchTerm) ||
                address.includes(searchTerm)
            );
        });

        if (filtered.length === 0) {
            showTableMessage(
                searchTerm
                    ? 'No publishers match your search.'
                    : 'No publishers have been added yet.'
            );

            updateCount(0);
            return;
        }

        elements.tableBody.innerHTML = filtered.map(publisher => `
            <tr>
                <td>
                    <div class="publisher-name">
                        ${escapeHTML(publisher.publisher_name)}
                    </div>
                </td>

                <td>
                    <span class="publisher-email">
                        ${escapeHTML(getPublisherEmail(publisher) || '—')}
                    </span>
                </td>

                <td>${escapeHTML(publisher.contact_number || '—')}</td>

                <td>${escapeHTML(publisher.address || '—')}</td>

                <td>
                    <div class="action-buttons">
                        <button
                            type="button"
                            class="action-btn"
                            title="Edit Publisher"
                            data-action="edit"
                            data-id="${publisher.publisher_id}">
                            <i class="fa-solid fa-pen"></i>
                        </button>

                        <button
                            type="button"
                            class="action-btn delete"
                            title="Delete Publisher"
                            data-action="delete"
                            data-id="${publisher.publisher_id}">
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
                <td colspan="5" class="table-message">
                    ${escapeHTML(message)}
                </td>
            </tr>
        `;
    }

    function updateCount(count) {
        if (!elements.count) return;

        elements.count.textContent =
            `${count} ${count === 1 ? 'publisher' : 'publishers'} found`;
    }



    function updateStatistics() {
        const total = publishers.length;

        const withEmail = publishers.filter(
            publisher => String(getPublisherEmail(publisher)).trim() !== ''
        ).length;

        const withContact = publishers.filter(
            publisher => String(publisher.contact_number || '').trim() !== ''
        ).length;

        if (elements.total) {
            elements.total.textContent = total;
        }

        if (elements.withEmail) {
            elements.withEmail.textContent = withEmail;
        }

        if (elements.withContact) {
            elements.withContact.textContent = withContact;
        }
    }



    function openModal(publisher = null) {
        if (!elements.modal || !elements.form) return;

        elements.form.reset();

        editingPublisherId = publisher
            ? Number(publisher.publisher_id)
            : null;

        elements.id.value = publisher
            ? publisher.publisher_id
            : '';

        elements.name.value = publisher
            ? publisher.publisher_name || ''
            : '';

        elements.email.value = publisher
            ? getPublisherEmail(publisher)
            : '';

        elements.contact.value = publisher
            ? publisher.contact_number || ''
            : '';

        elements.address.value = publisher
            ? publisher.address || ''
            : '';

        elements.modalTitle.textContent = publisher
            ? 'Edit Publisher'
            : 'Add New Publisher';

        elements.saveButton.disabled = false;
        elements.saveButton.innerHTML = publisher
            ? '<i class="fa-solid fa-floppy-disk"></i> Save Changes'
            : '<i class="fa-solid fa-floppy-disk"></i> Save Publisher';

        hideMessage();

        elements.modal.classList.add('show');
        document.body.classList.add('modal-open');

        elements.name.focus();
    }

    function closeModal() {
        if (!elements.modal) return;

        elements.modal.classList.remove('show');
        document.body.classList.remove('modal-open');

        editingPublisherId = null;
        elements.form?.reset();
    }



    async function savePublisher(event) {
        event.preventDefault();

        const name = elements.name.value.trim();
        const email = elements.email.value.trim();
        const contact = elements.contact.value.trim();
        const address = elements.address.value.trim();

        if (!name) {
            showMessage('Please enter a publisher name.', 'error');
            elements.name.focus();
            return;
        }

        const payload = {
            publisher_name: name,
            email: email || null,
            contact_number: contact || null,
            address: address || null
        };

        try {
            elements.saveButton.disabled = true;
            elements.saveButton.textContent = 'Saving...';

            if (editingPublisherId) {
                await request(`${API}/${editingPublisherId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });

                closeModal();
                await loadPublishers();
                showMessage('Publisher updated successfully.', 'success');

            } else {
                await request(API, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });

                closeModal();
                await loadPublishers();
                showMessage('Publisher added successfully.', 'success');
            }

        } catch (error) {
            console.error('Save publisher error:', error);
            showMessage(error.message, 'error');

        } finally {
            elements.saveButton.disabled = false;
            elements.saveButton.innerHTML =
                '<i class="fa-solid fa-floppy-disk"></i> Save Publisher';
        }
    }



    function editPublisher(publisherId) {
        const publisher = publishers.find(
            item => Number(item.publisher_id) === Number(publisherId)
        );

        if (!publisher) {
            showMessage('Publisher not found.', 'error');
            return;
        }

        openModal(publisher);
    }



    async function deletePublisher(publisherId) {
        const publisher = publishers.find(
            item => Number(item.publisher_id) === Number(publisherId)
        );

        if (!publisher) {
            showMessage('Publisher not found.', 'error');
            return;
        }

        const confirmed = await showConfirmDialog(
            'Delete Publisher?',
            `Are you sure you want to delete "${publisher.publisher_name}"? This action cannot be undone.`,
            'Delete Publisher'
        );

        if (!confirmed) return;

        try {
            await request(`${API}/${publisherId}`, {
                method: 'DELETE'
            });

            await loadPublishers();
            showMessage('Publisher deleted successfully.', 'success');

        } catch (error) {
            console.error('Delete publisher error:', error);
            showMessage(error.message, 'error');
        }
    }



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
                            data-choice="cancel">
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



    function showMessage(message, type = 'success') {
        if (!elements.message) return;

        clearTimeout(showMessage.timeout);

        elements.message.textContent = message;
        elements.message.className = `message-box ${type}`;
        elements.message.style.display = 'block';

        showMessage.timeout = setTimeout(hideMessage, 4000);
    }

    function hideMessage() {
        if (!elements.message) return;

        clearTimeout(showMessage.timeout);

        elements.message.textContent = '';
        elements.message.className = 'message-box';
        elements.message.style.display = 'none';
    }



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



    elements.addButton?.addEventListener('click', () => openModal());

    elements.form?.addEventListener('submit', savePublisher);

    elements.cancelButton?.addEventListener('click', closeModal);
    elements.closeButton?.addEventListener('click', closeModal);

    elements.modal?.addEventListener('click', event => {
        if (event.target === elements.modal) {
            closeModal();
        }
    });

    elements.search?.addEventListener('input', renderPublishers);

    elements.tableBody?.addEventListener('click', event => {
        const button = event.target.closest('[data-action]');

        if (!button) return;

        const publisherId = button.dataset.id;

        if (button.dataset.action === 'edit') {
            editPublisher(publisherId);
        }

        if (button.dataset.action === 'delete') {
            deletePublisher(publisherId);
        }
    });

    elements.themeButton?.addEventListener('click', toggleTheme);
    elements.logoutButton?.addEventListener('click', logout);



    applyTheme();
    loadPublishers();
});
