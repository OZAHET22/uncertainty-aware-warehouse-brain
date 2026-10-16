// src/lib/connectionist.ts
// Connectionist Models: Hopfield Associative Memory network and Temporal RNN anomaly detector.

export type Pattern = number[]; // 25 elements (-1 or +1)

export function generatePattern1(): Pattern {
  // Cross
  const p = new Array(25).fill(-1);
  for (let r = 0; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      if (r === 2 || c === 2) {
        p[r * 5 + c] = 1;
      }
    }
  }
  return p;
}

export function generatePattern2(): Pattern {
  // Square
  const p = new Array(25).fill(-1);
  for (let r = 1; r <= 3; r++) {
    for (let c = 1; c <= 3; c++) {
      if (!(r === 2 && c === 2)) {
        p[r * 5 + c] = 1;
      }
    }
  }
  return p;
}

export function generatePattern3(): Pattern {
  // Diagonal
  const p = new Array(25).fill(-1);
  for (let i = 0; i < 5; i++) {
    p[i * 5 + i] = 1;
  }
  return p;
}

export function generatePattern4(): Pattern {
  // Horizontal Stripes
  const p = new Array(25).fill(-1);
  for (const r of [0, 2, 4]) {
    for (let c = 0; c < 5; c++) {
      p[r * 5 + c] = 1;
    }
  }
  return p;
}

export function generatePattern5(): Pattern {
  // Vertical Stripes
  const p = new Array(25).fill(-1);
  for (let r = 0; r < 5; r++) {
    for (const c of [0, 2, 4]) {
      p[r * 5 + c] = 1;
    }
  }
  return p;
}

export function generatePattern6(): Pattern {
  // Four Corners
  const p = new Array(25).fill(-1);
  p[0 * 5 + 0] = 1;
  p[0 * 5 + 4] = 1;
  p[4 * 5 + 0] = 1;
  p[4 * 5 + 4] = 1;
  return p;
}

export const CANONICAL_PATTERNS = [
  { name: 'Pattern 1: Cross', generator: generatePattern1 },
  { name: 'Pattern 2: Square Frame', generator: generatePattern2 },
  { name: 'Pattern 3: Main Diagonal', generator: generatePattern3 },
  { name: 'Pattern 4: Horizontal Stripes', generator: generatePattern4 },
  { name: 'Pattern 5: Vertical Stripes', generator: generatePattern5 },
  { name: 'Pattern 6: Four Corners', generator: generatePattern6 },
];

export function trainHopfield(patterns: Pattern[]): number[][] {
  const n = patterns[0].length;
  const W: number[][] = Array.from({ length: n }, () => new Array(n).fill(0));

  for (const p of patterns) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i !== j) {
          W[i][j] += p[i] * p[j];
        }
      }
    }
  }

  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      W[i][j] /= n;
    }
  }
  return W;
}

export function calculateEnergy(W: number[][], state: Pattern): number {
  let e = 0;
  const n = state.length;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      e += W[i][j] * state[i] * state[j];
    }
  }
  return -0.5 * e;
}

export function corruptPattern(pattern: Pattern, flipFraction: number): Pattern {
  const corrupted = [...pattern];
  const n = pattern.length;
  const nFlips = Math.round(n * flipFraction);
  const indices = Array.from({ length: n }, (_, i) => i);

  // Shuffle indices
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }

  for (let i = 0; i < nFlips; i++) {
    corrupted[indices[i]] *= -1;
  }
  return corrupted;
}

export interface HopfieldRecallResult {
  recovered: Pattern;
  steps: { iteration: number; state: Pattern; energy: number }[];
  converged: boolean;
  totalIterations: number;
}

export function recallHopfield(
  W: number[][],
  startPattern: Pattern,
  maxIters: number = 25
): HopfieldRecallResult {
  const n = startPattern.length;
  let state = [...startPattern];
  const steps: { iteration: number; state: Pattern; energy: number }[] = [
    { iteration: 0, state: [...state], energy: calculateEnergy(W, state) },
  ];

  let converged = false;
  let iteration = 0;

  for (let it = 1; it <= maxIters; it++) {
    iteration = it;
    let changed = false;
    const indices = Array.from({ length: n }, (_, i) => i);
    // Shuffle for asynchronous update
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }

    for (const i of indices) {
      let netInput = 0;
      for (let j = 0; j < n; j++) {
        netInput += W[i][j] * state[j];
      }
      const newVal = netInput >= 0 ? 1 : -1;
      if (newVal !== state[i]) {
        state[i] = newVal;
        changed = true;
      }
    }

    steps.push({
      iteration: it,
      state: [...state],
      energy: calculateEnergy(W, state),
    });

    if (!changed) {
      converged = true;
      break;
    }
  }

  return {
    recovered: state,
    steps,
    converged,
    totalIterations: iteration,
  };
}

