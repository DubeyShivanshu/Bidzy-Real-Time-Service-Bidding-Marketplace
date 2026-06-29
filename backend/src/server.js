import 'dotenv/config';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './config/socket.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    // Create HTTP server from Express app
    const httpServer = http.createServer(app);

    // Attach Socket.IO and register all connection handlers
    initSocket(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`\n🚀 Bidzy running on http://localhost:${PORT}`);
      console.log(`   Mode: ${process.env.NODE_ENV || 'development'}\n`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
};

startServer();

