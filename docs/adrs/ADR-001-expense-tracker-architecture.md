# ADR-001: Expense Tracker POC Architecture

**Date**: 2025-12-24
**Status**: Accepted

## Context

We are building a proof-of-concept (POC) Expense Tracker REST API to demonstrate:
- Vertical slice architecture for feature organization
- Result<T> pattern for explicit error handling
- Domain-driven design with builders and value objects
- Test-driven development with high coverage
- Observability with structured logging

This is a single-feature MVP focused on CRUD operations for expenses with minimal complexity.

**Constraints**:
- Node.js 20 + TypeScript 5+
- Single developer, time-boxed POC
- No authentication/authorization (future scope)
- No multi-tenancy (single user)

## Decision

### 1. Architecture Style: Vertical Slice

Organize code by business feature (`features/expenses/`) rather than technical layers.

**Structure**:
```
features/expenses/
  ├── domain/         # Business entities, value objects, invariants
  ├── application/    # Commands, queries, DTOs
  ├── infrastructure/ # Persistence (Prisma)
  └── api/            # Express routes, controllers
```

### 2. Error Handling: Result<T> Pattern

Use `neverthrow` library for explicit error handling. All domain/application boundaries return `Result<T, E>`.

**HTTP Mapping**:
- `ValidationError` → 400 Bad Request
- `NotFoundError` → 404 Not Found
- Unexpected exceptions → 500 Internal Server Error

### 3. Domain Model: Builders + Value Objects

- **Expense**: Entity with private constructor, static factory `create()` returns `Result<Expense>`
- **ExpenseId**: Value object (UUID wrapper) with validation
- **Money**: Value object (amount + currency) with positive amount invariant
- **ExpenseBuilder**: Fluent API for construction, `build()` returns `Result<Expense>`

### 4. Persistence: Prisma ORM + PostgreSQL

- Simple CRUD operations use Prisma Client
- Complex queries use raw SQL when needed
- Decimal type for money (avoids floating-point issues)
- Indexes on `expenseDate`, `category` for query optimization

### 5. Validation: Zod for DTOs

- Runtime type safety at API boundary
- Parse untrusted HTTP input before passing to domain
- Automatic error messages (field-level)

### 6. Testing Strategy: TDD + Testcontainers

- Unit tests: Co-located with source (`*.test.ts`)
- Integration tests: Use `@testcontainers/postgresql` for real DB
- Coverage gate: Minimum 75% line coverage

## Consequences

### Positive

1. **Type Safety**: End-to-end type safety from HTTP → Domain → DB
2. **Testability**: High test coverage achievable with isolated tests
3. **Maintainability**: Vertical slices keep related code together
4. **Explicit Errors**: Result<T> makes failure cases visible

### Negative

1. **Learning Curve**: Result<T> pattern new to some developers
2. **Boilerplate**: Builder pattern adds more code than simple constructors
3. **Testcontainers**: Slower integration tests (Docker overhead)

## Related Decisions

- ADR-002 (future): Authentication strategy
- ADR-003 (future): Multi-tenancy model
