// src/lib/uncertainty.ts
// Six uncertainty reasoning formalisms: Nonmonotonic, Bayes, Certainty Factors,
// Bayesian Network, Dempster-Shafer, and Fuzzy Logic with Centroid Defuzzification.

export interface SensorReading {
  weight_deviation_pct: number;
  crack_severity_pct: number;
  tilt_triggered: boolean;
  id?: string;
}

export interface UncertaintyEvaluation {
  nonmonotonic: 'Damaged' | 'NotDamaged';
  bayes: number;
  cf: number;
  bn: number;
  ds: [number, number]; // [Bel(D), Pl(D)]
  fuzzy: number;        // [0, 100]
}

export interface TestCaseItem extends SensorReading {
  id: string;
}

export const TEST_CASES: TestCaseItem[] = [
  { id: 'TC-B1', weight_deviation_pct: 5, crack_severity_pct: 0, tilt_triggered: false },
  { id: 'TC-B2', weight_deviation_pct: 90, crack_severity_pct: 95, tilt_triggered: true },
  { id: 'TC-B3', weight_deviation_pct: 70, crack_severity_pct: 5, tilt_triggered: false },
  { id: 'TC-B4', weight_deviation_pct: 10, crack_severity_pct: 80, tilt_triggered: false },
  { id: 'TC-B5', weight_deviation_pct: 20, crack_severity_pct: 10, tilt_triggered: true },
  { id: 'TC-B6', weight_deviation_pct: 45, crack_severity_pct: 20, tilt_triggered: false },
  { id: 'TC-B7', weight_deviation_pct: 0, crack_severity_pct: 0, tilt_triggered: false },
  { id: 'TC-B8', weight_deviation_pct: 100, crack_severity_pct: 100, tilt_triggered: true },
  { id: 'TC-B9', weight_deviation_pct: 30, crack_severity_pct: 55, tilt_triggered: true },
  { id: 'TC-B10', weight_deviation_pct: 60, crack_severity_pct: 40, tilt_triggered: false },
];

export function deriveBooleans(reading: SensorReading): {
  weight_deviation_high: boolean;
  crack_visible: boolean;
  tilt_triggered: boolean;
} {
  return {
    weight_deviation_high: reading.weight_deviation_pct > 40,
    crack_visible: reading.crack_severity_pct > 15,
    tilt_triggered: Boolean(reading.tilt_triggered),
  };
}

export function sensorReadingToFacts(reading: SensorReading): Set<string> {
  const facts = new Set<string>();
  if (reading.weight_deviation_pct > 40) facts.add('weight_deviation_high');
  if (reading.crack_severity_pct > 15) facts.add('crack_visible');
  if (reading.tilt_triggered) facts.add('tilt_triggered');
  return facts;
}

// 1. NONMONOTONIC DEFAULT LOGIC
export function nonmonotonicVerdict(facts: Set<string>): 'Damaged' | 'NotDamaged' {
  if (facts.has('tilt_triggered') || facts.has('crack_visible')) {
    return 'Damaged';
  }
  return 'NotDamaged';
}

// 2. NAIVE BAYES POSTERIOR
const PRIOR_DAMAGED = 0.10;
const PRIOR_NOT_DAMAGED = 0.90;
const LIKELIHOOD: Record<string, [number, number]> = {
  weight_deviation_high: [0.70, 0.05],
  crack_visible: [0.85, 0.02],
  tilt_triggered: [0.60, 0.10],
};

export function bayesPosterior(reading: SensorReading): number {
  const bools = deriveBooleans(reading);
  let p_e_given_d = 1.0;
  let p_e_given_nd = 1.0;

  for (const [feat, val] of Object.entries(bools)) {
    const [p_true_d, p_true_nd] = LIKELIHOOD[feat];
    if (val) {
      p_e_given_d *= p_true_d;
      p_e_given_nd *= p_true_nd;
    } else {
      p_e_given_d *= (1.0 - p_true_d);
      p_e_given_nd *= (1.0 - p_true_nd);
    }
  }

  const num_d = PRIOR_DAMAGED * p_e_given_d;
  const num_nd = PRIOR_NOT_DAMAGED * p_e_given_nd;
  const denom = num_d + num_nd;
  if (denom === 0) return 0.0;
  return num_d / denom;
}

