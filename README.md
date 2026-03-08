
# Converge Frontend

Enterprise SaaS Communication Platform – Frontend Application

---

## Overview

**Converge Frontend** is the user interface layer of the Converge SaaS platform.
It provides a scalable, modern, and responsive interface for managing customer communication, chat operations, company structures, and platform governance.

The frontend is built with **React.js** and **Material UI (MUI)** to deliver a consistent and enterprise-grade user experience.

This application interacts with backend APIs and WebSocket services to support real-time communication and platform management.

---

## Features

* Multi-role SaaS Dashboard
* Real-time Chat Console
* AI + Agent Hybrid Chat Interface
* User & Role Management
* Company & Website Management
* Department & Supervisor Mapping
* QA Chat Rating System
* Reports & Analytics
* Chat Widget Configuration
* License Based Authentication
* Secure WebSocket Communication

---

## Tech Stack

### Core Technologies

* React.js
* Material UI (MUI)
* JavaScript / ES6+
* React Router
* Axios
* WebSocket

### UI Framework

Material UI is used to implement:

* Responsive layouts
* Data tables
* Forms & inputs
* Dialogs & modals
* Navigation drawers
* Theming system

---

## Project Structure

```bash
src/
│
├── assets/            # Images, icons, fonts
│
├── components/        # Reusable UI components
│   ├── common
│   ├── layout
│   └── chat
│
├── pages/             # Application pages
│   ├── dashboard
│   ├── authentication
│   ├── companies
│   ├── users
│   ├── departments
│   └── reports
│
├── contexts/          # Global state management
│   ├── authContext
│   └── socketContext
│
├── services/          # API and socket services
│   ├── api
│   └── websocket
│
├── routes/            # Application routing
│
├── utils/             # Utility functions
│
└── config/            # Environment and configuration
```

---

## Getting Started

### 1️⃣ Clone the repository

```bash
git clone https://github.com/A-hasan-code/Converge.git
```

### 2️⃣ Navigate to the project

```bash
cd Converge
```

### 3️⃣ Install dependencies

```bash
npm install
```

### 4️⃣ Run development server

```bash
npm run dev
```

The application will start on:

```
http://localhost:5173
```

---

## Environment Variables

Create a `.env` file in the root directory.

Example configuration:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SOCKET_URL=ws://localhost:5000
```

---

## Authentication Flow

The system uses **license-based authentication**.

Login requires:

* Email
* Password
* Valid License Key

License validation occurs during:

* Login session
* API requests
* WebSocket connection

Users without valid licenses cannot access the system.

---

## Real-Time Communication

The platform uses **WebSocket connections** to support real-time chat.

### Chat Flow

```
Visitor
   ↓
Chat Widget
   ↓
WebSocket Server
   ↓
Routing Engine
   ↓
AI Bot / Assigned Agent
```

Features include:

* Live chat updates
* Typing indicators
* Agent takeover
* Supervisor whisper
* Chat history synchronization

---

## Development Guidelines

To maintain consistency across the application:

* Follow component-based architecture
* Use reusable Material UI components
* Keep API calls inside service layer
* Avoid business logic inside UI components
* Use environment variables for external configurations

---

## Future Enhancements

Planned improvements include:

* Advanced analytics dashboards
* AI-assisted chat responses
* Multi-language support
* Mobile agent interface
* Improved reporting modules

---

## License

This repository is part of the **Converge SaaS Platform** and is intended for internal development and authorized use only.

---

## Maintained By

Pixalbotics Development Team
