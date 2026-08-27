# Tasks Client — Week 9

A Next.js App Router frontend for the authenticated Tasks API built during Week 8 of the Coding Pixel internship program.

The application is built with **Next.js, TypeScript, Tailwind CSS, and React**. It communicates with the Week 8 NestJS API through a single typed API wrapper.

## Features

* User sign-in with email and password
* Client-side authentication guard
* Session restoration from browser storage
* Authenticated API requests with Bearer tokens
* Task listing
* Task creation
* Task editing
* Task deletion
* Status-based filtering
* API validation error handling
* Loading, error, empty, and results states
* Jest and React Testing Library tests
* GitHub Actions CI for build and tests

## Project Structure

```text
tasks-client/
├── .github/
│   └── workflows/
│       └── ci.yml
├── __tests__/
│   ├── helpers/
│   │   └── mockFetch.ts
│   ├── api.test.ts
│   ├── tasks.test.tsx
│   └── tasks-create.test.tsx
├── src/
│   ├── app/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── tasks/
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── AuthProvider.tsx
│   │   └── useAuth.ts
│   └── lib/
│       ├── api.ts
│       └── session.ts
├── .env.example
├── jest.config.ts
├── jest.setup.ts
├── package.json
└── README.md
```

## Environment Variables

The application uses the following environment variable:

```env
NEXT_PUBLIC_API_URL=
```

`NEXT_PUBLIC_API_URL` is the base URL of the Week 8 Tasks API.

Example for local development:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Do not commit a real `.env` or `.env.local` file.

Only `.env.example` is committed to the repository.

The API wrapper falls back to an empty base URL when `NEXT_PUBLIC_API_URL` is not available. This allows `npm run build` and `npm test` to run without a reachable API.

## Prerequisites

Make sure the following are installed:

* Node.js
* npm
* PostgreSQL for the Week 8 API

The Week 8 API must be configured with its required database environment variables before starting it.

## Running the Week 8 API and Week 9 Client

The API and frontend are separate projects.

### 1. Start the Week 8 API

Open a terminal in the Week 8 API directory:

```powershell
cd "D:\web project\CODING PIXEL ROAD MAP\week 8\Authenticated Tasks Api"
npm install
npm run start:dev
```

The NestJS API will start in development/watch mode.

### 2. Start the Week 9 Tasks Client

Open a second terminal in the Week 9 client directory:

```powershell
cd "D:\web project\CODING PIXEL ROAD MAP\week 9\tasks-client"
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

The client uses `NEXT_PUBLIC_API_URL` to determine where API requests are sent.

## Getting an Account and Signing In

The Tasks Client requires an account provided by the Week 8 API.

Create an account using the registration endpoint exposed by the Week 8 API, or use an existing account created in the Week 8 backend.

After an account exists:

1. Start the Week 8 API.
2. Start the Week 9 Tasks Client.
3. Open `http://localhost:3000`.
4. Go to the login page.
5. Enter the registered email and password.
6. Submit the form.
7. On successful authentication, the client stores the returned token and redirects to `/tasks`.

A wrong email/password response from the API is displayed in the login form.

## Authentication and Session Storage

The authentication token is stored in the browser's `localStorage`.

The storage access is centralized in:

```text
src/lib/session.ts
```

The `AuthProvider` restores the session when the application starts and exposes authentication state and actions to client components.

The API wrapper in:

```text
src/lib/api.ts
```

automatically adds:

```text
Authorization: Bearer <token>
```

when a session token exists.

### Why localStorage is used

`localStorage` is simple and suitable for this learning exercise, but it has an important security trade-off.

JavaScript running on the page can access the stored token. Therefore, if the application has an XSS vulnerability, malicious JavaScript could potentially read the token.

A production application may use a more secure authentication architecture, such as appropriately configured secure, HttpOnly cookies, together with CSRF protections where required.

This project intentionally follows the Week 9 requirement of keeping the token in browser storage and does not use `middleware.ts` or HttpOnly cookies.

## API Layer

All API requests go through:

```text
src/lib/api.ts
```

Pages, components, and hooks do not call `fetch` directly.

The API wrapper:

* Adds the Bearer authorization header when a token exists
* Handles successful responses
* Handles `204 No Content`
* Decodes the Week 8 API error envelope
* Throws `ApiError` for non-2xx responses
* Handles authentication/session failures centrally

## Tasks

The `/tasks` page provides:

* Task listing from `GET /tasks`
* Status filtering using `GET /tasks?status=...`
* Task creation using `POST /tasks`
* Task editing using `PATCH /tasks/:id`
* Task deletion using `DELETE /tasks/:id`

The task page is client-side guarded. Users without an active session are redirected to `/login`.

The task list displays separate loading, error, empty, and results states.

## Testing

The project uses Jest and React Testing Library.

Run the tests with:

```powershell
npm test
```

The test suite contains three specifications:

### API Authorization

Verifies that the API wrapper:

* Adds the Bearer authorization header when a token exists
* Does not add the authorization header when there is no token

### Tasks List

Verifies that:

* A task row is rendered for each task returned by the mocked API
* The empty state is rendered when the API returns an empty list

### Task Creation

Verifies that:

* A newly created task appears after a successful `201` response
* API validation errors are displayed
* Entered form values remain after a `400` response

All API requests are mocked during testing.

## Production Build

Run:

```powershell
npm run build
```

The build does not require the Week 8 API to be running.

## Continuous Integration

GitHub Actions runs on:

* Push
* Pull request

The workflow is located at:

```text
.github/workflows/ci.yml
```

The CI workflow:

1. Installs dependencies using `npm ci`
2. Builds the Next.js application
3. Runs the Jest test suite

The workflow uses Node.js 20.

## Useful Commands

```powershell
npm run dev
npm run build
npm test
npm start
```

## Repository

GitHub repository:

```text
https://github.com/ayeshawaqar4252/tasks-client
```
