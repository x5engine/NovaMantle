/**
 * Risk Model Tool Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { consultRiskModel } from '../../server/tools/consult_risk_model';

// Mock fetch
global.fetch = vi.fn();

describe('Consult Risk Model', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call Python SaaS API', async () => {
    const mockResponse = {
      status: 'success',
      risk_score: 15,
      valuation: 150000,
      asset_type: 'invoice',
      extracted_data: {},
      confidence: 0.85
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });

    const result = await consultRiskModel('http://localhost:5000', {
      asset_type: 'invoice',
      pdf_text: 'Sample text'
    });

    expect(result.risk_score).toBe(15);
    expect(result.valuation).toBe(150000);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/analyze',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
    );
  });

  it('should handle API errors', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      statusText: 'Internal Server Error'
    });

    await expect(
      consultRiskModel('http://localhost:5000', {
        asset_type: 'invoice'
      })
    ).rejects.toThrow();
  });

  it('should handle network errors', async () => {
    (fetch as any).mockRejectedValue(new Error('Network error'));

    await expect(
      consultRiskModel('http://localhost:5000', {
        asset_type: 'invoice'
      })
    ).rejects.toThrow('Network error');
  });
});

