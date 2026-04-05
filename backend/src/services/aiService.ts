import Incident from '../models/Incident';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

interface AIValidationPayload {
  title: string;
  description: string;
  category: string;
  media: { url: string; type: string }[];
}

interface AIValidationResponse {
  isValid: boolean;
  confidence: number;
  tags: string[];
  riskScore: number;
}

export const aiService = {
  async validateIncident(
    incidentId: string,
    payload: AIValidationPayload
  ): Promise<void> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) {
        throw new Error(`AI service returned ${response.status}`);
      }

      const result = (await response.json()) as AIValidationResponse;

      await Incident.findByIdAndUpdate(incidentId, {
        aiValidation: {
          isValid: result.isValid,
          confidence: result.confidence,
          tags: result.tags,
          validatedAt: new Date(),
        },
        riskScore: result.riskScore,
        // Auto-verify high-confidence reports
        ...(result.isValid && result.confidence > 0.85
          ? { status: 'verified' }
          : {}),
      });
    } catch (error) {
      console.error(`[AI] Failed to validate incident ${incidentId}:`, error);
    }
  },

  async classifyText(text: string): Promise<{ category: string; severity: string } | null> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/classify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
        signal: AbortSignal.timeout(10000),
      });

      if (!response.ok) return null;
      return (await response.json()) as { category: string; severity: string };
    } catch {
      return null;
    }
  },

  async analyzeImage(imageUrl: string): Promise<{ tags: string[]; description: string } | null> {
    try {
      const response = await fetch(`${AI_SERVICE_URL}/api/analyze-image`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl }),
        signal: AbortSignal.timeout(30000),
      });

      if (!response.ok) return null;
      return (await response.json()) as { tags: string[]; description: string };
    } catch {
      return null;
    }
  },
};
