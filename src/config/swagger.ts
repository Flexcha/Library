import swaggerUi from 'swagger-ui-express';
import { Router } from 'express';

const openApiSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Library Management System API',
    version: '1.0.0',
    description: 'REST API contract for the Library Management System, covering Auth, Users, Catalog, Circulation, Reservations, Fines, Notifications, and Reports.',
  },
  servers: [
    {
      url: '/api/v1',
      description: 'Current API Server',
    },
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
  },
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new member account',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['fullName', 'email', 'password'],
                properties: {
                  fullName: { type: 'string', example: 'Nguyen Van A' },
                  email: { type: 'string', example: 'a@example.com' },
                  password: { type: 'string', example: 'SecurePass123' },
                  phone: { type: 'string', example: '+84901234567' },
                  address: { type: 'string', example: '123 Le Loi, HCMC' },
                },
              },
            },
          },
        },
        responses: {
          201: { description: 'Member created' },
          409: { description: 'Email already registered' },
        },
      },
    },
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Authenticate and receive access + refresh tokens',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'admin@library.com' },
                  password: { type: 'string', example: 'Admin123!' },
                },
              },
            },
          },
        },
        responses: {
          200: { description: 'Authenticated successfully' },
          401: { description: 'Invalid credentials' },
          403: { description: 'Account suspended or inactive' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Rotate refresh token and get a new access token',
        responses: { 200: { description: 'Tokens refreshed' } },
      },
    },
    '/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current user profile',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Profile returned' } },
      },
    },
    '/books': {
      get: {
        tags: ['Catalog'],
        summary: 'Search & filter books catalog',
        parameters: [
          { name: 'q', in: 'query', schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', schema: { type: 'integer' } },
          { name: 'authorId', in: 'query', schema: { type: 'integer' } },
          { name: 'availableOnly', in: 'query', schema: { type: 'boolean' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'size', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { 200: { description: 'Paginated book list' } },
      },
      post: {
        tags: ['Catalog'],
        summary: 'Create a new book title (Librarian/Admin)',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Book created' }, 409: { description: 'Duplicate ISBN' } },
      },
    },
    '/books/{id}': {
      get: {
        tags: ['Catalog'],
        summary: 'Get book details including availability counts',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        responses: { 200: { description: 'Book details' }, 404: { description: 'Not found' } },
      },
    },
    '/loans': {
      post: {
        tags: ['Circulation'],
        summary: 'Checkout a physical copy to a member (Librarian/Admin)',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Loan created' }, 409: { description: 'Copy not available' } },
      },
      get: {
        tags: ['Circulation'],
        summary: 'List loans (Members see own, Staff sees all)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Loan list' } },
      },
    },
    '/loans/{id}/return': {
      patch: {
        tags: ['Circulation'],
        summary: 'Return a book copy (Librarian/Admin)',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Returned, fine generated if late' } },
      },
    },
    '/loans/{id}/renew': {
      post: {
        tags: ['Circulation'],
        summary: 'Renew loan due date',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Renewed' }, 409: { description: 'Max renewals or reservation active' } },
      },
    },
    '/reservations': {
      post: {
        tags: ['Reservations'],
        summary: 'Place a reservation on an unavailable book',
        security: [{ BearerAuth: [] }],
        responses: { 201: { description: 'Reservation queued' } },
      },
      get: {
        tags: ['Reservations'],
        summary: 'List reservations',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Reservations list' } },
      },
    },
    '/fines': {
      get: {
        tags: ['Fines'],
        summary: 'List fines',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Fines list' } },
      },
    },
    '/reports/dashboard-summary': {
      get: {
        tags: ['Reports'],
        summary: 'Get library operational stats (Staff)',
        security: [{ BearerAuth: [] }],
        responses: { 200: { description: 'Dashboard metrics' } },
      },
    },
  },
};

export const swaggerRouter = Router();
swaggerRouter.use('/', swaggerUi.serve);
swaggerRouter.get('/', swaggerUi.setup(openApiSpec));
swaggerRouter.get('/spec.json', (_req, res) => res.json(openApiSpec));
