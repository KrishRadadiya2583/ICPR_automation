const fs = require("fs");
const path = require("path");

function generateHTML(users) {
    const rows = users.map((user, index) => `
        <tr>
            <td data-label="Email">
                <div class="data-cell">
                    <span id="email-${index}">${user.email}</span>
                    <button class="btn-copy tooltip" onclick="copyText('email-${index}', this)" title="Copy Email">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M10 1H3a2 2 0 0 0-2 2v9h1V3a1 1 0 0 1 1-1h7V1z"/>
    <path d="M13 3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm1 11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v9z"/>
  </svg>
                    </button>
                </div>
            </td>

            <td data-label="Password">
                <div class="data-cell">
                    <span id="password-${index}">${user.password || 'password123'}</span>
                    <button class="btn-copy tooltip" onclick="copyText('password-${index}', this)" title="Copy Password">
                       <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M10 1H3a2 2 0 0 0-2 2v9h1V3a1 1 0 0 1 1-1h7V1z"/>
    <path d="M13 3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm1 11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v9z"/>
  </svg>
                    </button>
                </div>
            </td>

            <td data-label="Action">
                <button class="btn btn-token" onclick="getToken(${index})">
                    Get Token
                </button>
            </td>

            <td data-label="Token">
                <div class="token-container">
                    <span id="token-display-${index}" class="token-box">—</span>
                    <button class="btn-copy tooltip" onclick="copyToken(${index}, this)" title="Copy Token">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M10 1H3a2 2 0 0 0-2 2v9h1V3a1 1 0 0 1 1-1h7V1z"/>
    <path d="M13 3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm1 11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v9z"/>
  </svg>
                    </button>
                </div>
            </td>
        </tr>
    `).join("");

    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>User Dashboard</title>

<style>
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: "Segoe UI", Roboto, Arial, sans-serif;
    background: #f1f5f9;
    padding: 20px;
    color: #1e293b;
}

.container {
    max-width: 1100px;
    margin: auto;
}

/* Card Style */
.table-wrapper {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.05);
    overflow: hidden;
}

/* Table */
table {
    width: 100%;
    border-collapse: collapse;
    min-width: 600px;
}

th, td {
    padding: 14px 16px;
    text-align: left;
}

th {
    background: linear-gradient(135deg, #4f46e5, #6366f1);
    color: #ffffff;
    font-weight: 600;
    font-size: 14px;
    letter-spacing: 0.5px;
}

td {
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
}

/* Row hover */
tr:hover td {
    background: #f9fafb;
}

/* Buttons */
.btn {
    padding: 6px 12px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 13px;
    transition: all 0.2s ease;
}

.btn-token {
    background: #4f46e5;
    color: white;
}

.btn-token:hover {
    background: #4338ca;
}

.btn-copy {
    background: #e2e8f0;
    color: #334155;
    margin-left: 8px;
}

.btn-copy:hover {
    background: #cbd5f5;
}

/* Token Box */
.token-box {
    display: inline-block;
    padding: 6px 10px;
    border-radius: 6px;
    background: #f1f5f9;
    font-size: 12px;
    word-break: break-all;
}

.token-success {
    background: #dcfce7;
    color: #166534;
}

.token-error {
    background: #fee2e2;
    color: #991b1b;
}

/* Responsive */
@media (max-width: 768px) {
    body {
        padding: 10px;
    }

    .table-wrapper {
        overflow-x: auto;
    }

    table {
        min-width: 100%;
    }

    th, td {
        padding: 10px;
        font-size: 13px;
    }

    .btn {
        padding: 5px 10px;
        font-size: 12px;
    }
}

/* Extra Small Devices */
@media (max-width: 480px) {
    th {
        font-size: 12px;
    }

    td {
        font-size: 12px;
    }

    .btn {
        font-size: 11px;
    }
}
</style>
</head>

<body>

<div class="container">
    <h2>User Dashboard</h2>

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

<script>
function copyText(id, btn) {
    const text = document.getElementById(id).innerText;
    navigator.clipboard.writeText(text);
}

function copyToken(index) {
    const text = document.getElementById('token-display-' + index).innerText;
    if (text && text !== '—' && text !== 'Failed') {
        navigator.clipboard.writeText(text);
    }
}

async function getToken(index) {
    const email = document.getElementById('email-' + index).innerText;
    const password = document.getElementById('password-' + index).innerText;
    const tokenSpan = document.getElementById('token-display-' + index);

    tokenSpan.innerText = 'Loading...';
    tokenSpan.className = 'token-box';

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

        // Try multiple possible token paths
       const token = data?.data?.token;

        if (token) {
            tokenSpan.innerText = token;
            tokenSpan.className = 'token-box token-success';
        } else {
            tokenSpan.innerText = 'No Token';
            tokenSpan.className = 'token-box token-error';
        }

    } catch (err) {
        console.error("ERROR:", err);
        tokenSpan.innerText = 'Failed';
        tokenSpan.className = 'token-box token-error';
    }
}
</script>

</body>
</html>
    `;

    const filePath = path.join(__dirname, "../public/users.html");

    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, html, "utf-8");

    console.log("HTML Generated:", filePath);

    return filePath;
}

module.exports = { generateHTML };