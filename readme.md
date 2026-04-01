 # 🚀 Automation Bot (Puppeteer + Node.js)

This project is a robust browser automation system built using Node.js and Puppeteer, designed to handle user registration flows, reporting, and session management with retry logic and fault tolerance.

📌 Features
🔁 Retry Mechanism for failed automation steps
🌐 Automated Browser Control using Puppeteer
👤 User Registration Flow Automation
📊 Report Generation & Unlock Flow
🔐 Session Handling (Login/Logout)
📁 User Data File Management
⚙️ Fully configurable via .env


#  🔄 Workflow Overview
Launch browser
Clear previous user data
Loop through user registrations:
Navigate to home
Register user
Generate report (if single user)
Logout (if multiple users)
Retry on failure (with browser restart)
Close browser (based on config)


# 🧠 Retry Logic
Each user flow retries up to MAX_RETRIES
Delay between retries: RETRY_DELAY_MS
Browser is restarted on failure to avoid corrupted state


🛠️ Customization

You can extend flows easily:

Add new automation steps in /flows
Modify retry strategy in index.js
Add logging/reporting as needed

# configuration settings

all configuration settings are in .env file

# how to run

1. install dependencies

```bash
npm install
```

2. run the automation

```bash
npm start
```

# how to stop

press `Ctrl + C` in the terminal
