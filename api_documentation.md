# A-Star Tutorials — API Documentation

> **Base URL:** `/api` (Next.js App Router)
>
> All requests and responses use `Content-Type: application/json`.
> Protected admin endpoints require an active session cookie (set via Supabase SSR).

---

## 🚀 Core Platform Flow (How it Connects)

The platform is designed as a continuous loop:

1.  **Admin Creates (`Admin → User`)**: An admin creates a tutorial via `POST /admin/tutorials`. This data is stored and immediately becomes visible to students on the public site.
2.  **User Views & Enrolls (`User → Payment`)**: Students fetch available sessions via `GET /tutorials`. When they choose one, they are redirected to a secure payment flow.
3.  **Booking Finalized (`Payment → DB`)**: Upon successful payment, `POST /bookings/group` is called. This secures the seat and updates the tutorial's `availableSlots`.
4.  **Admin Manages (`User → Admin`)**: The new student appears in the admin's attendance list (`GET /admin/tutorials/:id/students`) for that session.
5.  **Feedback Loop (`Loop Starts Over`)**: After the session, the student submits feedback via `POST /feedback`, which is then reviewable by the admin.

---

## 1. Authentication

### `POST /auth/admin/login` — `[x] Implemented`

Authenticate an admin user and set a session cookie.

**Request Body:**

```json
{
  "email": "admin@example.com",
  "password": "string"
}
```

**Response `200`:**

```json
{
  "admin": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "admin | super_admin"
  }
}
```

---

### `POST /auth/admin/logout` — `[x] Implemented`

Invalidate the current admin session and clear the cookie.

---

## 2. Tutorials & Admin Management

### `GET /tutorials` — `[x] Implemented`

**Used by: Students Page**
Retrieve active tutorials.

**Response `200`:**

```json
{
  "tutorials": [
    {
      "id": "string",
      "code": "COS 201",
      "title": "Data Structures",
      "teacher": "John Adeyemi",
      "description": "Master arrays, linked lists, trees...",
      "day": "Thursdays",
      "time": "8:00 PM",
      "seatsTotal": 40,
      "seatsRemaining": 13,
      "price": "1k",
      "colorScheme": "blue"
    }
  ]
}
```

---

### `POST /admin/tutorials` — `[x] Implemented`

**Used by: Create Tutorial Modal**

**Request Body:**

```json
{
  "code": "MATH101",
  "title": "Calculus Review",
  "teacher": "John Adeyemi",
  "description": "Topics: differentiation, integration...",
  "date": "2024-10-15",
  "time": "14:00",
  "capacity": 20,
  "price": 1000,
  "colorScheme": "blue | green | pink | orange | purple | yellow | indigo | teal | red | cyan",
  "status": "active | draft"
}
```

---

### `PUT /admin/tutorials/:id` — `[x] Implemented`

Update tutorial details.

---

## 3. Bookings & Payments

### `POST /bookings/group` — `[ ] Not yet implemented`

**Used by: Personal Info Form (POST-PAYMENT)**

**Request Body:**

```json
{
  "tutorialId": "string",
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+234 800 000 0000",
  "course": "Computer Science",
  "matricId": "19/1234",
  "paymentReference": "paystack_ref_123"
}
```

---

### `GET /admin/tutorials/:id/students` — `[ ] Not yet implemented`

**Used by: Admin Attendance View**

**Response `200`:**

```json
{
  "students": [
    {
      "id": "string",
      "fullName": "Sarah Jenkins",
      "email": "sarah@example.com",
      "phone": "08012345678",
      "course": "Physics",
      "matricId": "20/5678",
      "paymentStatus": "paid",
      "attended": false
    }
  ]
}
```

---

## 4. Careers

### `GET /careers` — `[ ] Not yet implemented`

**Used by: Careers Page**

**Response `200`:**

```json
{
  "jobs": [
    {
      "id": "string",
      "jobId": "#DEV-204",
      "title": "Frontend Developer",
      "category": "Engineering",
      "description": "Build high-quality user experiences...",
      "type": "Full-time",
      "location": "Remote"
    }
  ]
}
```

---

## 5. Feedback

### `POST /feedback` — `[ ] Not yet implemented`

**Used by: Feedback Form**

**Request Body:**

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "tutorialId": "string",
  "rating": 5,
  "feedback": "Great session, very helpful!"
}
```

---

## 6. Settings & Security

### `GET /admin/activity-logs` — `[ ] Not yet implemented`

**Used by: Activity Log Tab**

**Response `200`:**

```json
{
  "logs": [
    {
      "id": "string",
      "adminName": "System",
      "action": "New Admin Registered",
      "target": "sarah@example.com",
      "timestamp": "2 mins ago"
    }
  ]
}
```
