# My Backend

A clean, production-ready Express.js backend with MongoDB (TypeScript).

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server

## Project Structure

```
src/
├── app.ts              # Express app setup
├── server.ts           # Server entry point
├── config/
│   ├── env.ts          # Environment variables
│   └── index.ts        # Config exports
├── loaders/
│   ├── express.loader.ts   # Express middleware setup
│   └── db.loader.ts        # Database connection
├── modules/
│   ├── auth/               # Authentication module
│   │   ├── auth.route.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.schema.ts
│   │   └── auth.middleware.ts
│   └── health/             # Health check module
│       └── health.route.ts
├── middlewares/
│   ├── error.middleware.ts     # Global error handler
│   └── notFound.middleware.ts  # 404 handler
├── utils/
│   ├── logger.ts           # Global logger (pino)
│   ├── ApiError.ts         # Custom error class
│   └── asyncHandler.ts     # Async wrapper
└── routes.ts               # Route aggregator
```

## Authentication

This backend uses JWT-based authentication with access and refresh tokens.

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register a new user |
| POST | `/api/auth/login` | Login and get tokens |
| POST | `/api/auth/refresh-token` | Get new access token |

### How It Works

1. **Register**: Create account with email and password
2. **Login**: Get access token (15min) and refresh token (7 days)
3. **Protected Routes**: Send access token in `Authorization: Bearer <token>` header
4. **Token Refresh**: When access token expires, use refresh token to get a new one

### Example Usage

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'

# Access protected route
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer <access_token>"

# Refresh token
curl -X POST http://localhost:3000/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "<refresh_token>"}'
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| NODE_ENV | Environment mode | development |
| PORT | Server port | 3000 |
| MONGODB_URI | MongoDB connection string | - |
| JWT_ACCESS_SECRET | Secret for access tokens | - |
| JWT_REFRESH_SECRET | Secret for refresh tokens | - |
| JWT_ACCESS_EXPIRES_IN | Access token expiry | 15m |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | 7d |

## Security Features

- Password hashing with bcrypt
- JWT authentication
- Rate limiting (100 requests per 15 minutes)
- CORS enabled
- Centralized error handling
- Request validation with Joi
- Full TypeScript type safety
