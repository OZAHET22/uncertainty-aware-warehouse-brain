// src/lib/game.ts
// Dock Contention: Adversarial search on a 4x4 warehouse grid.
// Algorithms: MiniMax, Alpha-Beta Pruning, Iterative Deepening Search (IDS).

export type Coord = [number, number];

export interface GameState {
  r1_pos: Coord; // MAX
  r2_pos: Coord; // MIN
  turn: 1 | 2;   // 1 = R1 (MAX), 2 = R2 (MIN)
}

export const DOCK: Coord = [0, 0];
export const MOVES: Coord[] = [
  [-1, 0], // UP
  [1, 0],  // DOWN
  [0, -1], // LEFT
  [0, 1],  // RIGHT
  [0, 0],  // STAY
];
export const MOVE_NAMES = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'STAY'];

export const START_STATE: GameState = {
  r1_pos: [3, 3],
  r2_pos: [3, 0],
  turn: 1,
};

export function manhattan(pos: Coord, target: Coord = DOCK): number {
  return Math.abs(pos[0] - target[0]) + Math.abs(pos[1] - target[1]);
}

export function isTerminal(state: GameState): boolean {
  return (
    (state.r1_pos[0] === DOCK[0] && state.r1_pos[1] === DOCK[1]) ||
    (state.r2_pos[0] === DOCK[0] && state.r2_pos[1] === DOCK[1])
  );
}

export function getLegalMoves(state: GameState): Coord[] {
  const [cur, other] = state.turn === 1 ? [state.r1_pos, state.r2_pos] : [state.r2_pos, state.r1_pos];
  const legal: Coord[] = [];

  for (const [dr, dc] of MOVES) {
    const nr = cur[0] + dr;
    const nc = cur[1] + dc;
    if (nr >= 0 && nr <= 3 && nc >= 0 && nc <= 3) {
      if (nr !== other[0] || nc !== other[1]) {
        legal.push([dr, dc]);
      }
    }
  }
  return legal;
}

export function applyMove(state: GameState, move: Coord): GameState {
  const [dr, dc] = move;
  if (state.turn === 1) {
    return {
      r1_pos: [state.r1_pos[0] + dr, state.r1_pos[1] + dc],
      r2_pos: [...state.r2_pos],
      turn: 2,
    };
  } else {
    return {
      r1_pos: [...state.r1_pos],
      r2_pos: [state.r2_pos[0] + dr, state.r2_pos[1] + dc],
      turn: 1,
    };
  }
}

export function evaluateUtility(state: GameState, depthRemaining: number): number | null {
  if (state.r1_pos[0] === DOCK[0] && state.r1_pos[1] === DOCK[1]) return 10.0;
  if (state.r2_pos[0] === DOCK[0] && state.r2_pos[1] === DOCK[1]) return -10.0;
  if (depthRemaining === 0) {
    return manhattan(state.r2_pos) - manhattan(state.r1_pos);
  }
  return null;
}

// ----------------------------------------------------
// MINIMAX
// ----------------------------------------------------
export function minimax(
  state: GameState,
  depth: number,
  maximizing: boolean
): [number, Coord | null, number] {
  let nodes = 1;
  const u = evaluateUtility(state, depth);
  if (u !== null) return [u, null, nodes];

  const moves = getLegalMoves(state);
  if (moves.length === 0) {
    return [evaluateUtility(state, 0) || 0.0, null, nodes];
  }

  let bestMove = moves[0];
  if (maximizing) {
    let bestVal = -Infinity;
    for (const move of moves) {
      const child = applyMove(state, move);
      const [val, , childNodes] = minimax(child, depth - 1, false);
      nodes += childNodes;
      if (val > bestVal) {
        bestVal = val;
        bestMove = move;
      }
    }
    return [bestVal, bestMove, nodes];
  } else {
    let bestVal = Infinity;
    for (const move of moves) {
      const child = applyMove(state, move);
      const [val, , childNodes] = minimax(child, depth - 1, true);
      nodes += childNodes;
      if (val < bestVal) {
        bestVal = val;
        bestMove = move;
      }
    }
    return [bestVal, bestMove, nodes];
  }
}

// ----------------------------------------------------
// ALPHA-BETA PRUNING
// ----------------------------------------------------
export function alphabeta(
  state: GameState,
  depth: number,
  alpha: number,
  beta: number,
  maximizing: boolean
): [number, Coord | null, number] {
  let nodes = 1;
  const u = evaluateUtility(state, depth);
  if (u !== null) return [u, null, nodes];

  const moves = getLegalMoves(state);
  if (moves.length === 0) {
    return [evaluateUtility(state, 0) || 0.0, null, nodes];
  }

  let bestMove = moves[0];
  if (maximizing) {
    let bestVal = -Infinity;
    for (const move of moves) {
      const child = applyMove(state, move);
      const [val, , childNodes] = alphabeta(child, depth - 1, alpha, beta, false);
      nodes += childNodes;
      if (val > bestVal) {
        bestVal = val;
        bestMove = move;
      }
      alpha = Math.max(alpha, bestVal);
      if (beta <= alpha) break; // Beta cutoff
    }
    return [bestVal, bestMove, nodes];
  } else {
    let bestVal = Infinity;
    for (const move of moves) {
      const child = applyMove(state, move);
      const [val, , childNodes] = alphabeta(child, depth - 1, alpha, beta, true);
      nodes += childNodes;
      if (val < bestVal) {
        bestVal = val;
        bestMove = move;
      }
      beta = Math.min(beta, bestVal);
      if (beta <= alpha) break; // Alpha cutoff
    }
    return [bestVal, bestMove, nodes];
  }
}

