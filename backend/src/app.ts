import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { env, isDevelopment } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { initializeSocket } from './socket/socketHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

// ES module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create Express app
const app = express();
const httpServer = createServer(app);

// Security middleware
app.use(helmet());

// CORS configuration - allow mobile app connections
app.use(cors({
  origin: isDevelopment 
    ? [
        env.FRONTEND_URL, // Expo default
        'http://localhost:8081', // Expo web
        'exp://localhost:8081', // Expo protocol
        /^http:\/\/192\.168\.\d+\.\d+:8081$/, // Local network IPs
        /^exp:\/\/192\.168\.\d+\.\d+:8081$/, // Expo protocol with IP
        /^http:\/\/10\.0\.2\.2:8081$/, // Android emulator
      ]
    : env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
if (!isDevelopment) {
  app.use('/api', apiLimiter);
}

// Trust proxy for correct IP detection
app.set('trust proxy', 1);

// Serve static files from public directory
app.use('/static', express.static(path.join(__dirname, 'public')));

// Deep link / Universal link redirect handler for polls
// This serves the landing page that tries to open the app or shows install options
app.get('/poll/:shareUrl', (req, res) => {
  const { shareUrl } = req.params;
  // Serve the redirect HTML page
  res.sendFile(path.join(__dirname, 'public', 'poll-redirect.html'));
});

// Apple App Site Association file for iOS Universal Links
app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    applinks: {
      apps: [],
      details: [
        {
          appID: 'TEAMID.com.pollstraw.mobile', // Replace TEAMID with your Apple Developer Team ID
          paths: ['/poll/*', '/p/*'],
        },
      ],
    },
  });
});

// Android App Links assetlinks.json
app.get('/.well-known/assetlinks.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json([
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: 'com.pollstraw.mobile',
        sha256_cert_fingerprints: [
          // Replace with your app's SHA256 certificate fingerprint
          'YOUR_SHA256_FINGERPRINT',
        ],
      },
    },
  ]);
});

// API routes
app.use('/api', routes);

// Root route
app.get('/', (req, res) => {
  res.json({
    name: 'PollStraw API',
    version: '1.0.0',
    description: 'Real-time Polling Platform',
    docs: '/api/health',
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize server
const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Connect to Redis
    await connectRedis();

    // Initialize Socket.io
    initializeSocket(httpServer);

    // Start server
    const PORT = parseInt(env.PORT, 10);
    // Listen on all interfaces (0.0.0.0) to allow mobile device connections
    httpServer.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🗳️  PollStraw API Server                          ║
║                                                   ║
║   Port: ${PORT.toString().padEnd(41)}║
║   Environment: ${env.NODE_ENV.padEnd(34)}║
║   API: http://localhost:${PORT}/api                 ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      console.log(`\n📴 ${signal} received. Shutting down gracefully...`);
      
      httpServer.close(async () => {
        await disconnectDatabase();
        await disconnectRedis();
        console.log('✅ Server shut down complete');
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error('❌ Forced shutdown');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
