# Expense Tracker API

A RESTful API for tracking personal expenses, built as a POC demonstrating:

- **TDD Workflow**: Red-Green-Refactor cycle
- **Result<T> Pattern**: Explicit error handling with `neverthrow`
- **Domain Builders**: Type-safe construction with validation
- **Vertical Slice Architecture**: Feature-based code organization
- **Testcontainers**: Isolated PostgreSQL for integration tests

## Tech Stack

- Node.js 20 LTS + TypeScript 5+
- Express.js
- Prisma ORM + PostgreSQL
- Zod (validation)
- Pino (logging)
- Jest + Testcontainers

## Getting Started

### Prerequisites

- Node.js 20+
- Docker (for PostgreSQL)
- pnpm/npm/yarn

### Setup

```bash
# Install dependencies
npm install

# Start PostgreSQL
docker-compose up -d

# Create .env file
cp .env.example .env

# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

## API Endpoints

### Expenses

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/expenses` | Create a new expense |
| GET | `/api/v1/expenses` | List expenses (paginated) |
| GET | `/api/v1/expenses/:id` | Get expense by ID |
| PUT | `/api/v1/expenses/:id` | Update an expense |
| DELETE | `/api/v1/expenses/:id` | Delete an expense |

### Request/Response Examples

#### Create Expense

```bash
curl -X POST http://localhost:3000/api/v1/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Lunch at restaurant",
    "amount": 25.50,
    "currency": "USD",
    "category": "food",
    "expenseDate": "2025-12-24T12:00:00.000Z"
  }'
```

Response (201 Created):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "description": "Lunch at restaurant",
  "amount": 25.5,
  "currency": "USD",
  "category": "food",
  "expenseDate": "2025-12-24T12:00:00.000Z",
  "createdAt": "2025-12-24T12:00:00.000Z",
  "updatedAt": "2025-12-24T12:00:00.000Z"
}
```

#### List Expenses

```bash
# With filters
curl "http://localhost:3000/api/v1/expenses?category=food&page=1&limit=10"
```

Response (200 OK):
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

## Development

### Commands

```bash
# Run all tests
npm test

# TDD mode (watch + coverage)
npm run test:tdd

# Unit tests only
npm run test:unit

# Integration tests only
npm run test:integration

# Coverage report
npm run test:coverage

# Lint and format
npm run lint

# Build
npm run build
```

### Project Structure

```
src/
├── features/
│   └── expenses/
│       ├── domain/          # Entities, value objects, builders
│       ├── application/     # Commands, queries, DTOs
│       ├── infrastructure/  # Repository (Prisma)
│       └── api/            # Routes, controller
├── shared/
│   ├── result/             # Result pattern (neverthrow)
│   ├── errors/             # Domain errors
│   └── middleware/         # Express middleware
└── server.ts               # Express app configuration
```

## Architecture Decisions

See [docs/adrs/ADR-001-expense-tracker-architecture.md](docs/adrs/ADR-001-expense-tracker-architecture.md) for detailed architecture decisions.

## License

MIT
