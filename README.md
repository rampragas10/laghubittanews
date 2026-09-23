# Laghubitta News — Next.js CMS

This project converts the supplied static Laghubitta News HTML into a database-driven Next.js news portal.

## Stack

- Next.js App Router
- MongoDB + Mongoose
- JWT in httpOnly cookie
- bcrypt password hashing
- Tailwind CSS
- Server Components for public pages
- Route Handlers for the backend API
- Admin dashboard for categories and news

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `MONGODB_URI` and a strong `JWT_SECRET`.
3. Install:
   `npm install`
4. Seed admin and categories:
   `npm run seed`
5. Start:
   `npm run dev`
6. Open:
   `http://localhost:3000`
7. Admin:
   `http://localhost:3000/admin/login`

## CMS workflow

Create category → create news → add image URL/content → save draft → publish → optionally mark Featured/Breaking → edit/archive/delete.

## Important production hardening

Before production:
- use HTTPS
- use a long random JWT secret and rotate credentials
- add CSRF protection if auth patterns change
- add rate limiting/WAF to auth and write endpoints
- sanitize rich HTML with a server-side HTML sanitizer
- move images to object storage/CDN instead of arbitrary remote URLs
- add audit logs and admin activity history
- add pagination and caching
- add backups and MongoDB monitoring
- add proper RBAC if multiple staff roles are introduced
- validate every request with Zod
- add tests and CI