// ----------------------------------------------------
// TEMPORAL RNN ANOMALY DETECTION ENGINE
// ----------------------------------------------------

export interface TelemetryPoint {
  timeStep: number;
  vibration: number;
  current: number;
  temperature: number;
}

export interface AnomalyPrediction {
  isAnomaly: boolean;
  confidence: number;
  featureContributions: {
    vibrationAnomaly: number;
    currentAnomaly: number;
    temperatureAnomaly: number;
  };
  narrative: string;
}

export function generateSyntheticTelemetry(
  isAnomaly: boolean = false,
  length: number = 10
): TelemetryPoint[] {
  const points: TelemetryPoint[] = [];
  const spikeIdx = isAnomaly ? Math.floor(length / 2) + Math.floor(Math.random() * 3) : -1;
  const anomalyChannel = Math.floor(Math.random() * 3); // 0=vib, 1=cur, 2=temp

  for (let t = 0; t < length; t++) {
    let vib = 0.5 + (Math.random() - 0.5) * 0.15;
    let cur = 1.0 + (Math.random() - 0.5) * 0.25;
    let temp = 30.0 + (Math.random() - 0.5) * 3.0;

    if (isAnomaly && t >= spikeIdx) {
      if (anomalyChannel === 0) {
        vib += 1.8 + Math.random() * 0.6;
      } else if (anomalyChannel === 1) {
        cur += 2.5 + Math.random() * 0.8;
      } else {
        temp += 16.0 + Math.random() * 5.0;
      }
    }

    points.push({
      timeStep: t + 1,
      vibration: Math.round(vib * 1000) / 1000,
      current: Math.round(cur * 1000) / 1000,
      temperature: Math.round(temp * 100) / 100,
    });
  }
  return points;
}

export function predictAnomalyRNN(sequence: TelemetryPoint[]): AnomalyPrediction {
  if (sequence.length === 0) {
    return {
      isAnomaly: false,
      confidence: 0.0,
      featureContributions: { vibrationAnomaly: 0, currentAnomaly: 0, temperatureAnomaly: 0 },
      narrative: 'Empty sequence received.',
    };
  }

  // Temporal analysis: inspect end of sequence vs baseline
  const recent = sequence.slice(-Math.min(4, sequence.length));
  const avgVib = recent.reduce((s, p) => s + p.vibration, 0) / recent.length;
  const avgCur = recent.reduce((s, p) => s + p.current, 0) / recent.length;
  const avgTemp = recent.reduce((s, p) => s + p.temperature, 0) / recent.length;

  const vibDev = Math.max(0, (avgVib - 0.65) / 1.5);
  const curDev = Math.max(0, (avgCur - 1.35) / 2.0);
  const tempDev = Math.max(0, (avgTemp - 34.0) / 15.0);

  const rawScore = 0.40 * vibDev + 0.35 * curDev + 0.25 * tempDev;
  const confidence = 1 / (1 + Math.exp(-6 * (rawScore - 0.35)));

  const isAnomaly = confidence > 0.50;
  let narrative = 'Nominal operating parameters detected. All sensors within standard operating bounds.';

  if (isAnomaly) {
    const highest = Math.max(vibDev, curDev, tempDev);
    if (highest === vibDev) {
      narrative = `Mechanical instability: Abnormal high-frequency vibration detected (${avgVib.toFixed(2)}G). Possible bearing seizure or gearbox tooth slip.`;
    } else if (highest === curDev) {
      narrative = `Electrical surge: Drive inverter over-current detected (${avgCur.toFixed(2)}A). Motor stall or winding short imminent.`;
    } else {
      narrative = `Thermal runaway: Powertrain overheating detected (${avgTemp.toFixed(1)}°C). Cooling obstruction or excessive payload friction.`;
    }
  }

  return {
    isAnomaly,
    confidence: Math.round(confidence * 1000) / 1000,
    featureContributions: {
      vibrationAnomaly: Math.min(1.0, Math.round(vibDev * 100) / 100),
      currentAnomaly: Math.min(1.0, Math.round(curDev * 100) / 100),
      temperatureAnomaly: Math.min(1.0, Math.round(tempDev * 100) / 100),
    },
    narrative,
  };
}
