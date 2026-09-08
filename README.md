# 🚀 Full-Stack Secure To-Do List Application

A robust, secure, and lightweight full-stack task management web application built entirely **without frameworks** (No Express.js, No React). This project demonstrates a deep understanding of core web mechanics using Vanilla JavaScript, a native Node.js HTTP server, and MongoDB.

---

## 🏗️ Architecture & Tech Stack

This application follows a traditional **Client-Server-Database** architecture communicating via RESTful HTTP APIs.

```text
┌─────────────────────────┐          HTTP / Fetch API          ┌─────────────────────────┐          MongoDB Driver          ┌─────────────────────────┐
│     Frontend Client     │ ─────────────────────────────────> │   Node.js HTTP Server   │ ───────────────────────────────> │      MongoDB Database   │
│ (HTML5, CSS3, App.js)   │ <───────────────────────────────── │       (server.js)       │ <─────────────────────────────── │      (Local Cluster)    │
└─────────────────────────┘          JSON Responses            └─────────────────────────┘          Persistent Data       └─────────────────────────┘

Tech Stack
Frontend: HTML5, CSS3, Vanilla JavaScript (ES6+ with fetch API)

Backend: Node.js (Built-in native http module)

Database: MongoDB (Official Node.js driver)

🔄 Application Workflow
Task Creation: The user enters a task in the UI input field and clicks "Add" (or presses Enter). The frontend sends a POST request to the Node.js server.

Input Validation & Sanitization: The backend validates and trims the incoming string data to prevent malformed entries before saving it to MongoDB.

Data Persistence: MongoDB stores the document securely with a unique sequential numeric ID, task title, and completion status (isCompleted: false).

State Management & UI Update: The frontend receives the response, appends the task to the DOM state, and updates the reactive counter (items left).

Task Update & Deletion: Checking a task triggers a PUT request to update its completion state. Deleting a task triggers a DELETE request, ensuring business logic rules (e.g., only completed tasks can be removed) are enforced.

✨ Features & Security Implementation
🔒 Core Security Features:

Security HTTP Headers: Built-in protection via headers (X-Content-Type-Options: nosniff, X-Frame-Options: DENY, X-XSS-Protection) to mitigate XSS and clickjacking.

CORS Policy Controls: Explicitly configured origin and method headers to govern API accessibility.

Input Validation & Sanitization: Server-side type-checking and string trimming to reject empty or malicious inputs.

⚡ Full CRUD Operations: Create, read, update completion status, and delete tasks dynamically.

📋 Filter & Sort: Filter tasks by All, Active, or Completed, with automatic alphabetical sorting.

🛡️ Deletion Guardrails: Built-in validation requiring tasks to be marked as completed and confirmed before deletion.

📂 Project Directory Structure
Plaintext
your-project-folder/
├── index.html       # Frontend UI markup
├── styles.css       # Responsive styling and theme layout
├── app.js           # Frontend logic, event listeners, and API fetch calls
├── server.js        # Native Node.js HTTP server, routing, and MongoDB integration
├── package.json     # Project metadata and dependencies
└── README.md        # Project documentation

⚙️ How to Run Locally
Prerequisites
Ensure Node.js and MongoDB are installed and running locally on your PC.

Installation & Setup
Clone the repository:

Bash
git clone <your-repository-url>
cd your-project-folder
Install dependencies:

Bash
npm install mongodb
Verify Database Service:

Ensure your local MongoDB instance/service is active on port 27017.

Start the Backend Server:

Bash
node server.js
Expected output: Connected successfully to MongoDB followed by API Server running on http://localhost:3000

Launch the Frontend:

Open index.html directly in your browser, or use a tool like the Live Server extension in Visual Studio Code.

👨‍💻 Author
Abhi