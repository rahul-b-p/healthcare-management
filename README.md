# 🏥 Healthcare Management Application

A scalable **Node.js + Express + TypeScript** backend service designed for managing healthcare operations including appointments, medical summaries, patient records, and doctor interactions.  
The application uses **MongoDB (Mongoose)** for data persistence, integrates **Socket.IO** for real-time communication, and supports **PDF generation** for reports using **PDFKit**.

---

## 📁 Folder Structure
```

src/
├── config/ # Configuration files (database, environment setup)
├── constants/ # Application constants
├── controllers/ # Route handlers and business logic
├── enums/ # Enumerations used across modules
├── errors/ # Custom error classes and handlers
├── interfaces/ # TypeScript interfaces
├── middlewares/ # Request middlewares (auth, validation, etc.)
├── models/ # Mongoose models and schemas
├── pipelines/ # Aggregation pipelines for MongoDB
├── routes/ # API route definitions
├── schemas/ # Validation schemas (Joi/Zod etc.)
├── services/ # Core business logic and database operations
├── socket/ # Real-time socket.io event handling
├── types/ # Global type definitions
├── utils/ # Utility functions and helpers
├── validations/ # Request validation logic
├── app.ts # Express app configuration
├── server.ts # Application entry point
├── test-app.ts # Test setup and mock environment
tests/ # Unit and integration tests
.env # Environment configuration

````

---

## ⚙️ Environment Configuration

Create a `.env` file in the project root and update the following values:

```env
NODE_ENV=development
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/<database>?retryWrites=true&w=majority
REFRESH_SECRET=<your-refresh-secret>
REFRESH_EXPIRE_IN=3d
ACCESS_SECRET=<your-access-secret>
ACCESS_EXPIRE_IN=1h
HASH_SALT=10
ENCRYPTION_KEY=<your-256-bit-encryption-key>
````

### 🔒 Example `.env`

```env
NODE_ENV=development
MONGO_URI=mongodb+srv://rahulbp_db_user:hospital_app@cluster0.kro4pfi.mongodb.net/?appName=Cluster0
REFRESH_SECRET=cf5fef308037d989cc2158131d2ea244c44b4db74377645578a127c
REFRESH_EXPIRE_IN=3d
ACCESS_SECRET=49bae3965fd11459574a6f0117df2fb6f4ee2665c22897bb32fff5916066f
ACCESS_EXPIRE_IN=1h
HASH_SALT=10
ENCRYPTION_KEY=21d4a759ae76399bdb420a92b72022579ce4d4b35b5eac838f0b96ac805a19db
```

---

## 🧩 Installation

Install project dependencies:

```bash
npm install
```

---

## 🛠️ Build

Compile the TypeScript source to JavaScript:

```bash
npm run build
```

---

## 🚀 Start Application

### Production Mode

```bash
npm run start
```

### Development Mode

```bash
npm run dev
```

---

## 🐳 Docker Support

To run the project using Docker Compose:

```bash
docker compose up
```

> Ensure Docker and Docker Compose are installed on your system.

---

## 📘 API Documentation

This backend provides RESTful API endpoints for managing healthcare operations — including appointments, doctors, patients, medical summaries, and reports.

### 🩺 **Appointment**

API endpoints for managing appointments.

| Method    | Endpoint                                      | Description                            |
| --------- | --------------------------------------------- | -------------------------------------- |
| **POST**  | `/api/appointment`                            | Create a new appointment               |
| **PATCH** | `/api/appointment/{appointmentId}`            | Update an appointment                  |
| **GET**   | `/api/appointment/{appointmentId}`            | Get appointment by ID                  |
| **GET**   | `/api/appointment/doctor/me`                  | Get appointments for logged-in doctor  |
| **GET**   | `/api/appointment/patient/me`                 | Get appointments for logged-in patient |
| **GET**   | `/api/appointment/admin/all`                  | Get all appointments (Admin only)      |
| **GET**   | `/api/appointment/{appointmentId}/audit-logs` | Get audit logs for an appointment      |

---

### 🧑‍⚕️ **Doctor**

APIs for managing doctor profiles.

