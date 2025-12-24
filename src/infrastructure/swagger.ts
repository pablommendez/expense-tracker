/**
 * Swagger UI Setup
 *
 * This module initializes Swagger UI for API documentation.
 * The OpenAPI spec is loaded from docs/openapi.yml at runtime.
 *
 * Usage in src/index.ts:
 * ```typescript
 * import { setupSwagger } from './infrastructure/swagger';
 *
 * const app = express();
 * await setupSwagger(app);
 * ```
 */

import type { Express } from 'express';
import swaggerUi from 'swagger-ui-express';
import { readFile } from 'fs/promises';
import { parse as parseYaml } from 'yaml';
import { resolve } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function setupSwagger(app: Express): Promise<void> {
  try {
    // Load OpenAPI spec from YAML file
    const specPath = resolve(__dirname, '../../docs/openapi.yml');
    const specContent = await readFile(specPath, 'utf-8');
    const openApiSpec = parseYaml(specContent);

    // Configure Swagger UI options
    const swaggerUiOptions = {
      swaggerOptions: {
        persistAuthorization: true,
        deepLinking: true,
      },
      customCss: `
        .swagger-ui {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
        }
        .swagger-ui .topbar {
          background-color: #1976d2;
        }
      `,
    };

    // Mount Swagger UI at /api-docs
    app.use('/api-docs', swaggerUi.serve);
    app.get(
      '/api-docs',
      swaggerUi.setup(openApiSpec, swaggerUiOptions),
    );

    console.log('✓ Swagger UI initialized at http://localhost:3000/api-docs');
  } catch (error) {
    console.error('Failed to initialize Swagger UI:', error);
    // Non-fatal: allow app to continue without Swagger UI
  }
}

/**
 * Get OpenAPI spec (useful for programmatic access)
 */
export async function getOpenApiSpec(): Promise<Record<string, unknown>> {
  const specPath = resolve(__dirname, '../../docs/openapi.yml');
  const specContent = await readFile(specPath, 'utf-8');
  return parseYaml(specContent);
}
