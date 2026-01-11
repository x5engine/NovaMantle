/**
 * Test setup file
 */
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock window.ethereum
global.window.ethereum = {
  request: vi.fn(),
  isMetaMask: true
} as any;

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}));

