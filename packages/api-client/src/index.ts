export type PairingScores = {
  affinity: number;
  contrast: number;
  culture: number;
  global: number;
};

export type PairingResult = {
  runId: string;
  scores: PairingScores;
  coverage: number;
  confidence: number;
};
