/**
 * Agent Tool: Consult Risk Model
 * Calls Python SaaS API for risk analysis
 */

export interface RiskAnalysisResult {
  risk_score: number;
  valuation: number;
  asset_type: string;
  extracted_data: any;
  confidence?: number;
}

export async function consultRiskModel(
  pythonSaaSUrl: string,
  assetData: {
    asset_type?: string;
    pdf_text?: string;
    valuation?: number;
  }
): Promise<RiskAnalysisResult> {
  try {
    const response = await fetch(`${pythonSaaSUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(assetData),
    });

    if (!response.ok) {
      throw new Error(`Risk model API error: ${response.statusText}`);
    }

    const data = await response.json() as any;

    if (data.status !== 'success') {
      throw new Error(data.message || 'Risk analysis failed');
    }

    return {
      risk_score: data.risk_score || 20,
      valuation: data.valuation || 150000,
      asset_type: data.asset_type || 'invoice',
      extracted_data: data.extracted_data || {},
      confidence: data.confidence || 0.85,
    };
  } catch (error: any) {
    console.error('Error consulting risk model:', error);
    throw error;
  }
}

