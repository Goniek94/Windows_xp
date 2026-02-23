import { Server } from "socket.io";
import logger from "../utils/logger.js";
import config from "../config/index.js";

import SocketAuth from "./socket/SocketAuth.js";
import SocketConnectionManager from "./socket/SocketConnectionManager.js";
import SocketConversationManager from "./socket/SocketConversationManager.js";
import SocketNotificationManager from "./socket/SocketNotificationManager.js";
import SocketHeartbeatManager from "./socket/SocketHeartbeatManager.js";

class SocketService {
  constructor() {
    this.io = null;
    this.connectionManager = new SocketConnectionManager();
    this.conversationManager = new SocketConversationManager();
    this.notificationManager = null;
    this.heartbeatManager = null;
  }

  initialize(server) {
    if (this.io) return this.io;

    this.io = new Server(server, {
      cors: {
        origin: config.security?.cors?.origin || [
          "http://localhost:3000",
          "http://localhost:3001",
        ],
        methods: ["GET", "POST"],
        credentials: true,
      },
      pingTimeout: 60000,
      connectionStateRecovery: {
        maxDisconnectionDuration: 2 * 60 * 1000,
        skipMiddlewares: true,
      },
    });

    this.notificationManager = new SocketNotificationManager(this.io, this.connectionManager);
    this.heartbeatManager = new SocketHeartbeatManager(
      this.io,
      this.connectionManager,
      this.conversationManager,
    );

    this.conversationManager.setSocketService(this);
    this.io.use(SocketAuth.authMiddleware);
    this.io.on("connection", this.handleConnection.bind(this));
    this.heartbeatManager.startHeartbeat();

    logger.info("Socket.IO initialized successfully");
    return this.io;
  }

  handleConnection(socket) {
    const connectionAdded = this.connectionManager.addConnection(socket, this.io);
    if (!connectionAdded) return;

    socket.on("disconnect", () => this.connectionManager.removeConnection(socket));

    socket.on("mark_notification_read", async (data) => {
      if (!this.connectionManager.validateEventPayload(data)) return;
      await this.notificationManager.handleMarkNotificationRead(socket, data);
    });

    socket.on("enter_conversation", (data) => {
      if (!this.connectionManager.validateEventPayload(data)) return;
      this.conversationManager.handleEnterConversation(socket, data);
    });

    socket.on("leave_conversation", (data) => {
      if (!this.connectionManager.validateEventPayload(data)) return;
      this.conversationManager.handleLeaveConversation(socket, data);
    });
  }

  getConnectionStats() {
    return {
      ...this.connectionManager.getConnectionStats(),
      ...this.conversationManager.getConversationStats(),
      heartbeat: this.heartbeatManager?.getHeartbeatStatus(),
    };
  }

  shutdown() {
    logger.info("Shutting down Socket.IO service");
    this.connectionManager.disconnectAll(this.io);
    this.conversationManager.clear();
    this.heartbeatManager?.stopHeartbeat();
    if (this.io) this.io.close();
    this.io = null;
  }
}

const socketService = new SocketService();
export default socketService;
