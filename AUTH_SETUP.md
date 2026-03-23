# Authentication & Authorization Setup

This document explains the authentication and authorization system implemented in the BBCC API.

## Overview

The API uses **JWT (JSON Web Tokens)** for authentication with the following features:

- **Access Tokens**: Short-lived (15 minutes) for API access
- **Refresh Tokens**: Long-lived (7 days) for obtaining new access tokens
- **Role-Based Access Control (RBAC)**: Two roles - `admin` and `user`
- **Password Hashing**: Argon2 for secure password storage
- **Protected Routes**: Authentication and authorization middleware

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Authentication Flow                   │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  1. Register/Login                                        │
│     ↓                                                     │
│  2. Receive Access Token + Refresh Token                 │
│     ↓                                                     │
│  3. Use Access Token for API requests                    │
│     ↓                                                     │
│  4. When Access Token expires (15 min)                   │
│     ↓                                                     │
│  5. Use Refresh Token to get new Access Token            │
│     ↓                                                     │
│  6. Continue using API                                    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

## User Roles

### Admin
- Full access to all resources
- Can create, update, delete players, matches, grounds, etc.
- Can manage other users

### User
- Read access to most resources
- Limited write access
- Cannot delete resources

## API Endpoints

### Public Endpoints (No Authentication Required)

#### Register
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

**Response:** Same as register

#### Refresh Token
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Protected Endpoints (Authentication Required)

All protected endpoints require the `Authorization` header:
```
Authorization: Bearer <access_token>
```

#### Get Current User
```http
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

#### Update Profile
```http
PUT /api/v1/auth/profile
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "newemail@example.com"
}
```

#### Change Password
```http
PUT /api/v1/auth/password
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

## Protected Resources

### Players API
- **GET** `/api/v1/players` - All authenticated users
- **GET** `/api/v1/players/:id` - All authenticated users
- **POST** `/api/v1/players` - **Admin only**
- **PUT** `/api/v1/players/:id` - **Admin only**
- **DELETE** `/api/v1/players/:id` - **Admin only**

## Setting Up the First Admin User

### Method 1: Using the Script (Recommended)

Run the create admin script:

```bash
npm run create-admin
```

By default, it creates an admin with:
- Email: `admin@bbcc.com`
- Password: `admin123456`

To customize, set environment variables:

```bash
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpassword ADMIN_NAME="Your Name" npm run create-admin
```

### Method 2: Using API + Manual Database Update

1. Register a normal user via API
2. Connect to MongoDB and update the user's role:

```javascript
// MongoDB shell or Compass
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { role: "admin" } }
)
```

## Middleware Usage

### In Route Files

```typescript
import { authenticate } from '@/middleware/auth.middleware';
import { adminOnly, authorize } from '@/middleware/authorize.middleware';

// All routes require authentication
router.use(authenticate);

// Specific route requires admin role
router.post('/', adminOnly, createResource);

// Specific route requires specific roles
router.get('/', authorize('admin', 'user'), getResources);
```

### Authentication Middleware

```typescript
// Requires valid JWT token
router.use(authenticate);

// Optional authentication (doesn't fail if no token)
router.use(optionalAuthenticate);
```

### Authorization Middleware

```typescript
// Admin only
router.use(adminOnly);

// Specific roles
router.use(authorize('admin', 'user'));

// Owner or admin
router.use(ownerOrAdmin('userId'));
```

## Security Best Practices

1. **Access Token Expiry**: Keep short (15 minutes)
2. **Refresh Token Expiry**: Reasonable duration (7 days)
3. **HTTPS Only**: Always use HTTPS in production
4. **Secure Secrets**: Use strong JWT secrets (min 32 characters)
5. **Password Policy**: Minimum 8 characters
6. **Argon2 Hashing**: More secure than bcrypt
7. **Token Storage**:
   - **Access Token**: Store in memory (React state)
   - **Refresh Token**: HTTP-only cookie (preferred) or localStorage
8. **Logout**: Always invalidate refresh token on logout

## Token Storage Recommendations

### Frontend (React/Next.js)

#### Option 1: Memory + HTTP-Only Cookie (Most Secure)
```typescript
// Access token in memory (React state/context)
const [accessToken, setAccessToken] = useState('');

// Refresh token in HTTP-only cookie (set by server)
// This prevents XSS attacks
```

#### Option 2: localStorage (Simpler, less secure)
```typescript
// Store both tokens in localStorage
localStorage.setItem('accessToken', token);
localStorage.setItem('refreshToken', refreshToken);
```

## Error Handling

### Common Error Responses

**401 Unauthorized**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**403 Forbidden**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

## Testing Authentication

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123",
    "name": "Test User"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpass123"
  }'

# Use protected endpoint
curl -X GET http://localhost:5000/api/v1/players \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Create a new request
2. Go to Authorization tab
3. Select "Bearer Token"
4. Paste your access token
5. Send the request

## Environment Variables

Required in `.env.development`:

```env
JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
```

⚠️ **IMPORTANT**: Generate strong, random secrets for production:

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Future Enhancements

- [ ] Email verification on registration
- [ ] Password reset via email
- [ ] Two-factor authentication (2FA)
- [ ] OAuth integration (Google, GitHub)
- [ ] Rate limiting on auth endpoints
- [ ] Account lockout after failed login attempts
- [ ] Audit log for admin actions
- [ ] Session management (revoke all tokens)
