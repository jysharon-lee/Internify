# 🎓 Internify - Smart Internship Matching Platform

Internify is a full-stack web application designed to streamline the internship search process for students. It acts as a bridge between students and companies, featuring a dynamic **Match Score** algorithm that compares a user's technical skills against internship requirements in real-time.

This project was developed for **COS30043 Interface Design and Development**.

---

## ✨ Core Features
- **Stateless Authentication:** Secure user registration and login using JSON Web Tokens (JWT) and `bcrypt` password hashing.
- **Smart Match Scoring:** A dynamic algorithm that calculates how well a student's profile matches a job description.
- **Application Kanban Tracker:** A reactive drag-and-drop or list-style tracker for users to monitor their "Saved", "Applied", and "Interviewing" jobs.
- **Adaptive UI:** A fully responsive, mobile-first interface utilizing CSS Grid and Flexbox.
- **Dark/Light Mode:** A system-adaptive theme engine powered by CSS Custom Properties and Vue Composables.
- **Data Visualization:** An analytics dashboard that graphs application success rates.

---

## 🛠️ Technology Stack
This project strictly enforces a separation of concerns via a decoupled Client-Server architecture.

### Frontend (Presentation Layer)
- **Framework:** Vue.js 3 (Composition API)
- **Build Tool:** Vite (for lightning-fast HMR)
- **State Management:** Pinia
- **Routing:** Vue Router 4
- **Styling:** Vanilla CSS3 (No external bloated frameworks like Bootstrap/Tailwind)

### Backend (Business Logic Layer)
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL
- **Security:** `jsonwebtoken` (Auth), `bcryptjs` (Hashing), `cors`

---

## 🚀 Local Development Setup

To run this project locally, you will need to start both the backend server and the frontend client.

### Prerequisites
1. [Node.js](https://nodejs.org/) (v18 or higher recommended)
2. [MySQL Server](https://dev.mysql.com/downloads/mysql/) running locally (or a cloud MySQL instance like Aiven)

### Step 1: Database Setup
1. Open your MySQL client (e.g., MySQL Workbench, DBeaver, or CLI).
2. Execute the provided SQL script located at `backend/database.sql`. This will automatically create the `internify` database, build all necessary tables, and inject sample seed data.

### Step 2: Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the root of the `backend` folder and add your database credentials:
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=internify
   JWT_SECRET=super_secret_jwt_key
   FRONTEND_URL=http://localhost:5173
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The server should now be running on `http://localhost:3000`.*

### Step 3: Frontend Setup
1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:5173`).

---

## 👤 Author
*   **Name:** Sharon Jia Yi LEE
*   **Student ID:** 104381327
*   **Unit:** COS30043 Interface Design and Development
