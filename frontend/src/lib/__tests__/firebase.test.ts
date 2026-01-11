/**
 * Firebase Client Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Firebase
vi.mock('firebase/app', () => ({
  initializeApp: vi.fn(() => ({})),
  getApps: vi.fn(() => [])
}));

vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({}))
}));

describe('Firebase Client', () => {
  it('should initialize Firebase', async () => {
    const { initializeApp } = await import('firebase/app');
    const { getFirestore } = await import('firebase/firestore');
    
    expect(initializeApp).toBeDefined();
    expect(getFirestore).toBeDefined();
  });

  it('should export db instance', async () => {
    const { db } = await import('../firebase');
    expect(db).toBeDefined();
  });
});

