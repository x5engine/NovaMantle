/**
 * AI Analyzer Tool Tests
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeAssetRisk, analyzeWithClaude } from '../../server/tools/ai_analyzer';

// Mock EmbedAPI
const mockEmbedAPI = {
  generate: vi.fn(),
  stream: vi.fn()
};

vi.mock('@embedapi/core', () => ({
  default: vi.fn(() => mockEmbedAPI)
}));

describe('AI Analyzer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.EMBEDAPI_KEY = 'test-key';
  });

  describe('analyzeWithClaude', () => {
    it('should analyze text with Claude', async () => {
      mockEmbedAPI.generate.mockResolvedValue({
        choices: [{
          message: {
            content: 'Risk analysis: This asset has moderate risk.'
          }
        }]
      });

      const result = await analyzeWithClaude('Analyze this asset');
      expect(result).toContain('Risk analysis');
      expect(mockEmbedAPI.generate).toHaveBeenCalled();
    });

    it('should handle errors gracefully', async () => {
      mockEmbedAPI.generate.mockRejectedValue(new Error('API Error'));

      await expect(analyzeWithClaude('test')).rejects.toThrow();
    });
  });

  describe('analyzeAssetRisk', () => {
    it('should extract risk score from analysis', async () => {
      mockEmbedAPI.generate.mockResolvedValue({
        choices: [{
          message: {
            content: 'Risk score: 25. Confidence: 0.85'
          }
        }]
      });

      const result = await analyzeAssetRisk('Sample PDF text', 'invoice');
      expect(result.riskScore).toBeGreaterThanOrEqual(0);
      expect(result.riskScore).toBeLessThanOrEqual(100);
      expect(result.confidence).toBeGreaterThanOrEqual(0);
      expect(result.confidence).toBeLessThanOrEqual(1);
    });

    it('should use default values on parse failure', async () => {
      mockEmbedAPI.generate.mockResolvedValue({
        choices: [{
          message: {
            content: 'No clear risk score in response'
          }
        }]
      });

      const result = await analyzeAssetRisk('Sample text', 'invoice');
      expect(result.riskScore).toBe(20); // Default
      expect(result.confidence).toBe(0.85); // Default
    });
  });
});

