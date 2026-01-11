/**
 * CORS Middleware
 * Configure CORS for Fastify
 */
import { FastifyInstance } from 'fastify';

export async function setupCORS(server: FastifyInstance) {
  await server.register(require('@fastify/cors'), {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
  });
}

