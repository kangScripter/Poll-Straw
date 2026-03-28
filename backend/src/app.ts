import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { existsSync } from 'fs';
import { env, isDevelopment } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/database.js';
import { connectRedis, disconnectRedis } from './config/redis.js';
import { initializeSocket } from './socket/socketHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';

// Dirname for static files: use CJS __dirname when available (Jest), else cwd (ESM or fallback)
const __dirnameApp = typeof __dirname !== 'undefined' ? __dirname : process.cwd();

// Create Express app
const app = express();
const httpServer = createServer(app);

// Security middleware with CSP configured for poll redirect page
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for poll redirect page
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.pollstraw.com"], // Allow API calls
      fontSrc: ["'self'", "data:"],
    },
  },
}));

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
app.use('/static', express.static(path.join(__dirnameApp, 'public')));

// Deep link / Universal link redirect handler for polls
// This serves the landing page that tries to open the app or shows install options
app.get('/poll/:shareUrl', (req, res, next) => {
  try {
    const { shareUrl } = req.params;
    const htmlPath = path.join(__dirnameApp, 'public', 'poll-redirect.html');
    
    // Log path for debugging
    if (isDevelopment) {
      console.log('Serving poll redirect page:', {
        shareUrl,
        htmlPath,
        __dirnameApp,
        fileExists: existsSync(htmlPath),
      });
    }
    
    // Check if file exists
    if (!existsSync(htmlPath)) {
      console.error('Poll redirect HTML file not found:', htmlPath);
      return res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>PollStraw - Error</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: system-ui; text-align: center; padding: 40px;">
          <h1>Unable to load poll</h1>
          <p>The redirect page could not be found.</p>
          <p>Please contact support if this issue persists.</p>
        </body>
        </html>
      `);
    }
    
    // Serve the redirect HTML page
    res.sendFile(htmlPath, (err) => {
      if (err) {
        console.error('Error serving poll redirect page:', {
          error: err.message,
          code: (err as any).code,
          path: htmlPath,
        });
        // Fallback: send a simple HTML response
        if (!res.headersSent) {
          res.status(500).send(`
            <!DOCTYPE html>
            <html>
            <head>
              <title>PollStraw - Error</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body style="font-family: system-ui; text-align: center; padding: 40px;">
              <h1>Unable to load poll</h1>
              <p>Please try again later.</p>
            </body>
            </html>
          `);
        }
      }
    });
  } catch (error: any) {
    console.error('Error in poll redirect handler:', error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: isDevelopment ? error.message : undefined,
      });
    }
  }
});

// Apple App Site Association file for iOS Universal Links
app.get('/.well-known/apple-app-site-association', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.json({
    applinks: {
      apps: [],
      details: [
        {
          appID: `${process.env.APPLE_TEAM_ID || 'TEAMID'}.com.pollstraw.mobile`,
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
          process.env.ANDROID_SHA256_FINGERPRINT || 'YOUR_SHA256_FINGERPRINT',
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

// Initialize server (connects DB, Redis, Socket, then listens)
const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    await connectRedis();
    initializeSocket(httpServer);
    const PORT = parseInt(env.PORT, 10);
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
    const shutdown = async (signal: string) => {
      console.log(`\n📴 ${signal} received. Shutting down gracefully...`);
      httpServer.close(async () => {
        await disconnectDatabase();
        await disconnectRedis();
        console.log('✅ Server shut down complete');
        process.exit(0);
      });
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

// Export for Supertest (tests call connectDatabase/connectRedis/initializeSocket in setup)
export { app, httpServer, startServer };

// Start server only when not in test (tests import app and mount with Supertest)
if (process.env.NODE_ENV !== 'test') {
  startServer();
}
