import { z } from 'zod';

export const RiskAssessmentResultSchema = z.object({
  id: z.string().uuid().optional(),
  workerId: z.string().uuid(),
  modelVersionId: z.string().uuid(),
  assessmentDate: z.string().datetime(),
  
  // Layer 1: Skor Klinis Klasik
  framinghamRiskPercent10Yr: z.number().min(0).max(100),
  whoSearoRiskPercent10Yr: z.number().min(0).max(100),
  ascvdRiskPercent10Yr: z.number().min(0).max(100).optional(),
  
  // Layer 2 & 3: Model Prediksi ML & Deep Learning
  mlBaselineRiskProb: z.number().min(0).max(1),
  dlFusionRiskProb: z.number().min(0).max(1),
  
  // Stratifikasi Risiko & Ketidakpastian
  riskTier: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
  uncertaintyLower: z.number().min(0).max(1),
  uncertaintyUpper: z.number().min(0).max(1),
  uncertaintyFlag: z.boolean().default(false), // True jika interval > ambang keyakinan (perlu review dokter)
  
  // Atribusi XAI
  shapAttributions: z.record(z.string(), z.number()),
  temporalWeights: z.array(z.number()).optional(),
  plainLanguageExplanation: z.string(),
  
  // Rekomendasi K3 & Status Medevac
  clinicalRecommendation: z.string(),
  medevacAlertFlag: z.boolean().default(false),
  workRestrictionSuggested: z.string().optional()
});

export type RiskAssessmentResult = z.infer<typeof RiskAssessmentResultSchema>;
