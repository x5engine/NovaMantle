/**
 * AI Analyzer Tool using EmbedAPI
 * Provides AI analysis capabilities for the Agent
 */
// @ts-ignore - EmbedAPI may not have proper types
import EmbedAPIClient from '@embedapi/core';

const EMBEDAPI_KEY = process.env.EMBEDAPI_KEY || '';

if (!EMBEDAPI_KEY) {
  console.warn('⚠️  EMBEDAPI_KEY not set. AI analysis will not work.');
}

const embedapi = EMBEDAPI_KEY ? new EmbedAPIClient(EMBEDAPI_KEY) : null;

export interface AnalysisResult {
  reasoning: string;
  riskScore?: number;
  confidence?: number;
}

/**
 * Analyze text using Claude 3.5 Sonnet
 */
export async function analyzeWithClaude(
  prompt: string,
  systemPrompt?: string
): Promise<string> {
  if (!embedapi) {
    throw new Error('EmbedAPI not initialized. Set EMBEDAPI_KEY in environment.');
  }

  try {
    const response = await embedapi.generate({
      service: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      messages: [
        ...(systemPrompt ? [{
          role: 'system',
          content: systemPrompt
        }] : []),
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: 1000
    });

    // Extract response from EmbedAPI format
    return response.choices?.[0]?.message?.content || 
           response.content || 
           response.text || 
           '';
  } catch (error: any) {
    console.error('Error in Claude analysis:', error);
    throw error;
  }
}

/**
 * Stream analysis (for real-time responses)
 */
export async function* streamAnalysisWithClaude(
  prompt: string,
  systemPrompt?: string
): AsyncGenerator<string, void, unknown> {
  if (!embedapi) {
    throw new Error('EmbedAPI not initialized. Set EMBEDAPI_KEY in environment.');
  }

  try {
    const streamResponse = await embedapi.stream({
      service: 'anthropic',
      model: 'claude-3-5-sonnet-20241022',
      messages: [
        ...(systemPrompt ? [{
          role: 'system',
          content: systemPrompt
        }] : []),
        {
          role: 'user',
          content: prompt
        }
      ],
      maxTokens: 1000
    });

    // Process the stream
    const reader = streamResponse.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content' && data.content) {
              yield data.content;
            }
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }
  } catch (error: any) {
    console.error('Error in Claude streaming:', error);
    throw error;
  }
}

/**
 * Analyze risk for an asset
 */
export async function analyzeAssetRisk(
  pdfText: string,
  assetType: string = 'invoice'
): Promise<AnalysisResult> {
  const systemPrompt = `You are a risk analyst for Real-World Asset (RWA) tokenization.
Analyze the provided asset information and provide:
1. A risk score from 0-100 (lower is better)
2. Your reasoning
3. Confidence level (0-1)

Asset types: invoice, real_estate, bond`;

  const prompt = `Analyze this ${assetType} asset:

${pdfText.substring(0, 2000)}...

Provide:
- Risk score (0-100)
- Brief reasoning
- Confidence (0-1)`;

  try {
    const reasoning = await analyzeWithClaude(prompt, systemPrompt);
    
    // Extract risk score from reasoning (simple parsing)
    const riskMatch = reasoning.match(/risk score[:\s]+(\d+)/i);
    const riskScore = riskMatch ? parseInt(riskMatch[1]) : 20; // Default to 20
    
    const confidenceMatch = reasoning.match(/confidence[:\s]+([\d.]+)/i);
    const confidence = confidenceMatch ? parseFloat(confidenceMatch[1]) : 0.85;

    return {
      reasoning,
      riskScore: Math.min(100, Math.max(0, riskScore)),
      confidence: Math.min(1, Math.max(0, confidence))
    };
  } catch (error: any) {
    console.error('Error analyzing asset risk:', error);
    // Fallback
    return {
      reasoning: 'Analysis failed, using default risk score',
      riskScore: 20,
      confidence: 0.5
    };
  }
}

