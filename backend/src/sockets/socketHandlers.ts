import { Server as SocketIOServer } from 'socket.io';
import { logger } from '../utils/logger';

export const setupSocketHandlers = (io: SocketIOServer): void => {
  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);
    
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
    
    // Join organization room
    socket.on('join-organization', (organizationId: string) => {
      socket.join(`org-${organizationId}`);
      logger.info(`Socket ${socket.id} joined organization ${organizationId}`);
    });
    
    // Real-time energy data updates (to be implemented)
    socket.on('energy-data-update', (data) => {
      // Broadcast to organization room
      socket.broadcast.emit('energy-data-updated', data);
    });
  });
};
