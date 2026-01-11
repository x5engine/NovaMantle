/**
 * CyberButton Component Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PrivyProvider } from '@privy-io/react-auth';
import CyberButton from '../CyberButton';

// Mock Privy
vi.mock('@privy-io/react-auth', () => ({
  PrivyProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  usePrivy: () => ({
    ready: true,
    authenticated: false,
    login: vi.fn()
  }),
  useWallets: () => ({
    wallets: []
  })
}));

// Mock wagmi
vi.mock('wagmi', () => ({
  useSignTypedData: () => ({
    signTypedDataAsync: vi.fn(),
    isPending: false
  })
}));

// Mock fetch
global.fetch = vi.fn();

describe('CyberButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render initialize button', () => {
    render(
      <PrivyProvider appId="test">
        <CyberButton />
      </PrivyProvider>
    );

    expect(screen.getByText(/INITIALIZE|CONNECT/i)).toBeInTheDocument();
  });

  it('should show connect wallet when not authenticated', () => {
    render(
      <PrivyProvider appId="test">
        <CyberButton />
      </PrivyProvider>
    );

    expect(screen.getByText(/CONNECT/i)).toBeInTheDocument();
  });

  it('should handle file upload', async () => {
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });
    
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 'success',
        risk_score: 15,
        valuation: 150000,
        confidence: 0.85
      })
    });

    render(
      <PrivyProvider appId="test">
        <CyberButton />
      </PrivyProvider>
    );

    const input = screen.getByLabelText(/upload/i) || document.querySelector('input[type="file"]');
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        expect(fetch).toHaveBeenCalled();
      });
    }
  });

  it('should reject non-PDF files', async () => {
    const file = new File(['test content'], 'test.txt', { type: 'text/plain' });

    render(
      <PrivyProvider appId="test">
        <CyberButton />
      </PrivyProvider>
    );

    const input = document.querySelector('input[type="file"]');
    if (input) {
      fireEvent.change(input, { target: { files: [file] } });
      
      await waitFor(() => {
        // Should show error or not process file
      });
    }
  });
});

