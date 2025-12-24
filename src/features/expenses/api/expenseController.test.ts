/**
 * ExpenseController - Integration Tests (TDD with Testcontainers + Supertest)
 */

import request from 'supertest';
import express, { Express } from 'express';
import { PrismaClient } from '@prisma/client';
import {
  setupTestDatabase,
  cleanupTestDatabase,
  teardownTestDatabase,
} from '../../../../tests/testcontainers.setup.js';
import { ExpenseController } from './expenseController.js';
import { errorHandler } from '../../../shared/middleware/errorHandler.js';
import { correlationId } from '../../../shared/middleware/correlationId.js';

describe('ExpenseController', () => {
  let app: Express;
  let prisma: PrismaClient;

  beforeAll(async () => {
    prisma = await setupTestDatabase();

    // Create Express app for testing
    app = express();
    app.use(express.json());
    app.use(correlationId);

    const controller = new ExpenseController(prisma);

    app.post('/api/v1/expenses', controller.create);
    app.get('/api/v1/expenses', controller.list);
    app.get('/api/v1/expenses/:id', controller.getById);
    app.put('/api/v1/expenses/:id', controller.update);
    app.delete('/api/v1/expenses/:id', controller.delete);

    app.use(errorHandler);
  });

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/v1/expenses', () => {
    it('should create expense and return 201', async () => {
      const response = await request(app)
        .post('/api/v1/expenses')
        .send({
          description: 'Test expense',
          amount: 100.5,
          currency: 'USD',
          category: 'food',
          expenseDate: '2025-12-20T12:00:00.000Z',
        });

      expect(response.status).toBe(201);
      expect(response.body.id).toBeDefined();
      expect(response.body.description).toBe('Test expense');
      expect(response.body.amount).toBe(100.5);
      expect(response.body.currency).toBe('USD');
      expect(response.body.category).toBe('food');
    });

    it('should return 400 for invalid data', async () => {
      const response = await request(app)
        .post('/api/v1/expenses')
        .send({
          description: '',
          amount: -10,
          currency: 'INVALID',
          category: 'invalid',
          expenseDate: 'not-a-date',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/v1/expenses')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    it('should return 400 for future expense date', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const response = await request(app)
        .post('/api/v1/expenses')
        .send({
          description: 'Future expense',
          amount: 100,
          currency: 'USD',
          category: 'food',
          expenseDate: futureDate.toISOString(),
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/expenses/:id', () => {
    it('should return expense by ID', async () => {
      // First create an expense
      const createResponse = await request(app)
        .post('/api/v1/expenses')
        .send({
          description: 'Test expense',
          amount: 100,
          currency: 'USD',
          category: 'food',
          expenseDate: '2025-12-20T12:00:00.000Z',
        });

      const id = createResponse.body.id;

      // Get by ID
      const response = await request(app).get(`/api/v1/expenses/${id}`);

      expect(response.status).toBe(200);
      expect(response.body.id).toBe(id);
      expect(response.body.description).toBe('Test expense');
    });

    it('should return 404 for non-existent ID', async () => {
      const response = await request(app).get(
        '/api/v1/expenses/550e8400-e29b-41d4-a716-446655440000'
      );

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Resource not found');
    });

    it('should return 400 for invalid UUID format', async () => {
      const response = await request(app).get('/api/v1/expenses/invalid-uuid');

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/expenses', () => {
    beforeEach(async () => {
      // Create test expenses
      await request(app).post('/api/v1/expenses').send({
        description: 'Food expense 1',
        amount: 50,
        currency: 'USD',
        category: 'food',
        expenseDate: '2025-12-20T12:00:00.000Z',
      });

      await request(app).post('/api/v1/expenses').send({
        description: 'Transport expense',
        amount: 30,
        currency: 'USD',
        category: 'transport',
        expenseDate: '2025-12-19T12:00:00.000Z',
      });

      await request(app).post('/api/v1/expenses').send({
        description: 'Food expense 2',
        amount: 25,
        currency: 'USD',
        category: 'food',
        expenseDate: '2025-12-18T12:00:00.000Z',
      });
    });

    it('should return paginated list', async () => {
      const response = await request(app)
        .get('/api/v1/expenses')
        .query({ page: 1, limit: 10 });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(3);
      expect(response.body.pagination.total).toBe(3);
      expect(response.body.pagination.page).toBe(1);
    });

    it('should filter by category', async () => {
      const response = await request(app)
        .get('/api/v1/expenses')
        .query({ category: 'food' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data.every((e: { category: string }) => e.category === 'food')).toBe(true);
    });

    it('should filter by date range', async () => {
      const response = await request(app)
        .get('/api/v1/expenses')
        .query({
          startDate: '2025-12-19T00:00:00.000Z',
          endDate: '2025-12-20T23:59:59.999Z',
        });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return empty array when no expenses match', async () => {
      const response = await request(app)
        .get('/api/v1/expenses')
        .query({ category: 'entertainment' });

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
    });

    it('should order by expense date descending', async () => {
      const response = await request(app).get('/api/v1/expenses');

      expect(response.status).toBe(200);
      const dates = response.body.data.map((e: { expenseDate: string }) =>
        new Date(e.expenseDate).getTime()
      );
      expect(dates).toEqual([...dates].sort((a, b) => b - a));
    });
  });

  describe('PUT /api/v1/expenses/:id', () => {
    it('should update expense and return 200', async () => {
      // Create expense
      const createResponse = await request(app)
        .post('/api/v1/expenses')
        .send({
          description: 'Original description',
          amount: 100,
          currency: 'USD',
          category: 'food',
          expenseDate: '2025-12-20T12:00:00.000Z',
        });

      const id = createResponse.body.id;

      // Update
      const response = await request(app)
        .put(`/api/v1/expenses/${id}`)
        .send({
          description: 'Updated description',
          category: 'transport',
        });

      expect(response.status).toBe(200);
      expect(response.body.description).toBe('Updated description');
      expect(response.body.category).toBe('transport');
    });

    it('should return 404 for non-existent expense', async () => {
      const response = await request(app)
        .put('/api/v1/expenses/550e8400-e29b-41d4-a716-446655440000')
        .send({
          description: 'Updated',
        });

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid update data', async () => {
      // Create expense
      const createResponse = await request(app)
        .post('/api/v1/expenses')
        .send({
          description: 'Test',
          amount: 100,
          currency: 'USD',
          category: 'food',
          expenseDate: '2025-12-20T12:00:00.000Z',
        });

      const id = createResponse.body.id;

      // Invalid update
      const response = await request(app)
        .put(`/api/v1/expenses/${id}`)
        .send({
          description: '',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('DELETE /api/v1/expenses/:id', () => {
    it('should delete expense and return 204', async () => {
      // Create expense
      const createResponse = await request(app)
        .post('/api/v1/expenses')
        .send({
          description: 'To be deleted',
          amount: 100,
          currency: 'USD',
          category: 'food',
          expenseDate: '2025-12-20T12:00:00.000Z',
        });

      const id = createResponse.body.id;

      // Delete
      const response = await request(app).delete(`/api/v1/expenses/${id}`);

      expect(response.status).toBe(204);

      // Verify deletion
      const getResponse = await request(app).get(`/api/v1/expenses/${id}`);
      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent expense', async () => {
      const response = await request(app).delete(
        '/api/v1/expenses/550e8400-e29b-41d4-a716-446655440000'
      );

      expect(response.status).toBe(404);
    });
  });
});
