# Stay Manager

Stay Manager is a Hostel Management System built using the **PERN Stack (PostgreSQL, Express.js, React, and Node.js)**. It helps manage hostel operations such as student registration, room allocation, and complaint management.

---

## Tech Stack

- React.js
- Node.js
- Express.js
- PostgreSQL
- Docker
- Docker Compose

---

## Prerequisites

Before running the project, make sure you have installed:

- Docker Desktop
- Git

---

## Project Structure

```
stay-manager/
│
├── client/              # React Frontend
├── server/              # Express Backend
├── docker-compose.yml
└── README.md
```

---

## How to Run the Project

### 1. Clone the repository

```bash
git clone <repository-url>
```

### 2. Go to the project folder

```bash
cd stay-manager
```

### 3. Start the application

```bash
docker compose up --build
```

Wait until all the containers are started.

---

## Open the Application

### When running via Docker Compose (Local / Production)
- **Frontend**: `http://localhost` (Port 80) or `http://<EC2_PUBLIC_IP>` (e.g. `http://3.27.209.60`)
- **Backend API**: `http://localhost:3000` (Direct) or `http://localhost/api` (Nginx reverse proxy)

### When running standalone without Docker (Local Development)
- **Frontend**: `http://localhost:5173`
- **Backend**: `http://localhost:3000`

---

## Stop the Application

```bash
docker compose down
```

---

## If You Make Changes (Zero/Minimal Downtime Deployment)

To rebuild and apply updates without stopping existing containers prematurely:

```bash
docker compose up -d --build
```

---

## Technologies Used

- React.js
- Express.js
- Node.js
- PostgreSQL
- Docker
- Docker Compose

---

## Author

**Sharan U**