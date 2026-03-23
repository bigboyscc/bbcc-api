# BBCC API Server

Express-based REST API server for BBCC (Cricket Club Management System) with TypeScript and MongoDB.

## Features

- **Express.js** - Fast, unopinionated web framework
- **TypeScript** - Type-safe development
- **MongoDB + Mongoose** - NoSQL database with ODM
- **Authentication** - JWT-based auth with access & refresh tokens
- **Authorization** - Role-based access control (RBAC)
- **Security** - Helmet, CORS, XSS protection, Argon2 password hashing
- **Logging** - Structured logging with Pino
- **API Documentation** - Swagger/OpenAPI auto-generated docs
- **Validation** - Zod schema validation
- **Error Handling** - Centralized error handling middleware

## Project Structure

```
api/
├── src/
│   ├── config/           # Configuration files
│   │   ├── env.ts        # Environment validation
│   │   ├── database.ts   # MongoDB connection
│   │   ├── logger.ts     # Pino logger
│   │   └── swagger.ts    # Swagger config
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.ts
│   │   ├── requestLogger.ts
│   │   ├── auth.middleware.ts
│   │   └── authorize.middleware.ts
│   ├── models/           # Mongoose models
│   │   ├── User.model.ts
│   │   ├── Player.model.ts
│   │   ├── Match.model.ts
│   │   ├── Ground.model.ts
│   │   ├── NetSession.model.ts
│   │   └── Application.model.ts
│   ├── routes/           # API routes
│   │   ├── index.ts
│   │   ├── health.routes.ts
│   │   ├── auth.routes.ts
│   │   └── players.routes.ts
│   ├── services/         # Business logic
│   │   └── auth.service.ts
│   ├── controllers/      # Request handlers
│   │   └── auth.controller.ts
│   ├── utils/            # Utility functions
│   │   ├── apiResponse.ts
│   │   └── jwt.ts
│   ├── types/            # TypeScript types
│   │   └── auth.types.ts
│   ├── scripts/          # Utility scripts
│   │   └── createAdmin.ts
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── .env.example          # Environment variables example
├── package.json
├── tsconfig.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm >= 10.0.0
- MongoDB (local or Atlas)

### Installation

1. Install dependencies:
```bash
cd api
npm install
```

2. Create `.env.development` file:
```bash
cp .env.example .env.development
```

3. Update environment variables in `.env.development`:
```env
NODE_ENV=development
PORT=5000
LOG_LEVEL=info
SERVICE_NAME=bbcc-api

# MongoDB connection string
DATABASE_URL=mongodb://localhost:27017/bbcc
# Or use MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/bbcc

FRONTEND_URL=http://localhost:3000

JWT_ACCESS_SECRET=your-super-secret-access-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
```

### Development

Start the development server with hot reload:
```bash
npm run dev
```

The server will start on `http://localhost:5000`

### Create First Admin User

Before you can use the protected endpoints, create an admin user:

```bash
npm run create-admin
```

This creates an admin user with:
- Email: `admin@bbcc.com`
- Password: `admin123456`

⚠️ **Change the password immediately after first login!**

To customize the admin credentials:
```bash
ADMIN_EMAIL=your@email.com ADMIN_PASSWORD=yourpass ADMIN_NAME="Your Name" npm run create-admin
```

### Build

Build the TypeScript project:
```bash
npm run build
```

### Production

Run the production server:
```bash
npm start
```

### Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Generate coverage report:
```bash
npm run test:coverage
```

### Linting

Check for linting errors:
```bash
npm run lint
```

Fix linting errors:
```bash
npm run lint:fix
```

Format code:
```bash
npm run format
```

## API Endpoints

### Health Check
- `GET /health` - Health check endpoint

### Authentication (Public)
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/refresh` - Refresh access token

### Authentication (Protected)
- `POST /api/v1/auth/logout` - Logout user
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/profile` - Update profile
- `PUT /api/v1/auth/password` - Change password

### Players (Protected)
- `GET /api/v1/players` - Get all players (Auth required)
- `GET /api/v1/players/:id` - Get player by ID (Auth required)
- `POST /api/v1/players` - Create new player (**Admin only**)
- `PUT /api/v1/players/:id` - Update player (**Admin only**)
- `DELETE /api/v1/players/:id` - Delete player (**Admin only**)

### API Documentation

Swagger documentation is available at:
- Development: `http://localhost:5000/api-docs`

Swagger JSON spec:
- Development: `http://localhost:5000/api-docs/swagger.json`

### Authentication Guide

For detailed authentication and authorization documentation, see [AUTH_SETUP.md](./AUTH_SETUP.md)

## Database Models

### User
- User authentication and profile
- Email, password (Argon2 hashed), name
- Role: `admin` or `user`
- Refresh token storage

### Player
- Player information (name, phone, skills, jersey details)
- Cricket-specific fields (batting style, bowling style)
- Admin status and application tracking

### Match
- Match details (opponent, date, time, ground)
- Financial tracking (match fee, collections)
- Player payment tracking

### Ground
- Ground/venue information
- Location and contact details

### NetSession
- Practice session details
- Attendee tracking
- Fee management

### Application
- New player applications
- Application status tracking

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| NODE_ENV | Environment (development/production/test) | No | development |
| PORT | Server port | No | 5000 |
| LOG_LEVEL | Logging level | No | info |
| SERVICE_NAME | Service name for logging | No | bbcc-api |
| DATABASE_URL | MongoDB connection string | Yes | - |
| FRONTEND_URL | Frontend URL for CORS | No | http://localhost:3000 |
| JWT_ACCESS_SECRET | JWT access token secret (min 32 chars) | Yes | - |
| JWT_REFRESH_SECRET | JWT refresh token secret (min 32 chars) | Yes | - |

## Security Features

- **Helmet** - Sets security HTTP headers
- **CORS** - Cross-Origin Resource Sharing with whitelist
- **XSS Protection** - Prevents cross-site scripting attacks
- **NoSQL Injection Prevention** - Sanitizes MongoDB queries
- **HPP** - HTTP Parameter Pollution prevention
- **Rate Limiting** - Prevents brute force attacks (TODO)

## Development Tools

- **TypeScript** - Static type checking
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Nodemon** - Auto-restart on file changes
- **Pino Pretty** - Beautiful logs in development

## TODO

- [x] Add authentication middleware (JWT)
- [x] Add authorization (role-based access control)
- [x] Add validation with Zod schemas (auth endpoints)
- [ ] Complete remaining routes (matches, grounds, net sessions, applications)
- [ ] Add validation for all endpoints
- [ ] Add pagination for list endpoints
- [ ] Add filtering and sorting
- [ ] Add rate limiting
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add CI/CD pipeline
- [ ] Add Docker support
- [ ] Email verification
- [ ] Password reset functionality

## License

MIT