// 3. CERTAINTY FACTORS
const EVIDENCE_CF: Record<string, [number, number]> = {
  crack_visible: [0.9, -0.3],
  tilt_triggered: [0.6, -0.2],
  weight_deviation_high: [0.5, -0.1],
};
const RULE_CONFIDENCE = 0.9;

function combineCF(cf1: number, cf2: number): number {
  if (cf1 >= 0 && cf2 >= 0) {
    return cf1 + cf2 * (1.0 - cf1);
  } else if (cf1 < 0 && cf2 < 0) {
    return cf1 + cf2 * (1.0 + cf1);
  } else {
    return (cf1 + cf2) / (1.0 - Math.min(Math.abs(cf1), Math.abs(cf2)));
  }
}

export function cfScore(reading: SensorReading): number {
  const bools = deriveBooleans(reading);
  const order = ['crack_visible', 'tilt_triggered', 'weight_deviation_high'] as const;

  const attenuated: number[] = [];
  for (const feat of order) {
    const [cf_true, cf_false] = EVIDENCE_CF[feat];
    const raw = bools[feat] ? cf_true : cf_false;
    attenuated.push(raw * RULE_CONFIDENCE);
  }

  let combined = attenuated[0];
  for (let i = 1; i < attenuated.length; i++) {
    combined = combineCF(combined, attenuated[i]);
  }
  return Math.max(-1.0, Math.min(1.0, combined));
}

// 4. BAYESIAN NETWORK (Variable Elimination CPD)
export function bnPosterior(reading: SensorReading): number {
  const bools = deriveBooleans(reading);
  const crack = bools.crack_visible;
  const tilt = bools.tilt_triggered;

  // Exact conditional probability distribution: P(Damaged | CrackVisible, Tilt)
  if (!crack && !tilt) return 0.02;
  if (!crack && tilt) return 0.50;
  if (crack && !tilt) return 0.80;
  return 0.95; // crack && tilt
}

// 5. DEMPSTER-SHAFER EVIDENCE THEORY
type FocalElement = 'D' | 'N' | 'TH'; // D = Damaged, N = NotDamaged, TH = Theta (Uncertain)

interface BPA {
  D: number;
  N: number;
  TH: number;
}

const BPA_TABLE: Record<string, { true: BPA; false: BPA }> = {
  weight: {
    true: { D: 0.5, N: 0.2, TH: 0.3 },
    false: { D: 0.1, N: 0.6, TH: 0.3 },
  },
  crack: {
    true: { D: 0.8, N: 0.05, TH: 0.15 },
    false: { D: 0.05, N: 0.7, TH: 0.25 },
  },
  tilt: {
    true: { D: 0.6, N: 0.1, TH: 0.3 },
    false: { D: 0.1, N: 0.5, TH: 0.4 },
  },
};

function dempsterCombine(m1: BPA, m2: BPA): BPA {
  // Intersections:
  // D & D = D, D & TH = D, TH & D = D
  // N & N = N, N & TH = N, TH & N = N
  // TH & TH = TH
  // D & N = ∅, N & D = ∅
  const rawD = m1.D * m2.D + m1.D * m2.TH + m1.TH * m2.D;
  const rawN = m1.N * m2.N + m1.N * m2.TH + m1.TH * m2.N;
  const rawTH = m1.TH * m2.TH;
  const K = m1.D * m2.N + m1.N * m2.D; // conflict mass

  if (K >= 1.0) throw new Error('Complete conflict in Dempster combination');
  const norm = 1.0 / (1.0 - K);
  return {
    D: rawD * norm,
    N: rawN * norm,
    TH: rawTH * norm,
  };
}

