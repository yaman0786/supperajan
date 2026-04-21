export type Decision = "YAP" | "YAPMA" | "DİKKATLİ OL";
export type DecisionColor = "green" | "yellow" | "red";

export interface AnalyzeResponse {
  decision: Decision;
  decision_color: DecisionColor;
  risk: number;
  confidence: number;
  category: string;
  summary: string;
  reasons: string[];
  suggestions: string[];
}
