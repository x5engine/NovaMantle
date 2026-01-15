/**
 * CORS Middleware
 * Configure CORS for Fastify
 */
import { FastifyInstance } from 'fastify';

import fastifyCors from '@fastify/cors';

export async function setupCORS(server: FastifyInstance) {
  await server.register(fastifyCors, {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
  });
  console.log('✅ CORS configured');
}

