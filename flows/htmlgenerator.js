const fs = require("fs");
const path = require("path");

const logger = require("../utils/logger");

function generateHTML(users) {
    const rows = users.map((user, index) => `
        <tr class="table-row">
            <td data-label="Email">
                <div class="data-cell">
                    <span id="email-${index}" class="text-content">${user.email}</span>
                    <button class="icon-btn tooltip" data-tooltip="Copy Email" onclick="copyText('email-${index}', this)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                </div>
            </td>

            <td data-label="Password">
                <div class="data-cell">
                    <span id="password-${index}" class="text-content" data-value="${user.password || 'password123'}">${user.password || 'password123'}</span>
                    <button class="icon-btn tooltip reveal-btn" data-tooltip="Hide" onclick="toggleMask('password-${index}', this)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="eye-icon"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
                    </button>
                    <button class="icon-btn tooltip" data-tooltip="Copy Password" onclick="copyActualValue('password-${index}', this)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                </div>
            </td>

            <td data-label="Action">
                <button class="btn btn-primary" id="fetch-token" onclick="getToken(${index}, this)">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path><path d="M12 22v-4"></path><path d="M12 8v-4"></path><path d="M8 12h8"></path><circle cx="16" cy="16" r="2"></circle><circle cx="16" cy="4" r="2"></circle></svg>
                    <span>Fetch Token</span>
                </button>
            </td>

            <td data-label="Token">
                <div class="data-cell token-container">
                    <span id="token-display-${index}" class="token-box text-content" data-value="">—</span>
                    <button class="icon-btn tooltip" data-tooltip="Copy Token" onclick="copyActualValue('token-display-${index}', this)">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                    </button>
                </div>
            </td>

             <td data-label="Action">
                <button class="btn btn-primary" id="login-btn">
                <a href="${process.env.WEBSITE_URL}en/login" target="_blank"
   style="display: flex; align-items: center; gap: 0.5rem; color: white; text-decoration: none;">
   Login
</a>
                </button>
            </td>
        </tr>
    `).join("");

    const html = `
<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Admin</title>

<style>
:root {
    /* Light Theme Tokens */
    --bg-body: #f8fafc;
    --bg-card: #ffffff;
    --bg-hover: #f1f5f9;
    --text-primary: #0f172a;
    --text-secondary: #64748b;
    --border-color: #e2e8f0;
    
    --primary: #4f46e5;
    --primary-hover: #4338ca;
    --primary-light: #e0e7ff;
    
    --success: #10b981;
    --success-bg: #d1fae5;
    --error: #ef4444;
    --error-bg: #fee2e2;
    --warning: #f59e0b;
    --warning-bg: #fef3c7;
    
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
    
    --radius-md: 0.5rem;
    --radius-lg: 0.75rem;
    --radius-full: 9999px;
    
    --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    --transition-base: 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

[data-theme="dark"] {
    --bg-body: #0f172a;
    --bg-card: #1e293b;
    --bg-hover: #334155;
    --text-primary: #f8fafc;
    --text-secondary: #94a3b8;
    --border-color: #334155;
    
    --primary: #6366f1;
    --primary-hover: #818cf8;
    --primary-light: rgba(99, 102, 241, 0.2);
    
    --success: #34d399;
    --success-bg: rgba(16, 185, 129, 0.15);
    --error: #f87171;
    --error-bg: rgba(239, 68, 68, 0.15);
    
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.3);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.4);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.5), 0 4px 6px -4px rgb(0 0 0 / 0.5);
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    background-color: var(--bg-body);
    color: var(--text-primary);
    line-height: 1.5;
    padding: 1.5rem;
    transition: background-color var(--transition-base), color var(--transition-base);
}

.container {
    max-width: 1200px;
    margin: 0 auto;
}

/* Header */
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.header h1 {
    font-size: 1.75rem;
    font-weight: 700;
    letter-spacing: -0.025em;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.header h1 svg {
    width: 28px;
    height: 28px;
    color: var(--primary);
}

/* Theme Toggle */
.theme-toggle {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    color: var(--text-primary);
    padding: 0.5rem;
    border-radius: var(--radius-full);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
    box-shadow: var(--shadow-sm);
}
.theme-toggle:hover {
    background: var(--bg-hover);
    transform: translateY(-1px);
}
.theme-toggle svg {
    width: 20px;
    height: 20px;
}
.theme-toggle .moon { display: none; }
[data-theme="dark"] .theme-toggle .sun { display: none; }
[data-theme="dark"] .theme-toggle .moon { display: block; }

/* Card Wrapper */
.table-card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-color);
    overflow-x: auto;
    transition: box-shadow var(--transition-base), background-color var(--transition-base);
}

/* Table */
table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
}

thead {
    background: var(--bg-body);
    border-bottom: 2px solid var(--border-color);
}

th {
    padding: 1rem 1.5rem;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--text-secondary);
    font-weight: 600;
}

td {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    font-size: 0.875rem;
    vertical-align: middle;
}

.table-row {
    transition: background-color var(--transition-fast);
}

.table-row:hover {
    background-color: var(--bg-hover);
}

.table-row:last-child td {
    border-bottom: none;
}

/* Data Cells */
.data-cell {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.text-content {
    font-family: 'ui-monospace', 'SFMono-Regular', Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    transition: filter var(--transition-base);
}

.masked {
    filter: blur(4px);
    user-select: none;
    opacity: 0.7;
}

.masked:hover {
    opacity: 1;
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 500;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.btn-primary {
    background-color: var(--primary);
    color: white;
    box-shadow: var(--shadow-sm);
}

.btn-primary:hover {
    background-color: var(--primary-hover);
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
}

.btn-primary:active {
    transform: translateY(0);
}

.btn-icon {
    width: 16px;
    height: 16px;
}

.icon-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    background: transparent;
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--text-secondary);
    cursor: pointer;
    transition: all var(--transition-fast);
}

.icon-btn svg {
    width: 16px;
    height: 16px;
}

.icon-btn:hover {
    background-color: var(--primary-light);
    color: var(--primary);
    border-color: rgba(99, 102, 241, 0.3);
}

/* Tooltips */
.tooltip {
    position: relative;
}

.tooltip::after {
    content: attr(data-tooltip);
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(-4px);
    background: var(--text-primary);
    color: var(--bg-card);
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-fast);
    z-index: 10;
    box-shadow: var(--shadow-md);
    pointer-events: none;
}

.tooltip::before {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%) translateY(4px);
    border-width: 4px;
    border-style: solid;
    border-color: var(--text-primary) transparent transparent transparent;
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-fast);
    z-index: 10;
    pointer-events: none;
}

.tooltip:hover::after,
.tooltip:hover::before {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(-8px);
}
.tooltip:hover::before {
    transform: translateX(-50%) translateY(0);
}

.tooltip.copied::after {
    background: var(--success);
    color: #fff;
}
.tooltip.copied::before {
    border-top-color: var(--success);
}

/* Tokens */
.token-container {
    max-width: 250px;
}

.token-box {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    background: var(--bg-hover);
    border: 1px solid var(--border-color);
    font-size: 0.8125rem;
    word-break: break-all;
    white-space: normal;
    transition: all var(--transition-fast);
}

.token-box.token-success {
    background-color: var(--success-bg);
    color: var(--success);
    border-color: rgba(16, 185, 129, 0.3);
}

.token-box.token-error {
    background-color: var(--error-bg);
    color: var(--error);
    border-color: rgba(239, 68, 68, 0.3);
}

.token-box.loading {
    background-color: var(--warning-bg);
    color: var(--warning);
    border-color: rgba(245, 158, 11, 0.3);
    animation: pulse 1.5s infinite ease-in-out;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

/* Loading Spinner */
.spinner {
    animation: spin 1s linear infinite;
}
@keyframes spin {
    100% { transform: rotate(360deg); }
}

/* Responsive Data Table */
@media (max-width: 768px) {
    body { padding: 1rem; }
    .header { flex-direction: column; align-items: flex-start; gap: 1rem; }
    .theme-toggle { align-self: flex-end; margin-top: -3.5rem; }
    
    table {
        min-width: 700px;
    }
}
</style>
</head>

<body>

<div class="container">
    <div class="header">
        <h1>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
            System Access Control
        </h1>
        <button class="theme-toggle tooltip" id="themeToggleBtn" data-tooltip="Toggle Theme">
            <svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            <svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
        </button>
    </div>

    <div class="table-card">
        <table>
            <thead>
                <tr>
                    <th>Email</th>
                    <th>Password</th>
                    <th>Action</th>
                    <th>Token</th>
                </tr>
            </thead>
            <tbody>
                ${rows}
            </tbody>
        </table>
    </div>
</div>

<script>
// Theme support
const htmlEl = document.documentElement;
const themeToggleBtn = document.getElementById('themeToggleBtn');

function setTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
setTheme(savedTheme);

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    setTheme(currentTheme === 'light' ? 'dark' : 'light');
});

// UI Interactions
function showTooltip(btn, msg) {
    const original = btn.getAttribute('data-tooltip');
    btn.setAttribute('data-tooltip', msg);
    btn.classList.add('copied');
    setTimeout(() => {
        btn.setAttribute('data-tooltip', original);
        btn.classList.remove('copied');
    }, 2000);
}

function copyText(id, btn) {
    const el = document.getElementById(id);
    navigator.clipboard.writeText(el.innerText).then(() => showTooltip(btn, 'Copied!'));
}

function copyActualValue(id, btn) {
    const el = document.getElementById(id);
    const textToCopy = el.getAttribute('data-value') || el.innerText;
    if (textToCopy && textToCopy !== '—' && textToCopy !== 'Failed') {
        navigator.clipboard.writeText(textToCopy).then(() => showTooltip(btn, 'Copied!'));
    } else {
        showTooltip(btn, 'Nothing to copy');
    }
}

function toggleMask(id, btn) {
    const el = document.getElementById(id);
    const isMasked = el.classList.contains('masked');
    const eyeIconPath = btn.querySelector('.eye-icon path');
    
    if (isMasked) {
        el.classList.remove('masked');
        el.innerText = el.getAttribute('data-value');
        // Change to eye-off
        btn.querySelector('.eye-icon').innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
        btn.setAttribute('data-tooltip', 'Hide');
    } else {
        el.classList.add('masked');
        el.innerText = '••••••••';
        // Change to eye
        btn.querySelector('.eye-icon').innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        btn.setAttribute('data-tooltip', 'Reveal');
    }
}

async function getToken(index, btnEl) {
    const email = document.getElementById('email-' + index).innerText;
    const pwdEl = document.getElementById('password-' + index);
    const password = pwdEl.getAttribute('data-value') || pwdEl.innerText;
    const tokenSpan = document.getElementById('token-display-' + index);
    
    const iconOriginal = btnEl.innerHTML;
    // Loading state for button
    btnEl.innerHTML = '<svg class="spinner btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg><span>Loading...</span>';
    btnEl.disabled = true;

    tokenSpan.innerText = 'Fetching...';
    tokenSpan.className = 'token-box text-content loading';
    tokenSpan.removeAttribute('data-value');

    try {
        const response = await fetch('https://devapi.reversly.com/api/user/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'mode': 'cors',
                'accept': '*/*',
                'x-site': 'https://dev-pr.infochecker.com',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InN1Yl9kaXNjb3VudGVkX2Z1bGxfYWNjZXNzLTM4NzQzOUB5b3BtYWlsLmNvbSIsInVzZXJJZCI6IjY5Y2UxMmYxMTVlZTU0ZGVkMDJhOTE2OCIsImlhdCI6MTc3NTExMzA3MCwiZXhwIjoxNzc1NzE3ODcwfQ.oQP3am3U1WUIwSHXhvSMfcSKO1dJWf99dwZXLurkG_c'
            },
            body: JSON.stringify({
                payload: { email, password }
            })
        });

        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Response Data:", data);

        const token = data?.data?.token;

        if (token) {
            tokenSpan.setAttribute('data-value', token);
            tokenSpan.innerText = token;
            tokenSpan.className = 'token-box text-content token-success';
        } else {
            tokenSpan.innerText = 'No Token';
            tokenSpan.className = 'token-box text-content token-error';
            tokenSpan.setAttribute('data-value', '');
        }

    } catch (err) {
        console.error("ERROR:", err);
        tokenSpan.innerText = 'Failed';
        tokenSpan.className = 'token-box text-content token-error';
        tokenSpan.setAttribute('data-value', '');
    } finally {
        btnEl.innerHTML = iconOriginal;
        btnEl.disabled = false;
    }
}
</script>

</body>
</html>
    `;

    const filePath = path.join(__dirname, "../public/users.html");

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, html, "utf-8");

    logger.success(`HTML Generated: ${filePath}`);

    return filePath;
}

module.exports = { generateHTML };