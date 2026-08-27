# Week 9 — Tasks Client

A Next.js App Router frontend for the Week 8 NestJS Tasks API.

The application uses TypeScript, Tailwind CSS, browser storage for authentication, and a centralized API wrapper for all HTTP requests.

## Tech Stack

* Next.js 16
* React
* TypeScript
* Tailwind CSS
* NestJS API
* Jest
* React Testing Library

## Project Structure

```text
tasks-client/
├── src/
│   ├── app/
│   │   ├── login/
│   │   └── tasks/
│   ├── components/
│   │   ├── AuthProvider.tsx
│   │   └── useAuth.ts
│   └── lib/
│       ├── api.ts
│       └── session.ts
├── __tests__/
│   ├── api.test.ts
│   ├── tasks.test.tsx
│   ├── tasks-create.test.tsx
│   └── helpers/
├── .github/
│   └── workflows/
│       └── ci.yml
├── .env.example
├── jest.config.ts
├── jest.setup.ts
├── package.json
└── package-lock.json
```

## Environment Variables

Create a local environment file named `.env.local`.

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

`NEXT_PUBLIC_API_URL` is the base URL of the Week 8 NestJS API.

Do not commit `.env.local` or any real environment file. Only `.env.example` is committed.

If the environment variable is missing, the application can still build and the tests can run because the API wrapper falls back to an empty base URL.

## Running the Week 8 API

Open a terminal in the Week 8 NestJS API project and run:

```bash
npm run start:dev
```

Make sure the API is running on the URL configured in `NEXT_PUBLIC_API_URL`.

## Running the Tasks Client

Open another terminal in this project:

```bash
npm install
npm run dev
```

The frontend runs at:

```text
http://localhost:3000
```

The API and frontend should be running side by side in separate terminals.

## Account and Sign In

The Tasks Client uses the authentication system from the Week 8 NestJS API.

1. Start the Week 8 API.
2. Create an account using the API's registration endpoint or an existing account.
3. Start the Tasks Client.
4. Open `/login`.
5. Enter the account email and password.
6. After successful authentication, the application redirects to `/tasks`.

A wrong password is displayed as an authentication error in the login form.

## Authentication and Token Storage

After successful sign-in, the API returns an authentication token.

The token is stored in browser `localStorage` through `src/lib/session.ts`.

All API requests are made through `src/lib/api.ts`. When a token exists, the API wrapper automatically adds:

```text
Authorization: Bearer <token>
```

The token is not stored in an HTTP-only cookie because this Week 9 exercise specifically requires browser storage and client-side authentication.

### Cost of localStorage

Using `localStorage` makes the implementation simple and allows Client Components to access the token directly. However, JavaScript running on the page can access the token, so an XSS vulnerability could potentially expose it.

An HTTP-only cookie would prevent JavaScript from directly reading the authentication token, providing stronger protection against token theft, but that approach is intentionally not used for this exercise.

## Tasks Features

The Tasks Client supports:

* User sign-in
* Client-side authentication guard
* Loading tasks
* Empty task state
* Error state
* Task list
* Create task
* Edit task
* Delete task
* Status filtering
* Todo status
* In-progress status
* Done status
* API validation errors
* Authorization headers
* Sign out

Status filtering is performed by requesting the API with:

```text
/tasks?status=
```

The filtering is therefore performed by the API rather than by filtering the already-loaded tasks in the browser.

## API Wrapper

All API requests go through:

```text
src/lib/api.ts
```

Pages, components, and hooks do not call `fetch` directly.

The wrapper is responsible for:

* Building the API URL
* Adding the Bearer token
* Handling non-2xx responses
* Decoding API error responses
* Handling HTTP 204 responses
* Returning typed API data

## Testing

The project uses Jest and React Testing Library.

Run the complete test suite with:

```bash
npm test
```

The test suite covers:

* Authorization header with a token
* No Authorization header without a token
* Rendering multiple tasks
* Rendering the empty state
* Creating a task
* Handling API validation errors
* Keeping entered form values after a 400 response

All API requests are mocked during tests.

## Production Build

To verify the production build:

```bash
npm run build
```

The build does not require the Week 8 API to be running.

## Continuous Integration

GitHub Actions runs on every push and pull request.

The workflow is located at:

```text
.github/workflows/ci.yml
```

The CI workflow uses Node.js 20 and runs:

```bash
npm ci
npm run build
npm test
```

The repository includes `package-lock.json` so that `npm ci` can install dependencies from a clean checkout.

## Week 9 Acceptance

The project fulfills the Week 9 Tasks Client requirements by providing a separate Next.js frontend that communicates with the Week 8 NestJS API using real API requests, client-side authentication, centralized API handling, task CRUD operations, server-side status filtering, automated tests, and GitHub Actions CI.