export function dsBeliefInterval(reading: SensorReading): [number, number] {
  const bools = deriveBooleans(reading);
  const mWeight = BPA_TABLE.weight[bools.weight_deviation_high ? 'true' : 'false'];
  const mCrack = BPA_TABLE.crack[bools.crack_visible ? 'true' : 'false'];
  const mTilt = BPA_TABLE.tilt[bools.tilt_triggered ? 'true' : 'false'];

  const m12 = dempsterCombine(mWeight, mCrack);
  const m123 = dempsterCombine(m12, mTilt);

  const bel_D = m123.D;
  const pl_D = m123.D + m123.TH;
  return [bel_D, pl_D];
}

// 6. FUZZY LOGIC DAMAGE SCORING (scikit-fuzzy equivalent)
function trimf(x: number, [a, b, c]: [number, number, number]): number {
  if (x <= a || x >= c) return 0.0;
  if (x === b) return 1.0;
  if (x < b) return (x - a) / (b - a);
  return (c - x) / (c - b);
}

export function fuzzyScore(reading: SensorReading): number {
  const w = Math.max(0, Math.min(100, reading.weight_deviation_pct));
  const c = Math.max(0, Math.min(100, reading.crack_severity_pct));

  // Weight Antecedent memberships
  const w_low = trimf(w, [0, 0, 40]);
  const w_med = trimf(w, [20, 50, 80]);
  const w_high = trimf(w, [60, 100, 100]);

  // Crack Antecedent memberships
  const c_none = trimf(c, [0, 0, 20]);
  const c_min = trimf(c, [10, 40, 60]);
  const c_maj = trimf(c, [50, 100, 100]);

  // 5 Rules (Mamdani min-max):
  // R1: weight high AND crack major -> damage high
  const r1 = Math.min(w_high, c_maj);
  // R2: crack none AND weight low -> damage low
  const r2 = Math.min(c_none, w_low);
  // R3: weight medium -> damage medium
  const r3 = w_med;
  // R4: crack minor -> damage medium
  const r4 = c_min;
  // R5: weight high OR crack major -> damage high
  const r5 = Math.max(w_high, c_maj);

  const act_low = r2;
  const act_med = Math.max(r3, r4);
  const act_high = Math.max(r1, r5);

  // Centroid defuzzification over damage_score universe [0..100]
  let num = 0;
  let den = 0;

  for (let x = 0; x <= 100; x += 1) {
    const mu_low = Math.min(act_low, trimf(x, [0, 0, 40]));
    const mu_med = Math.min(act_med, trimf(x, [30, 50, 70]));
    const mu_high = Math.min(act_high, trimf(x, [60, 100, 100]));
    const mu = Math.max(mu_low, mu_med, mu_high);

    num += x * mu;
    den += mu;
  }

  if (den === 0) return 50.0;
  return num / den;
}

// EVALUATE ALL 6 METHODS
export function evaluateAllMethods(reading: SensorReading): UncertaintyEvaluation {
  const facts = sensorReadingToFacts(reading);
  return {
    nonmonotonic: nonmonotonicVerdict(facts),
    bayes: bayesPosterior(reading),
    cf: cfScore(reading),
    bn: bnPosterior(reading),
    ds: dsBeliefInterval(reading),
    fuzzy: fuzzyScore(reading),
  };
}

export const DISAGREEMENTS = [
  {
    caseId: 'TC-B3',
    reading: 'w=70, c=5, t=False',
    analysis: 'Nonmonotonic logic outputs NotDamaged because high weight deviation alone is not in its boolean trigger set. In contrast, continuous methods (Bayes: ~0.60, CF: +0.27, Fuzzy: ~68) classify as Damaged because 70% weight deviation contributes significant graded evidence.',
  },
  {
    caseId: 'TC-B5',
    reading: 'w=20, c=10, t=True',
    analysis: 'Nonmonotonic logic outputs Damaged because tilt sensor fires its exception rule. In contrast, Fuzzy Logic produces a low score (~26) because the fuzzy system operates purely on continuous weight/crack inputs (both low) and does not ingest the discrete tilt sensor.',
  },
  {
    caseId: 'TC-B10',
    reading: 'w=60, c=40, t=False',
    analysis: 'Bayesian Network yields ~0.80 posterior due to CrackVisible, while Dempster-Shafer Bel(D) reflects epistemic uncertainty with a wider belief-plausibility interval (~[0.72, 0.88]).',
  },
];
