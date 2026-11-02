document.addEventListener('DOMContentLoaded', () => {
    const API = '/api/settings';
    const $ = id => document.getElementById(id);

    const elements = {
        tableBody: $('settingsTableBody'),
        totalSettings: $('totalSettings'),
        databaseStatus: $('databaseStatus'),
        refreshBtn: $('refreshSettingsBtn'),
        openAddBtn: $('openAddSettingBtn'),
        modal: $('settingModal'),
        form: $('settingForm'),
        modalTitle: $('modalTitle'),
        settingId: $('settingId'),
        settingKey: $('settingKey'),
        settingValue: $('settingValue'),
        settingDescription: $('settingDescription'),
        closeModalBtn: $('closeModalBtn'),
        cancelModalBtn: $('cancelModalBtn'),
        themeToggleBtn: $('themeToggleBtn'),
        logoutBtn: $('logoutBtn')
    };

    let settings = [];
    let editingSettingId = null;

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

    function applyTheme() {
        const isDarkMode = localStorage.getItem('theme') === 'dark';
        document.body.classList.toggle('dark-mode', isDarkMode);
        if (elements.themeToggleBtn) {
            elements.themeToggleBtn.textContent = isDarkMode ? 'On' : 'Off';
        }
    }

    applyTheme();

    elements.themeToggleBtn?.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
        applyTheme();
    });

    elements.logoutBtn?.addEventListener('click', () => {
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
        if (Number.isNaN(date.getTime())) return '—';
        return date.toLocaleString('en-PH', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Manila'
        });
    }

    async function loadSettings() {
        if (elements.tableBody) {
            elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="loading-message">Loading settings...</td>
                </tr>
            `;
        }

        if (elements.databaseStatus) {
            elements.databaseStatus.textContent = 'Checking...';
        }

        try {
            const result = await request(API);
            settings = Array.isArray(result.data) ? result.data : [];

            if (elements.totalSettings) {
                elements.totalSettings.textContent = settings.length;
            }
            if (elements.databaseStatus) {
                elements.databaseStatus.textContent = 'Connected';
            }

            renderSettings();
        } catch (error) {
            console.error('Load settings error:', error);
            if (elements.databaseStatus) {
                elements.databaseStatus.textContent = 'Error';
            }
            if (elements.tableBody) {
                elements.tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="loading-message">
                            Unable to load settings: ${escapeHTML(error.message)}
                        </td>
                    </tr>
                `;
            }
        }
    }

    function renderSettings() {
        if (!elements.tableBody) return;

        if (settings.length === 0) {
            elements.tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="loading-message">No settings found.</td>
                </tr>
            `;
            return;
        }

        elements.tableBody.innerHTML = settings.map(setting => `
            <tr>
                <td><strong>${escapeHTML(setting.setting_key)}</strong></td>
                <td>${escapeHTML(setting.setting_value)}</td>
                <td>${escapeHTML(setting.description || '—')}</td>
                <td>${escapeHTML(formatDate(setting.updated_at || setting.created_at))}</td>
                <td>
                    <div class="action-buttons">
                        <button type="button" class="action-btn" data-action="edit" data-id="${setting.setting_id}" title="Edit Setting">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" class="action-btn delete" data-action="delete" data-id="${setting.setting_id}" title="Delete Setting">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    function openModal(setting = null) {
        if (!elements.modal) return;
        elements.form?.reset();

        editingSettingId = setting ? setting.setting_id : null;
        if (elements.settingId) elements.settingId.value = setting ? setting.setting_id : '';
        if (elements.settingKey) elements.settingKey.value = setting ? setting.setting_key : '';
        if (elements.settingValue) elements.settingValue.value = setting ? setting.setting_value : '';
        if (elements.settingDescription) elements.settingDescription.value = setting ? setting.description || '' : '';
        if (elements.modalTitle) elements.modalTitle.textContent = setting ? 'Edit Setting' : 'Add New Setting';

        elements.modal.classList.add('show');
        document.body.classList.add('modal-open');
    }

    function closeModal() {
        if (!elements.modal) return;
        elements.modal.classList.remove('show');
        document.body.classList.remove('modal-open');
        editingSettingId = null;
        elements.form?.reset();
    }

    async function saveSetting(e) {
        e.preventDefault();

        const key = elements.settingKey.value.trim();
        const value = elements.settingValue.value.trim();
        const description = elements.settingDescription.value.trim();

        if (!key || !value) {
            alert('Please fill in all required fields.');
            return;
        }

        const payload = {
            setting_key: key,
            setting_value: value,
            description: description || null
        };

        try {
            if (editingSettingId) {
                await request(`${API}/${editingSettingId}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
            } else {
                await request(API, {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            }

            closeModal();
            loadSettings();
        } catch (error) {
            console.error('Save setting error:', error);
            alert(error.message || 'Failed to save setting.');
        }
    }

    async function deleteSetting(id) {
        if (!confirm('Are you sure you want to delete this setting?')) return;

        try {
            await request(`${API}/${id}`, {
                method: 'DELETE'
            });
            loadSettings();
        } catch (error) {
            console.error('Delete setting error:', error);
            alert(error.message || 'Failed to delete setting.');
        }
    }

    elements.openAddBtn?.addEventListener('click', () => openModal());
    elements.closeModalBtn?.addEventListener('click', closeModal);
    elements.cancelModalBtn?.addEventListener('click', closeModal);
    elements.form?.addEventListener('submit', saveSetting);
    elements.refreshBtn?.addEventListener('click', loadSettings);

    elements.modal?.addEventListener('click', e => {
        if (e.target === elements.modal) closeModal();
    });

    elements.tableBody?.addEventListener('click', e => {
        const btn = e.target.closest('[data-action]');
        if (!btn) return;
        const id = btn.dataset.id;
        const setting = settings.find(s => String(s.setting_id) === String(id));

        if (btn.dataset.action === 'edit' && setting) {
            openModal(setting);
        } else if (btn.dataset.action === 'delete') {
            deleteSetting(id);
        }
    });

    loadSettings();
});