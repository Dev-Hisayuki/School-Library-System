
document.addEventListener('DOMContentLoaded', () => {
    const tableBody = document.getElementById('settingsTableBody');
    const settingModal = document.getElementById('settingModal');
    const settingForm = document.getElementById('settingForm');

    const settingId = document.getElementById('settingId');
    const settingKey = document.getElementById('settingKey');
    const settingValue = document.getElementById('settingValue');
    const settingDescription = document.getElementById('settingDescription');

    const totalSettings = document.getElementById('totalSettings');
    const databaseStatus = document.getElementById('databaseStatus');
    const saveButton = document.getElementById('saveSettingBtn');

    let settings = [];

    // DARK MODE
    const themeToggleBtn = document.getElementById('themeToggleBtn');

    function applyTheme() {
        const isDarkMode = localStorage.getItem('theme') === 'dark';

        document.body.classList.toggle('dark-mode', isDarkMode);

        if (themeToggleBtn) {
            themeToggleBtn.textContent = isDarkMode ? 'On' : 'Off';
            themeToggleBtn.setAttribute('aria-pressed', String(isDarkMode));
        }
    }

    applyTheme();

    themeToggleBtn?.addEventListener('click', () => {
        const isDarkMode = document.body.classList.contains('dark-mode');

        localStorage.setItem('theme', isDarkMode ? 'light' : 'dark');
        applyTheme();
    });

    // LOGOUT
    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        localStorage.removeItem('authToken');
        window.location.href = '../login/login.html';
    });

    // ESCAPE HTML
    function escapeHTML(value) {
        return String(value ?? '').replace(/[&<>"']/g, character => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        })[character]);
    }

    // API RESPONSE HANDLER
    async function getResponseData(response) {
        const result = await response.json();

        if (!response.ok || !result.success) {
            throw new Error(
                result.message || `Request failed (${response.status}).`
            );
        }

        return result;
    }

    // LOAD SETTINGS
    async function loadSettings() {
        if (!tableBody) return;

        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="loading-message">
                    <i class="fa-solid fa-spinner fa-spin"></i>
                    Loading settings...
                </td>
            </tr>
        `;

        if (databaseStatus) {
            databaseStatus.textContent = 'Checking...';
        }

        try {
            const response = await fetch('/api/settings');
            const result = await getResponseData(response);

            settings = Array.isArray(result.data) ? result.data : [];

            if (totalSettings) {
                totalSettings.textContent = settings.length;
            }

            if (databaseStatus) {
                databaseStatus.textContent = 'Connected';
            }

            if (settings.length === 0) {
                tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-message">
                            <i class="fa-solid fa-gear"></i>
                            <p>No system settings found.</p>
                            <p>Add your first setting to get started.</p>
                        </td>
                    </tr>
                `;
                return;
            }

            tableBody.innerHTML = settings.map(setting => `
                <tr>
                    <td>
                        <span class="setting-key">
                            ${escapeHTML(setting.setting_key)}
                        </span>
                    </td>

                    <td>
                        <div class="setting-value">
                            ${escapeHTML(setting.setting_value)}
                        </div>
                    </td>

                    <td>
                        ${escapeHTML(setting.description || '—')}
                    </td>

                    <td>
                        ${setting.updated_at
                            ? escapeHTML(
                                new Date(setting.updated_at).toLocaleString()
                            )
                            : '—'}
                    </td>

                    <td>
                        <div class="action-buttons">
                            <button
                                class="action-btn edit"
                                data-action="edit"
                                data-id="${Number(setting.id)}"
                                title="Edit setting"
                                aria-label="Edit ${escapeHTML(setting.setting_key)}"
                                type="button">
                                <i class="fa-solid fa-pen"></i>
                            </button>

                            <button
                                class="action-btn delete"
                                data-action="delete"
                                data-id="${Number(setting.id)}"
                                title="Delete setting"
                                aria-label="Delete ${escapeHTML(setting.setting_key)}"
                                type="button">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Settings error:', error);

            settings = [];

            if (databaseStatus) {
                databaseStatus.textContent = 'Error';
            }

            if (totalSettings) {
                totalSettings.textContent = '0';
            }

            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-message">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p>Unable to load system settings.</p>
                        <p>${escapeHTML(error.message)}</p>
                    </td>
                </tr>
            `;
        }
    }

    // OPEN MODAL
    function openModal(editing = false, setting = null) {
        settingForm.reset();
        settingId.value = '';

        document.getElementById('modalTitle').textContent =
            editing ? 'Edit Setting' : 'Add New Setting';

        saveButton.textContent =
            editing ? 'Update Setting' : 'Save Setting';

        settingKey.disabled = editing;

        if (editing && setting) {
            settingId.value = setting.id;
            settingKey.value = setting.setting_key;
            settingValue.value = setting.setting_value ?? '';
            settingDescription.value = setting.description ?? '';
        }

        settingModal.classList.add('show');
        settingKey.focus();
    }

    // CLOSE MODAL
    function closeModal() {
        settingModal.classList.remove('show');
        settingForm.reset();
        settingId.value = '';
        settingKey.disabled = false;
        saveButton.disabled = false;
        saveButton.textContent = 'Save Setting';
    }

    // MODAL EVENTS
    document.getElementById('openAddSettingBtn')
        ?.addEventListener('click', () => openModal());

    document.getElementById('closeModalBtn')
        ?.addEventListener('click', closeModal);

    document.getElementById('cancelModalBtn')
        ?.addEventListener('click', closeModal);

    settingModal?.addEventListener('click', event => {
        if (event.target === settingModal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', event => {
        if (event.key === 'Escape' && settingModal.classList.contains('show')) {
            closeModal();
        }
    });

    // CREATE OR UPDATE SETTING
    settingForm.addEventListener('submit', async event => {
        event.preventDefault();

        if (saveButton.disabled) return;

        const id = settingId.value;
        const editing = Boolean(id);

        const payload = {
            setting_key: settingKey.value.trim(),
            setting_value: settingValue.value.trim(),
            description: settingDescription.value.trim()
        };

        if (!payload.setting_key || !payload.setting_value) {
            alert('Please complete the required fields.');
            return;
        }

        saveButton.disabled = true;
        saveButton.textContent = 'Saving...';

        try {
            const response = await fetch(
                editing ? `/api/settings/${encodeURIComponent(id)}` : '/api/settings',
                {
                    method: editing ? 'PUT' : 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(payload)
                }
            );

            const result = await getResponseData(response);

            closeModal();
            await loadSettings();

            alert(result.message || 'Setting saved successfully.');

        } catch (error) {
            console.error('Save setting error:', error);
            alert(error.message);

        } finally {
            saveButton.disabled = false;

            if (settingModal.classList.contains('show')) {
                saveButton.textContent = editing
                    ? 'Update Setting'
                    : 'Save Setting';
            }
        }
    });

    // EDIT OR DELETE SETTING
    tableBody.addEventListener('click', async event => {
        const button = event.target.closest('button[data-action]');

        if (!button || button.disabled) return;

        const id = Number(button.dataset.id);
        const action = button.dataset.action;

        const setting = settings.find(item => Number(item.id) === id);

        if (!setting) return;

        if (action === 'edit') {
            openModal(true, setting);
            return;
        }

        if (action === 'delete') {
            const confirmed = confirm(
                `Are you sure you want to delete "${setting.setting_key}"?`
            );

            if (!confirmed) return;

            button.disabled = true;

            try {
                const response = await fetch(
                    `/api/settings/${encodeURIComponent(id)}`,
                    {
                        method: 'DELETE'
                    }
                );

                const result = await getResponseData(response);

                await loadSettings();

                alert(result.message || 'Setting deleted successfully.');

            } catch (error) {
                console.error('Delete setting error:', error);
                alert(error.message);

            } finally {
                button.disabled = false;
            }
        }
    });

    // REFRESH
    document.getElementById('refreshSettingsBtn')
        ?.addEventListener('click', loadSettings);

    // INITIAL LOAD
    loadSettings();
});
