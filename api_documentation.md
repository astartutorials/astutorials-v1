# A-Star Tutorials — API Documentation

> **Base URL:** `/api` (Next.js App Router — deployed at your domain)
>
> All requests and responses use `Content-Type: application/json`.
> Protected admin endpoints require an active session cookie (set automatically by Supabase SSR).

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Tutorials (Public)](#2-tutorials-public)
3. [Bookings (Group Tutorials)](#3-bookings-group-tutorials)
4. [Private Tutorials](#4-private-tutorials)
5. [Payments](#5-payments)
6. [Feedback](#6-feedback)
7. [Careers](#7-careers)
8. [Admin — Dashboard](#8-admin--dashboard)
9. [Admin — Tutorial Management](#9-admin--tutorial-management)
10. [Admin — Attendance](#10-admin--attendance)
11. [Admin — Payments](#11-admin--payments)
12. [Admin — Feedback Management](#12-admin--feedback-management)
13. [Admin — Careers Management](#13-admin--careers-management)
14. [Admin — Settings & Security](#14-admin--settings--security)

---

## 1. Authentication

### `POST /auth/admin/login` — `[x] Implemented`

Authenticate an admin user and return a session token.

**Auth Required:** No

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
    "email": "admin@example.com",
    "name": "string",
    "role": "admin | super_admin"
  }
}
```

---

### `POST /auth/admin/logout` — `[x] Implemented`

Invalidate the current admin session token.

**Auth Required:** Yes

**Response `200`:**

```json
{
  "message": "Logged out successfully"
}
```

---

## 2. Tutorials (Public)

Endpoints used by the public `/tutorials` page to display available group tutorials.

---

### `GET /tutorials` — `[ ] Not yet implemented`

Retrieve a list of all available group tutorials.

**Auth Required:** No

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | `string` | Filter by status: `active`, `full`, `completed` |
| `day` | `string` | Filter by day: `Mondays`, `Tuesdays`, etc. |

**Response `200`:**

```json
{
  "tutorials": [
    {
      "id": "string",
      "code": "COS 201",
      "title": "Data Structures",
      "teacher": "John Adeyemi",
      "description": "string",
      "day": "Thursdays",
      "time": "8:00 PM",
      "seatsTotal": 40,
      "seatsRemaining": 13,
      "price": "1k",
      "colorScheme": "blue | orange | green | purple | pink | yellow",
      "status": "active | full | completed"
    }
  ]
}
```

> **Color Schemes:** `blue`, `orange`, `green`, `purple`, `pink`, `yellow`
> **Seat Status Logic (frontend handles display):**
>
> - `< 75%` filled → Normal (gray)
> - `75–89%` filled → Urgent / "HURRY! FILLING!" (orange)
> - `≥ 90%` filled → Critical / "ALMOST FULL" (red)

---

### `GET /tutorials/:id` — `[ ] Not yet implemented`

Retrieve details of a single group tutorial.

**Auth Required:** No

**Response `200`:**

```json
{
  "id": "string",
  "code": "COS 201",
  "title": "Data Structures",
  "teacher": "John Adeyemi",
  "description": "string",
  "day": "Thursdays",
  "time": "8:00 PM",
  "seatsTotal": 40,
  "seatsRemaining": 13,
  "price": "1k",
  "colorScheme": "blue",
  "status": "active"
}
```

---

## 3. Bookings (Group Tutorials)

Endpoints for the multi-step group tutorial booking flow (`/tutorials/:id/book`).

---

### `POST /bookings/group` — `[ ] Not yet implemented`

Book a student into a group tutorial session. Called after collecting student info and completing payment via Paystack.

**Auth Required:** No

**Request Body:**

```json
{
  "tutorialId": "string",
  "student": {
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "courseOfStudy": "string",
    "studentId": "string"
  },
  "paymentReference": "string"
}
```

**Response `201`:**

```json
{
  "bookingId": "string",
  "tutorialId": "string",
  "studentName": "string",
  "status": "confirmed",
  "seatsRemaining": 12,
  "message": "Booking confirmed"
}
```

**Notes:**

- `seatsRemaining` must never go below `0` — handle race conditions server-side.
- Booking is only confirmed after payment verification.

---

### `GET /bookings/:bookingId` — `[ ] Not yet implemented`

Retrieve a specific booking by ID (e.g. for the success confirmation screen).

**Auth Required:** No

**Response `200`:**

```json
{
  "bookingId": "string",
  "tutorial": {
    "code": "COS 201",
    "title": "Data Structures",
    "teacher": "John Adeyemi",
    "day": "Thursdays",
    "time": "8:00 PM"
  },
  "student": {
    "fullName": "string",
    "email": "string"
  },
  "amountPaid": 1000,
  "bookedAt": "ISO 8601 timestamp"
}
```

---

## 4. Private Tutorials

Endpoints for the private tutorial booking request flow (accessed via `/tutorials` → Private toggle).

---

### `POST /private-tutorials/request` — `[ ] Not yet implemented`

Submit a request / inquiry for a private tutorial session.

**Auth Required:** No

**Request Body:**

```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "subject": "string",
  "preferredDay": "string",
  "preferredTime": "string",
  "message": "string"
}
```

**Response `201`:**

```json
{
  "requestId": "string",
  "message": "Your request has been received. We'll contact you shortly."
}
```

---

## 5. Payments

Endpoints for payment processing and verification. The frontend uses **Paystack** as the payment gateway.

---

### `POST /payments/initialize` — `[ ] Not yet implemented`

Initialize a Paystack payment transaction and get a redirect URL.

**Auth Required:** No

**Request Body:**

```json
{
  "email": "string",
  "amount": 1000,
  "tutorialId": "string",
  "metadata": {
    "studentName": "string",
    "studentId": "string"
  }
}
```

**Response `200`:**

```json
{
  "authorizationUrl": "https://checkout.paystack.com/...",
  "reference": "string",
  "accessCode": "string"
}
```

---

### `POST /payments/verify` — `[ ] Not yet implemented`

Verify a completed payment using the Paystack reference.

**Auth Required:** No

**Request Body:**

```json
{
  "reference": "string"
}
```

**Response `200`:**

```json
{
  "status": "success | failed | pending",
  "amount": 1000,
  "currency": "NGN",
  "paidAt": "ISO 8601 timestamp",
  "reference": "string"
}
```

---

## 6. Feedback

Endpoint for submitting post-session student feedback from the `/feedback` page.

---

### `POST /feedback` — `[ ] Not yet implemented`

Submit a student's feedback for a tutorial session.

**Auth Required:** No

**Request Body:**

```json
{
  "tutorialId": "string",
  "bookingId": "string",
  "rating": 5,
  "comment": "string",
  "sessionType": "group | private"
}
```

**Response `201`:**

```json
{
  "message": "Thank you for your feedback!"
}
```

---

## 7. Careers

Endpoints for the public `/careers` page.

---

### `GET /careers` — `[ ] Not yet implemented`

Retrieve all active job openings.

**Auth Required:** No

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `category` | `string` | Filter by category: `Tutoring`, `Marketing`, `Operations`, etc. |
| `type` | `string` | Filter by type: `Full-time`, `Part-time`, `Contract`, `Internship` |

**Response `200`:**

```json
{
  "roles": [
    {
      "id": "string",
      "title": "Math Tutor (High School Level)",
      "category": "Tutoring",
      "description": "string",
      "type": "Part-time",
      "location": "100% Remote",
      "applicationLink": "https://forms.google.com/...",
      "postedDate": "ISO 8601 timestamp",
      "status": "active | draft"
    }
  ]
}
```

---

## 8. Admin — Dashboard

Endpoint that powers the stats shown at the top of `/admin/dashboard`.

**All Admin endpoints require:** `Authorization: Bearer <token>`

---

### `GET /admin/dashboard/stats` — `[ ] Not yet implemented`

Retrieve key metric stats for the admin dashboard overview.

**Response `200`:**

```json
{
  "totalRevenue": 450000,
  "revenueGrowthPercent": 12.5,
  "totalStudents": 156,
  "studentGrowthPercent": 8.2,
  "activeTutorials": 24,
  "upcomingTutorials": 8,
  "avgRating": 4.8,
  "pendingPayments": 3
}
```

---

### `GET /admin/dashboard/upcoming-tutorials` — `[ ] Not yet implemented`

Retrieve the upcoming tutorials list shown on the admin dashboard.

**Response `200`:**

```json
{
  "tutorials": [
    {
      "id": "string",
      "code": "CALC-101",
      "title": "Advanced Calculus",
      "date": "Oct 25",
      "time": "2:00 PM",
      "studentCount": 28
    }
  ]
}
```

---

### `GET /admin/dashboard/recent-feedback` — `[ ] Not yet implemented`

Retrieve recent student feedback for the admin dashboard feed.

**Response `200`:**

```json
{
  "feedback": [
    {
      "studentName": "string",
      "tutorialTitle": "string",
      "rating": 5,
      "submittedAt": "ISO 8601 timestamp"
    }
  ]
}
```

---

## 9. Admin — Tutorial Management

Endpoints for managing tutorials from `/admin/tutorials` and the "Create Tutorial" modal.

---

### `GET /admin/tutorials` — `[ ] Not yet implemented`

Retrieve all tutorials (all statuses) for the admin management table.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | `string` | `scheduled`, `pending`, `completed` |
| `search` | `string` | Search by course code or title |
| `page` | `number` | Page number for pagination |
| `limit` | `number` | Items per page (default: 10) |

**Response `200`:**

```json
{
  "tutorials": [
    {
      "id": "string",
      "code": "CS-101",
      "title": "Introduction to Algorithms",
      "venue": "Lab A",
      "date": "Oct 26, 2023",
      "time": "10:00 AM",
      "status": "scheduled | pending | completed",
      "tutorId": "string"
    }
  ],
  "total": 24,
  "page": 1,
  "limit": 10
}
```

---

### `POST /admin/tutorials` — `[ ] Not yet implemented`

Create a new tutorial session.

**Request Body:**

```json
{
  "code": "MATH101",
  "title": "Advanced Calculus",
  "topics": "string",
  "date": "2023-10-25",
  "time": "14:00",
  "availableSlots": 20,
  "pricePerStudent": 1000,
  "tutorId": "string",
  "isPublic": true,
  "materials": ["file_url_1", "file_url_2"]
}
```

**Response `201`:**

```json
{
  "id": "string",
  "message": "Tutorial created successfully"
}
```

---

### `GET /admin/tutorials/:id` — `[ ] Not yet implemented`

Retrieve a single tutorial's full details.

**Response `200`:**

```json
{
  "id": "string",
  "code": "string",
  "title": "string",
  "topics": "string",
  "date": "string",
  "time": "string",
  "availableSlots": 20,
  "bookedCount": 15,
  "pricePerStudent": 1000,
  "tutorId": "string",
  "isPublic": true,
  "status": "scheduled | pending | completed"
}
```

---

### `PUT /admin/tutorials/:id` — `[ ] Not yet implemented`

Update an existing tutorial's details.

**Request Body:** Same fields as `POST /admin/tutorials` (all optional).

**Response `200`:**

```json
{
  "id": "string",
  "message": "Tutorial updated successfully"
}
```

---

### `DELETE /admin/tutorials/:id` — `[ ] Not yet implemented`

Delete a tutorial session.

**Response `200`:**

```json
{
  "message": "Tutorial deleted successfully"
}
```

---

## 10. Admin — Attendance

Endpoints for the tutorial attendance page `/admin/tutorials/:id`.

---

### `GET /admin/tutorials/:id/students` — `[ ] Not yet implemented`

Retrieve the list of registered students for a specific tutorial session.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `search` | `string` | Search by name or phone |
| `page` | `number` | Page number |
| `limit` | `number` | Items per page (default: 5) |

**Response `200`:**

```json
{
  "tutorialId": "string",
  "tutorialTitle": "string",
  "capacity": 30,
  "bookedCount": 24,
  "students": [
    {
      "id": "string",
      "name": "John Smith",
      "phone": "+1 (555) 123-4567",
      "paymentStatus": "paid | pending | failed",
      "registrationDate": "Oct 20, 2023",
      "attended": false
    }
  ],
  "total": 24,
  "page": 1
}
```

---

### `PATCH /admin/tutorials/:id/students/:studentId/attendance` — `[ ] Not yet implemented`

Toggle / update attendance status for a student in a tutorial.

**Request Body:**

```json
{
  "attended": true
}
```

**Response `200`:**

```json
{
  "studentId": "string",
  "attended": true,
  "message": "Attendance updated"
}
```

---

### `GET /admin/tutorials/:id/students/export` — `[ ] Not yet implemented`

Export the attendance list as a CSV / PDF file for the tutor.

**Response `200`:**
Returns a file download (CSV or PDF).

---

## 11. Admin — Payments

Endpoints for the `/admin/payments` page.

---

### `GET /admin/payments` — `[ ] Not yet implemented`

Retrieve all payment transactions with filtering.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | `string` | `paid`, `pending`, `failed` |
| `search` | `string` | Search by student name or tutorial |
| `page` | `number` | Page number |
| `limit` | `number` | Items per page (default: 10) |

**Response `200`:**

```json
{
  "transactions": [
    {
      "id": "string",
      "studentName": "Sarah Jenkins",
      "tutorialTitle": "Advanced Calculus Review",
      "amount": 15000,
      "method": "card | transfer | mobile",
      "status": "paid | pending | failed",
      "date": "ISO 8601 timestamp"
    }
  ],
  "stats": {
    "totalRevenue": 60000,
    "pendingCount": 1,
    "completedCount": 3,
    "failedCount": 1
  },
  "total": 24,
  "page": 1
}
```

---

### `GET /admin/payments/export` — `[ ] Not yet implemented`

Export payment transactions as a CSV file.

**Response `200`:**
Returns a file download (CSV).

---

## 12. Admin — Feedback Management

Endpoints for the `/admin/feedback` page.

---

### `GET /admin/feedback` — `[ ] Not yet implemented`

Retrieve all student feedback with filters.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `sessionType` | `string` | `group`, `private` |
| `search` | `string` | Search by student name or tutorial |

**Response `200`:**

```json
{
  "feedback": [
    {
      "id": "string",
      "studentName": "Sarah Jenkins",
      "tutorialName": "Advanced Calculus Review",
      "sessionType": "group | private",
      "rating": 5.0,
      "comment": "string",
      "replied": false,
      "submittedAt": "ISO 8601 timestamp"
    }
  ]
}
```

---

### `POST /admin/feedback/:id/reply` — `[ ] Not yet implemented`

Send an admin reply to a student's feedback.

**Request Body:**

```json
{
  "replyMessage": "string"
}
```

**Response `200`:**

```json
{
  "message": "Reply sent successfully"
}
```

---

## 13. Admin — Careers Management

Endpoints for the `/admin/careers` page and "Add New Role" modal.

---

### `GET /admin/careers` — `[ ] Not yet implemented`

Retrieve all career listings (all statuses).

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | `string` | `active`, `draft` |
| `search` | `string` | Search by title, department, or job ID |
| `page` | `number` | Page number |
| `limit` | `number` | Items per page |

**Response `200`:**

```json
{
  "roles": [
    {
      "id": "string",
      "jobId": "#DEV-204",
      "title": "Senior Frontend Developer",
      "department": "Engineering",
      "location": "Remote (US)",
      "type": "Full-time | Part-time | Contract | Internship",
      "description": "string",
      "applicationLink": "https://forms.google.com/...",
      "postedDate": "ISO 8601 timestamp",
      "status": "active | draft"
    }
  ],
  "total": 12,
  "page": 1
}
```

---

### `POST /admin/careers` — `[ ] Not yet implemented`

Create / publish a new career role.

**Request Body:**

```json
{
  "roleTitle": "string",
  "department": "string",
  "jobType": "Full-time | Part-time | Contract | Internship",
  "location": "string",
  "description": "string",
  "applicationLink": "https://...",
  "status": "active | draft"
}
```

**Response `201`:**

```json
{
  "id": "string",
  "jobId": "#DEV-205",
  "message": "Career role published successfully"
}
```

---

### `PUT /admin/careers/:id` — `[ ] Not yet implemented`

Update an existing career role.

**Request Body:** Same fields as `POST /admin/careers` (all optional).

**Response `200`:**

```json
{
  "message": "Career role updated successfully"
}
```

---

### `DELETE /admin/careers/:id` — `[ ] Not yet implemented`

Delete / remove a career role.

**Response `200`:**

```json
{
  "message": "Career role deleted successfully"
}
```

---

## 14. Admin — Settings & Security

Endpoints for the `/admin/settings` page (Profile, Tutorial Config, Notifications, Payments, Security tabs).

---

### `GET /admin/settings` — `[ ] Not yet implemented`

Retrieve the current admin settings configuration.

**Response `200`:**

```json
{
  "profile": {
    "name": "Admin User",
    "email": "admin@astar-tutorials.com",
    "phone": "+234 123 456 7890"
  },
  "tutorials": {
    "groupPrice": 15000,
    "privatePrice": 25000,
    "sessionDurationMinutes": 120,
    "maxStudentsPerGroup": 30,
    "bookingDeadlineHours": 24
  },
  "notifications": {
    "emailEnabled": true,
    "smsEnabled": false,
    "alertNewBookings": true,
    "alertCancellations": true,
    "alertFeedback": true,
    "digestFrequency": "real-time | daily | weekly"
  },
  "payments": {
    "gateway": "flutterwave | paystack | stripe",
    "currency": "NGN | USD | GBP",
    "taxRatePercent": 0
  }
}
```

---

### `PUT /admin/settings` — `[ ] Not yet implemented`

Save / update admin settings.

**Request Body:** Any subset of the fields from `GET /admin/settings`.

**Response `200`:**

```json
{
  "message": "Settings saved successfully"
}
```

---

### `PUT /admin/settings/profile` — `[ ] Not yet implemented`

Update the admin's profile information.

**Request Body:**

```json
{
  "name": "string",
  "email": "string",
  "phone": "string"
}
```

**Response `200`:**

```json
{
  "message": "Profile updated successfully"
}
```

---

### `PUT /admin/auth/change-password` — `[ ] Not yet implemented`

Change the current admin's password.

**Request Body:**

```json
{
  "currentPassword": "string",
  "newPassword": "string",
  "confirmPassword": "string"
}
```

**Response `200`:**

```json
{
  "message": "Password changed successfully"
}
```

---

### `POST /admin/auth/register` — `[ ] Not yet implemented`

Register a new admin user. Only callable by a Super Admin.

**Request Body:**

```json
{
  "fullName": "string",
  "email": "string",
  "phone": "string",
  "initialPassword": "string",
  "role": "admin | super_admin"
}
```

**Response `201`:**

```json
{
  "adminId": "string",
  "message": "New admin registered successfully"
}
```

---

### `GET /admin/activity-logs` — `[ ] Not yet implemented`

Retrieve admin activity logs shown in the Security tab.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `page` | `number` | Page number |
| `limit` | `number` | Items per page |

**Response `200`:**

```json
{
  "logs": [
    {
      "id": "string",
      "user": "Admin User",
      "action": "Login | Updated Tutorial | Changed Settings | ...",
      "ipAddress": "192.168.1.1",
      "timestamp": "ISO 8601 timestamp",
      "status": "success | failed"
    }
  ],
  "total": 50,
  "page": 1
}
```

---

## Error Responses

All endpoints follow a consistent error format:

```json
{
  "error": "string",
  "message": "Human-readable error description",
  "statusCode": 400
}
```

| Status Code | Meaning                                 |
| ----------- | --------------------------------------- |
| `400`       | Bad Request — invalid or missing fields |
| `401`       | Unauthorized — missing or invalid token |
| `403`       | Forbidden — insufficient permissions    |
| `404`       | Not Found — resource does not exist     |
| `409`       | Conflict — e.g. no seats remaining      |
| `500`       | Internal Server Error                   |

---

## Data Models Summary

### Tutorial Object

| Field            | Type     | Description                                                     |
| ---------------- | -------- | --------------------------------------------------------------- |
| `id`             | `string` | Unique identifier                                               |
| `code`           | `string` | Course code (e.g. `COS 201`)                                    |
| `title`          | `string` | Tutorial title                                                  |
| `teacher`        | `string` | Tutor name                                                      |
| `description`    | `string` | Course description                                              |
| `day`            | `string` | Day of week (e.g. `Thursdays`)                                  |
| `time`           | `string` | Time string (e.g. `8:00 PM`)                                    |
| `seatsTotal`     | `number` | Total available seats                                           |
| `seatsRemaining` | `number` | Seats currently available                                       |
| `price`          | `string` | Display-friendly price (e.g. `1k`)                              |
| `colorScheme`    | `string` | UI color: `blue`, `orange`, `green`, `purple`, `pink`, `yellow` |
| `status`         | `string` | `active`, `full`, `completed`                                   |

### Booking Object

| Field           | Type      | Description                 |
| --------------- | --------- | --------------------------- |
| `id`            | `string`  | Booking ID                  |
| `tutorialId`    | `string`  | Related tutorial            |
| `studentName`   | `string`  | Full name                   |
| `email`         | `string`  | Student email               |
| `phone`         | `string`  | Student phone               |
| `courseOfStudy` | `string`  | Student's course            |
| `studentId`     | `string`  | Matric / student ID         |
| `paymentStatus` | `string`  | `paid`, `pending`, `failed` |
| `attended`      | `boolean` | Attendance record           |
| `bookedAt`      | `string`  | ISO 8601 timestamp          |

### Career Role Object

| Field             | Type     | Description                                        |
| ----------------- | -------- | -------------------------------------------------- |
| `id`              | `string` | Unique ID                                          |
| `jobId`           | `string` | System-generated job code (e.g. `#DEV-204`)        |
| `title`           | `string` | Role title                                         |
| `department`      | `string` | Department                                         |
| `location`        | `string` | Location or Remote                                 |
| `type`            | `string` | `Full-time`, `Part-time`, `Contract`, `Internship` |
| `description`     | `string` | Job description                                    |
| `applicationLink` | `string` | External application URL                           |
| `status`          | `string` | `active`, `draft`                                  |
