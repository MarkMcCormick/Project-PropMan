# PropMan

PropMan is a property inspection and condition reporting project. The planned workflow takes a property from registration through a structured inspection to a report that puts Critical and Poor findings first.

## Repository layout

- `frontend/` is the React and TypeScript app, built with Vite.
- `backend/` is the Laravel REST API, with Eloquent and MySQL for persistence.

During development, Vite forwards requests under `/api` to Laravel at `http://127.0.0.1:8000`. This lets React use relative URLs and keeps local browser requests on a single origin.

## Local setup

Use PHP 8.3+ with `pdo_mysql`, Composer, MySQL 8.4 and Node.js 22.12+ or 24 with npm. On an Apple Silicon Mac with Homebrew, install the backend tools and start MySQL:

```sh
brew install php composer mysql@8.4
brew services run mysql@8.4
```

Connect to MySQL as a local administrator and create the development database and application account. Choose a local password and use the same value in `backend/.env`.

```sql
CREATE DATABASE propman CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'propman'@'127.0.0.1' IDENTIFIED BY 'replace-with-your-local-password';
GRANT ALL PRIVILEGES ON propman.* TO 'propman'@'127.0.0.1';
```

From the repository root, prepare the API:

```sh
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Set `DB_PASSWORD` in `backend/.env`, then apply the migrations and run the API server:

```sh
php artisan migrate
php artisan serve --host=127.0.0.1 --port=8000
```

In another terminal, start React from the repository root:

```sh
cd frontend
npm ci
npm run dev
```

Open the URL Vite prints. The start page displays the result of `GET /api/health`. To check the API directly, run `curl http://127.0.0.1:8000/api/health`. To check MySQL separately, run `php artisan migrate:status` from `backend/`.

## Checks

- API smoke test from `backend/` with `php artisan test`.
- Frontend type check and production build from `frontend/` with `npm run build`.
- Frontend lint from `frontend/` with `npm run lint`.
