const fs = require("fs");
const path = require("path");

function generateHTML(users) {
    const rows = users.map((user, index) => `
        <tr>
            <td id="email-${index}">${user.email} 
                <button class="btn-copy" onclick="navigator.clipboard.writeText('${user.email}')">Copy</button>
            </td>
            <td id="password-${index}">${user.password || 'password123'} 
                <button class="btn-copy" onclick="navigator.clipboard.writeText('${user.password || 'password123'}')">Copy</button>
            </td>
            <td>
                <button class="btn-token" onclick="getToken(${index})">Get Token</button>
            </td>
            <td>
                <span id="token-display-${index}" class="token-placeholder">—</span>
                <button class="btn-copy" onclick="copyToken(${index})">Copy</button>
            </td>
        </tr>
    `).join("");

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
        <title>User Report</title>
        <style>
            body { font-family: sans-serif; padding: 40px; background-color: #f4f4f9; }
            table { border-collapse: collapse; width: 100%; background: white; }
            th, td { padding: 12px; border: 1px solid #ddd; text-align: left; }
            th { background-color: #f8f9fa; }
            .btn-copy, .btn-token { cursor: pointer; margin-left: 5px; padding: 4px 8px; }
            .loading { color: #666; font-style: italic; }
        </style>
    </head>
    <body>
        <h2>User Report</h2>
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

        <script>
            async function getToken(index) {
                const email = document.getElementById('email-' + index).innerText.replace('Copy', '').trim();
                const password = document.getElementById('password-' + index).innerText.replace('Copy', '').trim();
                const tokenSpan = document.getElementById('token-display-' + index);

                tokenSpan.innerText = "Loading...";
                tokenSpan.className = "loading";

                try {
                    // Replace the URL below with your actual API endpoint
                    const response = await fetch('YOUR_API_ENDPOINT_HERE', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email, password })
                    });

                    const data = await response.json();
                    
                    // Adjust 'data.token' based on your API's actual response structure
                    if (data.token) {
                        tokenSpan.innerText = data.token;
                        tokenSpan.className = "";
                    } else {
                        tokenSpan.innerText = "Error: No Token";
                    }
                } catch (err) {
                    console.error(err);
                    tokenSpan.innerText = "Failed";
                }
            }

            function copyToken(index) {
                const text = document.getElementById('token-display-' + index).innerText;
                if (text !== "—" && text !== "Loading...") {
                    navigator.clipboard.writeText(text);
                    alert("Token copied!");
                }
            }
        </script>
    </body>
    </html>
    `;

    const filePath = path.join(__dirname, "../public/users.html");
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, html, "utf-8");
    return filePath;
}

module.exports = { generateHTML };