# create-backend-skeleton
### A production-ready Node.js + Express boilerplate generator

**create-backend-skeleton** is an opinionated CLI tool that generates a **production-ready Node.js + Express boilerplate** with authentication, validation, and database setup.

It helps you stop wasting time copy-pasting old projects and start with a **clean, scalable backend starter template** that actually works in real-world applications.

A clean and opinionated backend starter template for REST APIs built with Node.js and Express.
---

## Why this Node.js & Express boilerplate?

Starting a backend usually means:
- Reinventing folder structures
- Missing validation until production breaks
- Writing auth differently in every project
- Over-engineering too early

This Express boilerplate exists to give you a **boring, reliable, and developer-friendly starting point** — especially for freshers and small teams.

---

## Who is this for?

- Freshers learning backend development
- Developers building APIs quickly
- Teams creating internal tools or admin panels
- Anyone who wants a clean Node.js backend starter

---

## Features

- Interactive CLI (similar to `create-vite`)
- JavaScript **or** TypeScript support
- MongoDB / PostgreSQL / No DB options
- JWT authentication (access + refresh tokens)
- Joi request validation
- Rate limiting & CORS
- Centralized error handling
- Global logger (no `console.log`)
- Clean, production-ready folder structure

---

## Usage

Generate a new backend project:

```bash
npx create-backend-skeleton my-api 
```

Install dependencies and start development:

```bash
cd my-api
npm install
npm run dev
```

Your backend is now running.

## Generated Project Structure

```bash
src/
 ├── app.ts
 ├── server.ts
 ├── config/
 ├── loaders/
 ├── modules/
 │    └── auth/
 ├── middlewares/
 ├── utils/
 └── routes.ts
```
This structure is simple, readable, and scales well for real production APIs.

## What this boilerplate does NOT include
- Docker
- Kubernetes
- GraphQL
- Microservices
- Swagger

## Philosophy
- Simple > Clever
- Boring code > Fragile abstractions
- One clear way to do things

If you want a backend that is easy to understand, maintain, and extend — this boilerplate is for you.

## License
MIT

## About the Author
Hi, I’m **Yash Vyas** — a full-stack developer who enjoys building clean, practical tools that solve real problems.
I built **create-backend-skeleton** to help freshers and teams start backend projects with a solid, production-ready foundation instead of copy-pasting old code.

- GitHub: https://github.com/yashh503  
- LinkedIn: https://www.linkedin.com/in/yash503  
- Website: https://yarvix.space
