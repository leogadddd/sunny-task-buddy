---
applyTo: "**"
---

# Copilot Coding Guide for Sunny Task Buddy / Project Tracker

Follow these principles while generating code:

1. DRY (Don’t Repeat Yourself): Abstract reusable logic into helpers, hooks, or utility functions. Avoid duplication across components and backend services.
2. KISS: Keep implementations simple and readable; avoid over-engineering.
3. Optimistic Update Principle: For user actions (create/update/delete), assume success in the UI first. Roll back or show an error only if the API fails.
4. Type-Safety: Use TypeScript types and interfaces to enforce contracts across client and server.
5. Consistent Styling: Use Shadcn/UI components with Tailwind conventions. Accent color is #f1594a.
6. Code structure:
   - React: Functional components, hooks, and suspense.
   - Backend: GraphQL (Apollo Server) + Prisma + PostgreSQL.
   - Handle async logic with `try/catch`, rollback failed optimistic updates gracefully.
7. Comments: Explain reasoning when code isn’t obvious. Use concise doc comments above functions.

When unsure, prioritize maintainability and user experience over micro-optimizations.

also add add a proper error handling. use the sonner library for notifications.
