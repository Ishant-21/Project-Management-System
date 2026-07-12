Project Manager

admins :-
username : admin@gmail.com
password :admin


username : admin2@gmail.com
password :asd123


members :- 

username : user1@gmail.com
password :user1

username : user2@gmail.com
password :user2

username : user3@gmail.com
password :user3

========================================================================================

## 🚀 Installation & Setup Guide

Welcome! This guide will help you get the **Project Manager** app running on your computer, even if you are not a developer. 

> 💡 **Need Help?** If you encounter any error messages or get stuck, just copy the error and paste it into **[ChatGPT](https://chatgpt.com/)** with the prompt: *"I am setting up a Node.js project and got this error, how do I fix it?"*

---

### 1️⃣ Step 1: Install Required Software (Tech Stack)
Before we start, you need to install these 3 tools. Think of them as the "engine" and "fuel" for the app.

*   **Node.js:** The environment that runs the code.
    *   [Download here](https://nodejs.org/) (Select the **LTS** version).
*   **PostgreSQL & pgAdmin 4:** The database where all your project data is stored.
    *   [Download here](https://www.postgresql.org/download/)
    *   **Note:** When installing PostgreSQL, the installer will ask if you want to include **pgAdmin 4**. Make sure that box is checked! pgAdmin is the visual tool we will use to manage the database.
*   **Git:** A tool to "download" the code from the internet.
    *   [Download here](https://git-scm.com/)

---

### 2️⃣ Step 2: Download the Project
We need to copy the project files to your computer.

1. Open your **Terminal** (Mac/Linux) or **Command Prompt (CMD)** (Windows).
2. Type these commands one by one:

**Bash / CMD:**
```bash
git clone <repository-url>
cd project-management
```

---

### 3️⃣ Step 3: Setup the Database (using pgAdmin 4)
Now we need to create a "container" for your data inside PostgreSQL.

1.  **Open pgAdmin 4** (Search for it in your Start Menu/Applications).
2.  If it asks for a "Master Password," enter the one you set during the PostgreSQL installation.
3.  On the left sidebar, right-click on **Databases**.
4.  Select **Create** > **Database...**.
5.  In the box that appears, type the name: `project_management`.
6.  Click **Save**.

> 💡 **ChatGPT Tip:** If you can't find pgAdmin or forgot your password, ask ChatGPT: *"How do I reset my PostgreSQL password on Windows?"* or *"How do I open pgAdmin 4?"*

---

### 4️⃣ Step 4: Configure the Server
The server is the "brain" of the app. It needs to know how to connect to your database.

1.  **Navigate to the server folder:**
    ```bash
    cd server
    ```
2.  **Install the "engines":**
    ```bash
    npm install
    ```
    *(This might take a minute. It's downloading all the libraries the app needs.)*

3.  **Setup your Settings (.env file):**
    *   In the `server` folder, create a new file named exactly `.env`.
    *   Open it with Notepad or any text editor and paste this:
    ```env
    DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/project_management
    JWT_SECRET=supersecretkey123
    
    # Email settings (Optional)
    SMTP_USER=your_email@gmail.com
    SMTP_PASS=your_app_password
    SENDER_EMAIL=your_email@gmail.com
    ```
    *   **CRITICAL:** Replace `YOUR_PASSWORD` with the password you chose when installing PostgreSQL.

4.  **Prepare the Database Structure:**
    Run this command to set up the tables inside your database:
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```

5.  **Start the Brain!**
    ```bash
    npm run server
    ```
    *You should see a message saying the server is running.*

---

### 5️⃣ Step 5: Setup the User Interface (Client)
This is what you actually see and click on.

1.  **Open a NEW Terminal/CMD window** (Keep the server one running!).
2.  Go back to the project folder, then into the client folder:
    ```bash
    cd project-management/client
    ```
3.  **Install dependencies:**
    ```bash
    npm install
    ```
4.  **Setup settings (.env file):**
    *   In the `client` folder, create a file named `.env`.
    *   Paste this inside:
    ```env
    VITE_BASEURL="http://localhost:5000"
    ```
5.  **Launch the App!**
    ```bash
    npm run dev
    ```
    *The terminal will give you a link (usually `http://localhost:5173`). Click it to open the app!*

---

### ✅ Success!
The app should now be running. You can use the credentials provided at the top of this README to log in.

> 💡 **Pro Tip:** Keep both terminal windows open while using the app. If you close them, the app will stop working!
