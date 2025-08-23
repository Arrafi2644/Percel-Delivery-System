# Parcel Delivery API
### API Live Link: https://parcel-delivery-api-psi.vercel.app

## Tech Stack
[![Node.js](https://img.shields.io/badge/Node.js-18.x-green)](https://nodejs.org/)  
[![Express](https://img.shields.io/badge/Express-5.x-lightgrey)](https://expressjs.com/)  
[![MongoDB](https://img.shields.io/badge/MongoDB-8.x-green)](https://www.mongodb.com/)  
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)  
[![Zod](https://img.shields.io/badge/Zod-3.22-purple)](https://zod.dev/)  
[![JWT](https://img.shields.io/badge/JWT-Authentication-orange)](https://jwt.io/)  
[![bcryptjs](https://img.shields.io/badge/bcryptjs-Password%20Hashing-yellow)](https://www.npmjs.com/package/bcryptjs)  
[![CORS](https://img.shields.io/badge/CORS-Enabled-brightgreen)](https://www.npmjs.com/package/cors)  
[![ESLint](https://img.shields.io/badge/ESLint-9.x-blueviolet)](https://eslint.org/)  

---

## 🎯 Project Overview

Parcel Delivery API is a **secure, modular, and role-based backend API** for managing parcel deliveries, inspired by services like Pathao Courier or Sundarban.  

The API allows users to:

- Register as **senders** or **receivers**.
- Create, track, and manage parcels.
- View parcel status history and logs.
- Admins can manage users, parcels, and system operations.

---

## 🔐 Features

### Authentication & Authorization
- JWT-based authentication.
- Three user roles: **Admin**, **Sender**, **Receiver**.
- Role-based route protection.

### Parcel Management
- Senders can create, cancel, and view their parcels.
- Receivers can view incoming parcels, confirm deliveries, and see delivery history.
- Admins can manage users and parcels, update statuses, and optionally assign delivery personnel.
- Each parcel includes an **embedded status log** for tracking.

### Validations & Business Rules
- Role-based access control.
- Ownership and status validation.
- Parcel cancellation and delivery rules enforced.
- Blocked users cannot access protected endpoints.

### Additional Features
- Unique tracking ID per parcel (format: `TRK-YYYYMMDD-xxxxxx`).
- Status logs with timestamp, location, status, and notes.
- Modular code structure for easy maintenance.

---

## 🧩 API Endpoints (RESTful)

| Method | Endpoint | Role | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register a new user (sender/receiver) |
| POST | `/auth/login` | Public | Login and receive JWT token |
| POST | `/parcels` | Sender | Create a new parcel |
| GET | `/parcels/me` | Sender/Receiver | View own parcels |
| PATCH | `/parcels/cancel/:id` | Sender | Cancel a parcel if not dispatched |
| GET | `/parcels/:id/status-log` | Sender/Receiver | View parcel status history |
| GET | `/parcels` | Admin | View all parcels with filters |
| PATCH | `/parcels/:id/status` | Admin | Update parcel status |
| GET | `/users` | Admin | List all users |
| PATCH | `/users/:id/block` | Admin | Block or unblock a user |

> Additional endpoints may be added for optional features like delivery assignment or fee calculation.

---

## 📦 Parcel & Status Log Design

**Parcel Model Fields:**
- `trackingId` (unique)
- `senderId`, `receiverId`
- `type`, `weight`, `address`, `fee`, `deliveryDate`
- `statusLogs` (array of objects)
  - `status`
  - `timestamp`
  - `updatedBy` (admin/system)
  - `location` (optional)
  - `note` (optional)
- `isCanceled`, `isBlocked` (boolean flags)

**Valid Status Flow:**  
`Requested → Approved → Dispatched → In Transit → Delivered`

---

## 🏗 Project Structure

```bash
src/
├── modules/
│   ├── auth/
│   ├── user/
│   ├── parcel/       
├── middlewares/
├── config/
├── utils/
├── app.ts
├── server.ts

 ```
## ⚙️ Setup & Installation

Follow these steps to get the Parcel Delivery API up and running locally:

### 1. Clone the repository
```bash
git clone https://github.com/Arrafi2644/Percel-Delivery-System.git
cd parcel-delivery-api
```
### 2. Install dependencies
```bash
npm install
```
### 3. Create environment variables
Create a .env file in the root directory ( you can refer to .env.example):

### 4. Run in development mode
```bash
npm run dev
```
### 5. Build and start the production server
```bash
npm run build
npm start
```
 After running the dev server, your API should be accessible at http://localhost:5000.