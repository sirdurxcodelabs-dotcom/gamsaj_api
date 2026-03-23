# Backend API

Node.js backend with MongoDB, Cloudinary, Email, and Authentication.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file from `.env.example`:
```bash
cp .env.example .env
```

3. Update `.env` with your credentials:
   - MongoDB URI
   - JWT Secret
   - Cloudinary credentials
   - Email credentials

4. Start the server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `GET /api/auth/verify/:token` - Verify email
- `POST /api/auth/forgot-password` - Request password reset
- `PUT /api/auth/reset-password/:token` - Reset password

### Users
- `GET /api/users` - Get all users (Admin only)
- `GET /api/users/:id` - Get single user (Protected)
- `PUT /api/users/:id` - Update user (Protected)
- `DELETE /api/users/:id` - Delete user (Admin only)

### Upload
- `POST /api/upload/single` - Upload single file (Protected)
- `POST /api/upload/multiple` - Upload multiple files, max 10 (Protected)

## Features

- JWT Authentication
- Email verification
- Password reset
- Role-based access control (User/Admin)
- File upload to Cloudinary (single & multiple)
- Input validation
- Error handling
