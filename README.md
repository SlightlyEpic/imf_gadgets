# IMF Gadget API

This project is built for [Upraised](https://www.upraised.co)'s Backend Intern Assignment

Try out the API at: https://imf-gadgets-ydac.onrender.com/swagger

---

### Technologies Used:
- TypeScript
- Express.js
- Drizzle (ORM) + postgres.js adapter
- Zod
- JWTs
- swagger-jsdoc
- Stoplight Elements (For API docs UI)

### Features
- Fully type safe code
- Highly organized and modular codebase
- Secure JWT based auth
- Robust error handling
- Explicit API request and response types with proper validation
- All dependencies are injected which makes using mocks easy and increases testability

Note: The site is deployed on render's free tier so there might be a cold start when you visit

---

### How to run this project

Clone the repository and cd into it
```sh
git clone https://github.com/slightlyepic/imf_gadgets.git
cd imf_gadgets
```

Copy .env.example into .env and fill in the values appropriately
```sh
cp .env.example .env
```
**Caution:** If deploying this on Render, you cannot use Supabase's direct connection details because Render is IPv4 only, and Supabase switched to IPv6 in 2024. Use their session pooler connection details instead.

Install dependencies
```sh
pnpm install --frozen-lockfile  
# or
# npm install --frozen-lockfile
```

Upload the schema to your database
```sh
pnpm drizzle:push
# or
# npm run drizzle:push
```

Build the project
```sh
pnpm build
```

Start the project
```sh
pnpm start
```