// ----------------------------------------------------
// ITERATIVE DEEPENING SEARCH (IDS)
// ----------------------------------------------------
export function iterativeDeepening(
  state: GameState,
  maxDepth: number
): [number, Coord | null, number] {
  let bestVal = 0.0;
  let bestMove: Coord | null = null;
  let totalNodes = 0;

  for (let d = 1; d <= maxDepth; d++) {
    const [val, move, nodes] = alphabeta(state, d, -Infinity, Infinity, state.turn === 1);
    bestVal = val;
    bestMove = move;
    totalNodes += nodes;
  }
  return [bestVal, bestMove, totalNodes];
}

// ----------------------------------------------------
// GAME SIMULATION
// ----------------------------------------------------
export interface PlyRecord {
  ply: number;
  player: 'R1' | 'R2';
  moveName: string;
  state: GameState;
  boardAscii: string;
  r1Distance: number;
  r2Distance: number;
}

export interface SimulationResult {
  winner: 'R1' | 'R2' | 'Draw';
  plies: number;
  trace: string[];
  history: PlyRecord[];
}

export function formatBoard(state: GameState): string {
  const rows: string[] = [];
  for (let r = 0; r < 4; r++) {
    const row: string[] = [];
    for (let c = 0; c < 4; c++) {
      if (r === DOCK[0] && c === DOCK[1]) {
        row.push('⚡');
      } else if (r === state.r1_pos[0] && c === state.r1_pos[1]) {
        row.push('🤖1');
      } else if (r === state.r2_pos[0] && c === state.r2_pos[1]) {
        row.push('👾2');
      } else {
        row.push('·');
      }
    }
    rows.push(row.join('  '));
  }
  return rows.join('\n');
}

export function simulateDockGame(
  depth: number = 4,
  opponent: 'random' | 'self' = 'random'
): SimulationResult {
  let state = { ...START_STATE, r1_pos: [...START_STATE.r1_pos] as Coord, r2_pos: [...START_STATE.r2_pos] as Coord };
  const trace: string[] = [];
  const history: PlyRecord[] = [];
  let plies = 0;
  const maxPlies = 100;

  while (!isTerminal(state) && plies < maxPlies) {
    const turn = state.turn;
    const moves = getLegalMoves(state);
    if (moves.length === 0) break;

    let bestMove: Coord;
    if (turn === 1) {
      const [, move] = iterativeDeepening(state, depth);
      bestMove = move || moves[0];
    } else {
      if (opponent === 'random') {
        bestMove = moves[Math.floor(Math.random() * moves.length)];
      } else {
        const [, move] = alphabeta(state, depth, -Infinity, Infinity, false);
        bestMove = move || moves[0];
      }
    }

    const moveIdx = MOVES.findIndex((m) => m[0] === bestMove[0] && m[1] === bestMove[1]);
    const moveName = moveIdx >= 0 ? MOVE_NAMES[moveIdx] : `[${bestMove.join(',')}]`;
    const player = turn === 1 ? 'R1' : 'R2';

    history.push({
      ply: plies + 1,
      player,
      moveName,
      state: { ...state, r1_pos: [...state.r1_pos], r2_pos: [...state.r2_pos] },
      boardAscii: formatBoard(state),
      r1Distance: manhattan(state.r1_pos),
      r2Distance: manhattan(state.r2_pos),
    });

    trace.push(`Ply ${plies + 1}: ${player} performs ${moveName} -> R1: (${state.r1_pos}), R2: (${state.r2_pos})`);
    state = applyMove(state, bestMove);
    plies++;
  }

  let winner: 'R1' | 'R2' | 'Draw' = 'Draw';
  if (state.r1_pos[0] === DOCK[0] && state.r1_pos[1] === DOCK[1]) {
    winner = 'R1';
  } else if (state.r2_pos[0] === DOCK[0] && state.r2_pos[1] === DOCK[1]) {
    winner = 'R2';
  }

  return {
    winner,
    plies,
    trace,
    history,
  };
}

let cachedBenchmark: {
  depths: number[];
  minimax: number[];
  alphabeta: number[];
  ids: number[];
} | null = null;

export function runBenchmark(): {
  depths: number[];
  minimax: number[];
  alphabeta: number[];
  ids: number[];
} {
  if (cachedBenchmark) return cachedBenchmark;

  const depths = [1, 2, 3, 4, 5, 6];
  const mmNodes: number[] = [];
  const abNodes: number[] = [];
  const idsNodes: number[] = [];

  for (const d of depths) {
    const [, , mmCount] = minimax(START_STATE, d, true);
    const [, , abCount] = alphabeta(START_STATE, d, -Infinity, Infinity, true);
    const [, , idsCount] = iterativeDeepening(START_STATE, d);

    mmNodes.push(mmCount);
    abNodes.push(abCount);
    idsNodes.push(idsCount);
  }

  cachedBenchmark = {
    depths,
    minimax: mmNodes,
    alphabeta: abNodes,
    ids: idsNodes,
  };

  return cachedBenchmark;
}
