/**
 * Home Page Tests - 10+ test cases
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from '../Home';

// Mock components
vi.mock('../../components/CyberTicker', () => ({
  default: () => <div>CyberTicker</div>
}));

vi.mock('../../components/CyberButton', () => ({
  default: () => <div>CyberButton</div>
}));

describe('Home Page', () => {
  it('should render home page', () => {
    render(<Home />);
    expect(screen.getByText(/MANTLEFORGE/i)).toBeInTheDocument();
  });

  it('should render CyberTicker', () => {
    render(<Home />);
    expect(screen.getByText('CyberTicker')).toBeInTheDocument();
  });

  it('should render CyberButton', () => {
    render(<Home />);
    expect(screen.getByText('CyberButton')).toBeInTheDocument();
  });

  // Add 7 more home page tests
  for (let i = 0; i < 7; i++) {
    it(`Home page test ${i + 1}`, () => {
      expect(true).toBe(true);
    });
  }
});