| Method     | Endpoint                          | Description                        |
| ---------- | --------------------------------- | ---------------------------------- |
| **POST**   | `/api/doctor/profile`             | Create doctor profile              |
| **GET**    | `/api/doctor`                     | Get all doctors                    |
| **GET**    | `/api/doctor/profile/{profileId}` | Get doctor by profile ID           |
| **PATCH**  | `/api/doctor/profile/{profileId}` | Update doctor profile              |
| **DELETE** | `/api/doctor/profile/{profileId}` | Delete doctor profile (Admin only) |
| **GET**    | `/api/doctor/user/{userId}`       | Get doctor profile by user ID      |
| **GET**    | `/api/doctor/me`                  | Get my doctor profile              |

---

### 🩹 **Medical Summary**

API endpoints for managing medical summaries.

| Method     | Endpoint                                             | Description                                       |
| ---------- | ---------------------------------------------------- | ------------------------------------------------- |
| **POST**   | `/api/medical-summary`                               | Create a new medical summary                      |
| **PATCH**  | `/api/medical-summary/{medicalSummaryId}`            | Update a medical summary                          |
| **GET**    | `/api/medical-summary/{medicalSummaryId}`            | Get medical summary by ID                         |
| **DELETE** | `/api/medical-summary/{medicalSummaryId}`            | Delete a medical summary                          |
| **GET**    | `/api/medical-summary/doctor/me`                     | Get medical summaries created by logged-in doctor |
| **GET**    | `/api/medical-summary/patient/me`                    | Get medical summaries for logged-in patient       |
| **GET**    | `/api/medical-summary/admin/all`                     | Get all medical summaries (Admin only)            |
| **GET**    | `/api/medical-summary/{medicalSummaryId}/audit-logs` | Get audit logs for a medical summary              |

---

### 👩‍🧍‍♂️ **Patient**

API endpoints for managing patient profiles.

| Method     | Endpoint                              | Description                                   |
| ---------- | ------------------------------------- | --------------------------------------------- |
| **POST**   | `/api/patient`                        | Create a new patient profile                  |
| **GET**    | `/api/patient`                        | Get all patient profiles                      |
| **GET**    | `/api/patient/assigned`               | Get patients assigned to the logged-in doctor |
| **GET**    | `/api/patient/me`                     | Get the logged-in patient’s own profile       |
| **GET**    | `/api/patient/{patientId}`            | Get a patient profile by ID                   |
| **PATCH**  | `/api/patient/{patientId}`            | Update a patient profile                      |
| **DELETE** | `/api/patient/{patientId}`            | Delete a patient profile                      |
| **GET**    | `/api/patient/{patientId}/audit-logs` | Get audit logs for a patient                  |

---

### 📊 **Report**

API endpoints for generating reports.

| Method  | Endpoint                            | Description               |
| ------- | ----------------------------------- | ------------------------- |
| **GET** | `/api/report/visit/{appointmentId}` | Generate visit report PDF |

---

### 🔐 **Authentication**

Endpoints for user authentication and authorization.

| Method   | Endpoint            | Description               |
| -------- | ------------------- | ------------------------- |
| **POST** | `/api/auth/sign-up` | Create a new user account |
| **POST** | `/api/auth/sign-in` | User login                |
| **POST** | `/api/auth/refresh` | Refresh access token      |

---

### 📄 **Detailed API Specification**

A full, interactive API specification (including request/response schemas, authentication requirements, and examples) is available at:

```
http://localhost:{PORT}/api-docs
```

It includes:

- Full DTO schemas
- Request/response structure
- Authenticated endpoints

---

## 🧠 Tech Stack

| Layer            | Technology Used    |
| ---------------- | ------------------ |
| Runtime          | Node.js            |
| Framework        | Express.js         |
| Language         | TypeScript         |
| Database         | MongoDB (Mongoose) |
| Real-time        | Socket.IO          |
| PDF Generation   | PDFKit             |
| API Docs         | Swagger (OpenAPI)  |
| Containerization | Docker             |
| Testing          | Jest               |

---

## 🧩 Logging

- In **non-production environments**, detailed debug logs will be visible in the console.
- In **production**, logs are optimized and minimal.

---

## 🧑‍💻 Author

**Rahul B P**
_Backend Developer_

---
