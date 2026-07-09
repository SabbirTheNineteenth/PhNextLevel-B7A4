// OpenAPI 3.0 spec served via swagger-ui-express at /api-docs
export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'RentNest API',
    version: '1.0.0',
    description:
      'Backend API for RentNest — a rental property marketplace. Roles: TENANT, LANDLORD, ADMIN.',
  },
  servers: [
    { url: 'http://localhost:5000', description: 'Local' },
    { url: '/', description: 'Current host' },
  ],
  tags: [
    { name: 'Auth' },
    { name: 'Categories' },
    { name: 'Properties' },
    { name: 'Rentals' },
    { name: 'Landlord' },
    { name: 'Payments' },
    { name: 'Reviews' },
    { name: 'Admin' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
    },
    schemas: {
      Error: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string' },
          errorDetails: {
            type: 'array',
            items: {
              type: 'object',
              properties: { path: { type: 'string' }, message: { type: 'string' } },
            },
          },
        },
      },
      RegisterInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', example: 'john@example.com' },
          password: { type: 'string', example: 'password123' },
          phone: { type: 'string', example: '01700000000' },
          role: { type: 'string', enum: ['TENANT', 'LANDLORD'], example: 'TENANT' },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', example: 'john@example.com' },
          password: { type: 'string', example: 'password123' },
        },
      },
      PropertyInput: {
        type: 'object',
        required: ['title', 'description', 'location', 'price', 'categoryId'],
        properties: {
          title: { type: 'string', example: 'Cozy 2BR Apartment' },
          description: { type: 'string', example: 'A lovely apartment near downtown.' },
          location: { type: 'string', example: 'Dhaka' },
          price: { type: 'integer', example: 15000 },
          categoryId: { type: 'string', format: 'uuid' },
          bedrooms: { type: 'integer', example: 2 },
          bathrooms: { type: 'integer', example: 1 },
          amenities: { type: 'array', items: { type: 'string' }, example: ['wifi', 'parking'] },
          images: { type: 'array', items: { type: 'string' } },
          isAvailable: { type: 'boolean', example: true },
        },
      },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user (tenant/landlord)',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/RegisterInput' } } },
        },
        responses: { '201': { description: 'User registered' }, '409': { description: 'Email exists' } },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login and receive a JWT',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/LoginInput' } } },
        },
        responses: { '200': { description: 'Login successful' }, '401': { description: 'Invalid credentials' } },
      },
    },
    '/api/auth/me': {
      get: {
        tags: ['Auth'],
        summary: 'Get current authenticated user',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'Current user' }, '401': { description: 'Unauthorized' } },
      },
    },
    '/api/categories': {
      get: { tags: ['Categories'], summary: 'Get all categories', responses: { '200': { description: 'OK' } } },
      post: {
        tags: ['Categories'],
        summary: 'Create a category (ADMIN)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } } },
            },
          },
        },
        responses: { '201': { description: 'Created' }, '403': { description: 'Forbidden' } },
      },
    },
    '/api/categories/{id}': {
      patch: {
        tags: ['Categories'],
        summary: 'Update a category (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Updated' } },
      },
      delete: {
        tags: ['Categories'],
        summary: 'Delete a category (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Deleted' } },
      },
    },
    '/api/properties': {
      get: {
        tags: ['Properties'],
        summary: 'Get all properties (filters: search, location, categoryId, minPrice, maxPrice, isAvailable, page, limit)',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'location', in: 'query', schema: { type: 'string' } },
          { name: 'categoryId', in: 'query', schema: { type: 'string' } },
          { name: 'minPrice', in: 'query', schema: { type: 'integer' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'integer' } },
          { name: 'page', in: 'query', schema: { type: 'integer' } },
          { name: 'limit', in: 'query', schema: { type: 'integer' } },
        ],
        responses: { '200': { description: 'OK' } },
      },
      post: {
        tags: ['Properties'],
        summary: 'Create a property (LANDLORD)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/PropertyInput' } } },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/properties/{id}': {
      get: {
        tags: ['Properties'],
        summary: 'Get property details',
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' }, '404': { description: 'Not found' } },
      },
      put: {
        tags: ['Properties'],
        summary: 'Update a property (LANDLORD, owner only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Updated' } },
      },
      delete: {
        tags: ['Properties'],
        summary: 'Delete a property (LANDLORD, owner only)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'Deleted' } },
      },
    },
    '/api/rentals': {
      post: {
        tags: ['Rentals'],
        summary: 'Submit a rental request (TENANT)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['propertyId'],
                properties: {
                  propertyId: { type: 'string', format: 'uuid' },
                  message: { type: 'string' },
                  moveInDate: { type: 'string', format: 'date-time' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
      get: {
        tags: ['Rentals'],
        summary: "Get tenant's own rental requests",
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/rentals/{id}': {
      get: {
        tags: ['Rentals'],
        summary: 'Get rental request details (tenant or property landlord)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/landlord/requests': {
      get: {
        tags: ['Landlord'],
        summary: "Get all rental requests for a landlord's properties",
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/landlord/requests/{id}': {
      patch: {
        tags: ['Landlord'],
        summary: 'Approve / reject / complete a rental request (LANDLORD)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { status: { type: 'string', enum: ['APPROVED', 'REJECTED', 'COMPLETED'] } },
              },
            },
          },
        },
        responses: { '200': { description: 'Updated' } },
      },
    },
    '/api/payments/create': {
      post: {
        tags: ['Payments'],
        summary: 'Create a Stripe checkout session for an APPROVED rental (TENANT)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rentalRequestId'],
                properties: { rentalRequestId: { type: 'string', format: 'uuid' } },
              },
            },
          },
        },
        responses: { '201': { description: 'Returns checkoutUrl + transactionId' } },
      },
    },
    '/api/payments/confirm': {
      post: {
        tags: ['Payments'],
        summary: 'Verify a payment by transactionId and activate the rental',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['transactionId'],
                properties: { transactionId: { type: 'string' } },
              },
            },
          },
        },
        responses: { '200': { description: 'Payment status' } },
      },
    },
    '/api/payments': {
      get: {
        tags: ['Payments'],
        summary: "Get user's payment history",
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/payments/{id}': {
      get: {
        tags: ['Payments'],
        summary: 'Get payment details',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/reviews': {
      post: {
        tags: ['Reviews'],
        summary: 'Create a review after a COMPLETED rental (TENANT)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['rentalRequestId', 'rating'],
                properties: {
                  rentalRequestId: { type: 'string', format: 'uuid' },
                  rating: { type: 'integer', minimum: 1, maximum: 5 },
                  comment: { type: 'string' },
                },
              },
            },
          },
        },
        responses: { '201': { description: 'Created' } },
      },
    },
    '/api/admin/users': {
      get: {
        tags: ['Admin'],
        summary: 'Get all users (ADMIN)',
        security: [{ bearerAuth: [] }],
        responses: { '200': { description: 'OK' } },
      },
    },
    '/api/admin/users/{id}': {
      patch: {
        tags: ['Admin'],
        summary: 'Ban/unban a user (ADMIN)',
        security: [{ bearerAuth: [] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { type: 'object', properties: { status: { type: 'string', enum: ['ACTIVE', 'BANNED'] } } },
            },
          },
        },
        responses: { '200': { description: 'Updated' } },
      },
    },
    '/api/admin/properties': {
      get: { tags: ['Admin'], summary: 'Get all properties (ADMIN)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
    '/api/admin/rentals': {
      get: { tags: ['Admin'], summary: 'Get all rental requests (ADMIN)', security: [{ bearerAuth: [] }], responses: { '200': { description: 'OK' } } },
    },
  },
};
