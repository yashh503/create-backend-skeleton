# create-backend-skeleton

A simple, opinionated CLI tool to scaffold a production-ready Node.js + Express backend.

This tool is designed for:
- Freshers
- Small teams
- Internal company projects

It focuses on **clarity, correctness, and simplicity** — not over-engineering.

---

## Features

- Interactive CLI (like create-vite)
- JavaScript or TypeScript
- MongoDB / PostgreSQL / No DB
- JWT authentication (access + refresh tokens)
- Joi validation
- Rate limiting
- CORS enabled
- Centralized error handling
- Global logger (no console.log)

---

## License
MIT


## Usage

```bash
npx create-backend-skeleton my-api

Then:

cd my-api
npm install
npm run dev

Project Structure (Generated)

src/
 ├── app.ts
 ├── server.ts
 ├── modules/
 │    └── auth/
 ├── middlewares/
 ├── utils/
 └── routes.ts

```

Philosophy

Simple > Clever

Boring code > Fragile abstractions

One way to do things

This tool intentionally avoids:

Microservices

GraphQL

Swagger

Docker

Over-configurable setups

