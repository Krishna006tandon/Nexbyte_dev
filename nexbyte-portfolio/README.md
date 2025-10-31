# Nexbyte Portfolio & Client Management System

This is a comprehensive full-stack application that serves as a personal portfolio and a client management system. It's designed to showcase projects and skills, while also providing a portal for clients to manage their projects, tasks, and invoices.

## Features

- **Client & Intern Portals:** Separate login and dashboard areas for clients and interns to manage their specific tasks and information.
- **Project & Task Tracking:** Clients can view project progress, and interns can manage their assigned tasks.
- **Invoice & Billing Management:** Functionality for creating, viewing, and managing client bills.
- **Secure Authentication:** Uses JWT (JSON Web Tokens) for secure user authentication and session management.
- **API Security:** Implements rate limiting, CSRF protection with `csurf`, and security headers with `helmet`.
- **3D & Interactive Elements:** Incorporates `three.js` and `@react-three/fiber` for dynamic 3D visuals.
- **Generative AI Integration:** Includes features powered by `@google/generative-ai`.
- **Responsive Design:** Fully responsive front-end that works on all devices.

## Tech Stack

### Frontend
- **Framework:** React.js
- **Routing:** React Router (`react-router-dom`)
- **Styling:** CSS, Bootstrap
- **3D Graphics:** Three.js, React Three Fiber (`@react-three/fiber`, `@react-three/drei`)
- **Charting:** Chart.js (`react-chartjs-2`)
- **API Client:** Axios

### Backend
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), bcryptjs
- **Security:** Helmet, Express Rate Limit, CORS, csurf
- **File Generation:** Puppeteer for PDF generation (likely for invoices)
- **Emailing:** Nodemailer

## Getting Started

To get a local copy up and running, follow these steps.

### Prerequisites

- Node.js (v18 or higher recommended)
- npm
- MongoDB (local installation or a cloud instance like MongoDB Atlas)

### Installation & Setup

1.  **Clone the repository:**
    ```sh
    git clone https://github.com/your_username/your_repository.git
    cd your_repository
    ```

2.  **Install root dependencies:**
    *(There may be dependencies in the root `package.json` for orchestration)*
    ```sh
    npm install
    ```

3.  **Install portfolio/app dependencies:**
    ```sh
    cd nexbyte-portfolio
    npm install
    ```

4.  **Set up environment variables:**
    Create a `.env` file inside the `nexbyte-portfolio/api` directory. This file is crucial for storing sensitive information like your database connection string and JWT secret.

    ```env
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    EMAIL_USER=your_email@example.com
    EMAIL_PASS=your_email_password
    ```

### Running the Application

The project includes a root-level script to start both the backend API and the frontend React app concurrently.

1.  **Navigate to the project root directory.**
2.  **Run the start script:**
    ```sh
    node start-servers.js
    ```
    This will typically:
    - Start the Express API server (usually on a port like 3001 or 5000).
    - Start the React development server (on port 3000).

## Seeding the Database

You can populate the database with initial data using the seed script.
*Make sure your API server is running before executing this command.*

```sh
npm run seed
```

## Deployment

The project is configured for deployment on [Vercel](https://vercel.com/). The `vercel.json` file in the `nexbyte-portfolio` directory contains the necessary configuration, including build settings and serverless function rewrites for the Express API.

To deploy, you can use the Vercel CLI or connect your Git repository directly to your Vercel account.
