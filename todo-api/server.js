const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON requests
app.use(express.json());

// In-memory data store for tasks
let tasks = [
  {
    id: 1,
    title: "Setup Cloud Architecture",
    description: "Design microservices boundaries and event bus",
    completed: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Implement REST API for To-Do",
    description: "Build CRUD endpoints with Node.js and Express",
    completed: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Configure Swagger OpenAPI Docs",
    description: "Integrate swagger-ui-express and swagger-jsdoc",
    completed: false,
    createdAt: new Date().toISOString()
  }
];

// Metrics counters
let totalRequests = 0;
let requestErrors = 0;
const startTime = Date.now();

// Middleware to record request metrics
app.use((req, res, next) => {
  totalRequests++;
  res.on('finish', () => {
    if (res.statusCode >= 400) {
      requestErrors++;
    }
  });
  next();
});

// Next ID counter
let nextId = 4;

// Swagger definition configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'To-Do List REST API',
      version: '1.0.0',
      description: 'A simple RESTful API for managing to-do items and tasks, built with Node.js and Express for Hands-On Exercise 2 (HON2).',
      contact: {
        name: 'Developer Support',
        email: 'developer@example.com'
      }
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Local Development Server'
      }
    ],
    components: {
      schemas: {
        Task: {
          type: 'object',
          required: ['id', 'title'],
          properties: {
            id: {
              type: 'integer',
              description: 'Auto-generated unique identifier of the task',
              example: 1
            },
            title: {
              type: 'string',
              description: 'Title or summary of the task',
              example: 'Complete Hands-on Exercise 2'
            },
            description: {
              type: 'string',
              description: 'Detailed description of the task',
              example: 'Implement CRUD endpoints and document with Swagger'
            },
            completed: {
              type: 'boolean',
              description: 'Completion status of the task',
              example: false
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Timestamp when the task was created',
              example: '2026-10-28T16:30:00.000Z'
            }
          }
        },
        TaskInput: {
          type: 'object',
          required: ['title'],
          properties: {
            title: {
              type: 'string',
              description: 'Title of the task',
              example: 'Review Pull Request'
            },
            description: {
              type: 'string',
              description: 'Detailed description',
              example: 'Check code changes and run tests'
            },
            completed: {
              type: 'boolean',
              description: 'Completion status (defaults to false if omitted)',
              example: false
            }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Task not found'
            }
          }
        }
      }
    }
  },
  apis: ['./server.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Serve raw OpenAPI JSON specification
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

/**
 * @openapi
 * /tasks:
 *   get:
 *     summary: Retrieve all tasks
 *     description: Returns a list of all to-do tasks. Optional query parameter can filter by completed status.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter tasks by completion status (true or false)
 *     responses:
 *       200:
 *         description: A list of tasks successfully retrieved.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 */
app.get('/tasks', (req, res) => {
  const { completed } = req.query;
  if (completed !== undefined) {
    const isCompleted = completed === 'true';
    const filtered = tasks.filter(t => t.completed === isCompleted);
    return res.status(200).json(filtered);
  }
  res.status(200).json(tasks);
});

/**
 * @openapi
 * /tasks/{id}:
 *   get:
 *     summary: Get a task by ID
 *     description: Retrieves a single task item using its unique identifier.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the task
 *     responses:
 *       200:
 *         description: Task found.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found with the given ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.get('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const task = tasks.find(t => t.id === id);

  if (!task) {
    return res.status(404).json({ error: `Task with ID ${id} not found.` });
  }

  res.status(200).json(task);
});

/**
 * @openapi
 * /tasks:
 *   post:
 *     summary: Create a new task
 *     description: Adds a new to-do task to the collection.
 *     tags:
 *       - Tasks
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       201:
 *         description: Task created successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Bad request (missing required title).
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.post('/tasks', (req, res) => {
  const { title, description, completed } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: "The 'title' field is required and must not be empty." });
  }

  const newTask = {
    id: nextId++,
    title: title.trim(),
    description: description ? description.trim() : "",
    completed: typeof completed === 'boolean' ? completed : false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

/**
 * @openapi
 * /tasks/{id}:
 *   put:
 *     summary: Update an existing task
 *     description: Updates the title, description, or completed status of an existing task by ID.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the task to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskInput'
 *     responses:
 *       200:
 *         description: Task updated successfully.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Task'
 *       400:
 *         description: Invalid input data.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task not found with the specified ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.put('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with ID ${id} not found.` });
  }

  const { title, description, completed } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: "Title must be a non-empty string." });
    }
    tasks[taskIndex].title = title.trim();
  }

  if (description !== undefined) {
    tasks[taskIndex].description = description.trim();
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: "Completed status must be a boolean (true or false)." });
    }
    tasks[taskIndex].completed = completed;
  }

  tasks[taskIndex].updatedAt = new Date().toISOString();

  res.status(200).json(tasks[taskIndex]);
});

/**
 * @openapi
 * /tasks/{id}:
 *   delete:
 *     summary: Delete a task by ID
 *     description: Removes a task from the to-do list by its ID.
 *     tags:
 *       - Tasks
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the task to delete
 *     responses:
 *       200:
 *         description: Task deleted successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Task with ID 1 successfully deleted.
 *                 deletedTask:
 *                   $ref: '#/components/schemas/Task'
 *       404:
 *         description: Task not found with the specified ID.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
app.delete('/tasks/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const taskIndex = tasks.findIndex(t => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: `Task with ID ${id} not found.` });
  }

  const [deletedTask] = tasks.splice(taskIndex, 1);
  res.status(200).json({
    message: `Task with ID ${id} successfully deleted.`,
    deletedTask
  });
});

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Health Check Endpoint
 *     description: Returns the health status, uptime, and system metadata of the microservice.
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Service is healthy and operational.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: UP
 *                 uptime:
 *                   type: number
 *                   example: 120.5
 *                 service:
 *                   type: string
 *                   example: todo-api
 *                 timestamp:
 *                   type: string
 *                   example: 2026-11-09T14:10:00.000Z
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    uptime: process.uptime(),
    service: 'todo-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    components: {
      memory: {
        status: 'UP',
        heapUsedBytes: process.memoryUsage().heapUsed,
        heapTotalBytes: process.memoryUsage().heapTotal
      },
      storage: {
        status: 'UP',
        tasksCount: tasks.length
      }
    }
  });
});

/**
 * @openapi
 * /metrics:
 *   get:
 *     summary: Prometheus & Runtime Metrics Endpoint
 *     description: Exposes Prometheus-compatible and JSON runtime performance metrics.
 *     tags:
 *       - Monitoring
 *     responses:
 *       200:
 *         description: Prometheus metric text or JSON telemetry.
 */
app.get('/metrics', (req, res) => {
  const mem = process.memoryUsage();
  const uptimeSec = process.uptime();

  if (req.headers.accept && req.headers.accept.includes('application/json')) {
    return res.status(200).json({
      uptime_seconds: uptimeSec,
      total_requests: totalRequests,
      error_requests: requestErrors,
      memory: {
        heap_used_bytes: mem.heapUsed,
        heap_total_bytes: mem.heapTotal,
        rss_bytes: mem.rss
      },
      tasks_total: tasks.length
    });
  }

  // Prometheus exposition text format
  const prometheusBody = [
    '# HELP process_uptime_seconds Process uptime in seconds',
    '# TYPE process_uptime_seconds gauge',
    `process_uptime_seconds ${uptimeSec.toFixed(2)}`,
    '',
    '# HELP http_requests_total Total number of HTTP requests processed',
    '# TYPE http_requests_total counter',
    `http_requests_total ${totalRequests}`,
    '',
    '# HELP http_requests_errors_total Total number of failed HTTP requests',
    '# TYPE http_requests_errors_total counter',
    `http_requests_errors_total ${requestErrors}`,
    '',
    '# HELP nodejs_memory_heap_used_bytes Process heap memory used in bytes',
    '# TYPE nodejs_memory_heap_used_bytes gauge',
    `nodejs_memory_heap_used_bytes ${mem.heapUsed}`,
    '',
    '# HELP nodejs_memory_heap_total_bytes Process heap memory total allocated in bytes',
    '# TYPE nodejs_memory_heap_total_bytes gauge',
    `nodejs_memory_heap_total_bytes ${mem.heapTotal}`,
    '',
    '# HELP todo_items_count Total number of to-do items currently in storage',
    '# TYPE todo_items_count gauge',
    `todo_items_count ${tasks.length}`,
    ''
  ].join('\n');

  res.setHeader('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
  res.status(200).send(prometheusBody);
});

// Root welcome route redirecting to Swagger UI
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head><title>To-Do List API</title></head>
      <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
        <h1>To-Do List REST API (HON2)</h1>
        <p>Interactive OpenAPI Documentation is available at:</p>
        <p><a href="/api-docs" style="font-size: 1.2rem; color: #0066cc; font-weight: bold;">/api-docs (Swagger UI)</a></p>
      </body>
    </html>
  `);
});

// Start the server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`To-Do REST API server running at http://localhost:${PORT}`);
    console.log(`Swagger OpenAPI documentation at http://localhost:${PORT}/api-docs`);
  });
}

module.exports = app;
