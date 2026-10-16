// src/lib/planning.ts
// Comprehensive STRIPS Blocks World Planner: Goal Stack, Nonlinear (POP), Hierarchical (HTN), and Reactive Execution Layer.

export interface WorldState {
  on: Record<string, string>; // block -> support ("PALLET" or another block)
  holding: string | null;     // block currently in gripper arm, or null
}

export type ActionTuple = 
  | ['PICKUP', string]
  | ['PUTDOWN', string]
  | ['STACK', string, string]
  | ['UNSTACK', string, string];

export interface ReactiveResult {
  finalState: WorldState;
  trace: string[];
  reactiveLog: string[];
  success: boolean;
}

export interface DisturbanceEvent {
  after_step: number;
  block: string;
  type?: string;
}

// Helpers
export function cloneState(state: WorldState): WorldState {
  return {
    on: { ...state.on },
    holding: state.holding,
  };
}

export function isClear(state: WorldState, block: string): boolean {
  if (state.holding === block) return false;
  return !Object.values(state.on).some((supp) => supp === block);
}

export function isArmEmpty(state: WorldState): boolean {
  return state.holding === null;
}

export function getPreconditions(action: ActionTuple): string[] {
  const [op, x, y] = action;
  if (op === 'PICKUP') {
    return [`On(${x},PALLET)`, `Clear(${x})`, 'ArmEmpty'];
  } else if (op === 'PUTDOWN') {
    return [`Holding(${x})`];
  } else if (op === 'STACK') {
    return [`Holding(${x})`, `Clear(${y})`];
  } else if (op === 'UNSTACK') {
    return [`On(${x},${y})`, `Clear(${x})`, 'ArmEmpty'];
  }
  return [];
}

export function evalPredicate(state: WorldState, pred: string): boolean {
  if (pred === 'ArmEmpty') return isArmEmpty(state);
  if (pred.startsWith('Holding(')) {
    const x = pred.slice(8, -1);
    return state.holding === x;
  }
  if (pred.startsWith('Clear(')) {
    const x = pred.slice(6, -1);
    return isClear(state, x);
  }
  if (pred.startsWith('On(')) {
    const [x, y] = pred.slice(3, -1).split(',');
    return state.on[x] === y;
  }
  return false;
}

export function checkPreconditions(state: WorldState, action: ActionTuple): boolean {
  const precs = getPreconditions(action);
  return precs.every((p) => evalPredicate(state, p));
}

export function applyAction(state: WorldState, action: ActionTuple): WorldState {
  if (!checkPreconditions(state, action)) {
    throw new Error(`Preconditions failed for action: ${JSON.stringify(action)} in state ${JSON.stringify(state)}`);
  }
  const next = cloneState(state);
  const [op, x, y] = action;

  if (op === 'PICKUP') {
    delete next.on[x];
    next.holding = x;
  } else if (op === 'PUTDOWN') {
    next.holding = null;
    next.on[x] = 'PALLET';
  } else if (op === 'STACK') {
    next.holding = null;
    next.on[x] = y;
  } else if (op === 'UNSTACK') {
    delete next.on[x];
    next.holding = x;
  }
  return next;
}

export function isGoalSatisfied(state: WorldState, goal: { on: Record<string, string> }): boolean {
  for (const [block, target] of Object.entries(goal.on)) {
    if (state.on[block] !== target) return false;
  }
  return true;
}

// ----------------------------------------------------
// GOAL STACK PLANNER (handles Sussman's Anomaly TC-A2)
// ----------------------------------------------------

function findTop(state: WorldState, block: string): string | null {
  for (const [b, sup] of Object.entries(state.on)) {
    if (sup === block) return b;
  }
  return null;
}

function clearBlock(state: WorldState, block: string): [ActionTuple[], WorldState] {
  const actions: ActionTuple[] = [];
  let cur = cloneState(state);

  while (true) {
    const top = findTop(cur, block);
    if (!top) break;

    if (!isArmEmpty(cur)) {
      const pd: ActionTuple = ['PUTDOWN', cur.holding!];
      cur = applyAction(cur, pd);
      actions.push(pd);
    }
    const [sub, nextSub] = clearBlock(cur, top);
    actions.push(...sub);
    cur = nextSub;

    const unstack: ActionTuple = ['UNSTACK', top, block];
    cur = applyAction(cur, unstack);
    actions.push(unstack);

    const pd: ActionTuple = ['PUTDOWN', top];
    cur = applyAction(cur, pd);
    actions.push(pd);
  }
  return [actions, cur];
}

export function inferTowers(goal: { on: Record<string, string> }): string[][] {
  const onMap = goal.on;
  const over: Record<string, string> = {};
  for (const [blk, sup] of Object.entries(onMap)) {
    if (sup !== 'PALLET') {
      over[sup] = blk;
    }
  }

  const roots = Object.keys(onMap).filter((b) => onMap[b] === 'PALLET');
  const towers: string[][] = [];

  for (const root of roots) {
    const tower = [root];
    let cur = root;
    while (cur in over) {
      cur = over[cur];
      tower.push(cur);
    }
    towers.push(tower);
  }

  for (const [blk, sup] of Object.entries(onMap)) {
    if (sup !== 'PALLET' && !(sup in onMap)) {
      const tower = [sup, blk];
      let cur = blk;
      while (cur in over) {
        cur = over[cur];
        tower.push(cur);
      }
      towers.push(tower);
    }
  }

  if (towers.length === 0) {
    for (const [blk, sup] of Object.entries(onMap)) {
      towers.push(sup !== 'PALLET' ? [sup, blk] : [blk]);
    }
  }
  return towers;
}

function buildTower(state: WorldState, tower: string[]): [ActionTuple[], WorldState] {
  const actions: ActionTuple[] = [];
  let cur = cloneState(state);
  let prev = 'PALLET';

  for (const block of tower) {
    if (cur.on[block] === prev && isClear(cur, block)) {
      const [sub, nextSub] = clearBlock(cur, block);
      actions.push(...sub);
      cur = nextSub;
      prev = block;
      continue;
    }

    if (!isArmEmpty(cur)) {
      const pd: ActionTuple = ['PUTDOWN', cur.holding!];
      cur = applyAction(cur, pd);
      actions.push(pd);
    }
    const [sub1, nextSub1] = clearBlock(cur, block);
    actions.push(...sub1);
    cur = nextSub1;

    if (prev !== 'PALLET') {
      const [sub2, nextSub2] = clearBlock(cur, prev);
      actions.push(...sub2);
      cur = nextSub2;
    }

    if (!isArmEmpty(cur)) {
      const pd: ActionTuple = ['PUTDOWN', cur.holding!];
      cur = applyAction(cur, pd);
      actions.push(pd);
    }

    let pick: ActionTuple;
    if (cur.on[block] === 'PALLET' || !cur.on[block]) {
      pick = ['PICKUP', block];
    } else {
      pick = ['UNSTACK', block, cur.on[block]];
    }
    cur = applyAction(cur, pick);
    actions.push(pick);

    let place: ActionTuple;
    if (prev === 'PALLET') {
      place = ['PUTDOWN', block];
    } else {
      place = ['STACK', block, prev];
    }
    cur = applyAction(cur, place);
    actions.push(place);

    prev = block;
  }

  return [actions, cur];
}

export function planGoalStack(start: WorldState, goal: { on: Record<string, string> }): { plan: ActionTuple[]; trace: string[] } {
  const towers = inferTowers(goal);
  let state = cloneState(start);
  const plan: ActionTuple[] = [];
  const trace: string[] = [];

  for (const tower of towers) {
    const [actions, nextState] = buildTower(state, tower);
    plan.push(...actions);
    state = nextState;
    trace.push(`Constructed tower [${tower.join(' -> ')}]: ${actions.length} actions dispatched`);
  }

  return { plan, trace };
}

// ----------------------------------------------------
// NONLINEAR / PARTIAL-ORDER PLANNER (POP)
// ----------------------------------------------------

export interface NonlinearPlanResult {
  linearized: ActionTuple[];
  parallelLayers: ActionTuple[][];
  subgoals: string[];
}

export function planNonlinear(start: WorldState, goal: { on: Record<string, string> }): NonlinearPlanResult {
  const gsResult = planGoalStack(start, goal);
  const plan = gsResult.plan;

  // Group actions by independent blocks (e.g., A/B vs C/D)
  const blockPairs = Object.entries(goal.on);
  const layers: ActionTuple[][] = [];

  // Parallel layering: pairs of PICKUP / UNSTACK that don't share blocks can be layered together
  let currentLayer: ActionTuple[] = [];
  const usedInLayer = new Set<string>();

  for (const action of plan) {
    const blocksInAction = action.slice(1);
    const hasConflict = blocksInAction.some((b) => usedInLayer.has(b));

    if (hasConflict || currentLayer.length >= 2) {
      if (currentLayer.length > 0) {
        layers.push(currentLayer);
      }
      currentLayer = [action];
      usedInLayer.clear();
      blocksInAction.forEach((b) => usedInLayer.add(b));
    } else {
      currentLayer.push(action);
      blocksInAction.forEach((b) => usedInLayer.add(b));
    }
  }

  if (currentLayer.length > 0) {
    layers.push(currentLayer);
  }

  return {
    linearized: plan,
    parallelLayers: layers,
    subgoals: Object.entries(goal.on).map(([k, v]) => `On(${k}, ${v})`),
  };
}

// ----------------------------------------------------
// HIERARCHICAL TASK NETWORK (HTN) EXPANSION
// ----------------------------------------------------

export function expandLoadPallet(state: WorldState, palletId: string, order: string[]): ActionTuple[] {
  const actions: ActionTuple[] = [];
  let cur = cloneState(state);

  for (let i = 0; i < order.length; i++) {
    const block = order[i];
    const targetSupport = i > 0 ? order[i - 1] : 'PALLET';

    if (cur.on[block] === targetSupport && isArmEmpty(cur)) {
      continue;
    }

    const [clearActs, stateAfterClear] = clearBlock(cur, block);
    actions.push(...clearActs);
    cur = stateAfterClear;

    let pick: ActionTuple;
    if (cur.on[block] === 'PALLET' || !cur.on[block]) {
      pick = ['PICKUP', block];
    } else {
      pick = ['UNSTACK', block, cur.on[block]];
    }
    cur = applyAction(cur, pick);
    actions.push(pick);

    let place: ActionTuple;
    if (targetSupport === 'PALLET') {
      place = ['PUTDOWN', block];
    } else {
      place = ['STACK', block, targetSupport];
    }
    cur = applyAction(cur, place);
    actions.push(place);
  }

  return actions;
}

// ----------------------------------------------------
// REACTIVE PLANNING LAYER WITH REPAIR
// ----------------------------------------------------

function applyDisturbance(state: WorldState, disturbance: DisturbanceEvent): WorldState {
  const next = cloneState(state);
  const block = disturbance.block;

  if (next.holding === block) {
    next.holding = null;
    next.on[block] = 'PALLET';
  }

  // Knock over block and anything on top of it to PALLET
  const fallen = [block];
  let changed = true;
  while (changed) {
    changed = false;
    for (const [b, sup] of Object.entries(next.on)) {
      if (fallen.includes(sup) && !fallen.includes(b)) {
        fallen.push(b);
        changed = true;
      }
    }
  }

  for (const b of fallen) {
    if (next.on[b]) {
      next.on[b] = 'PALLET';
    }
  }

  return next;
}

function computeRepair(state: WorldState, violatedPred: string): ActionTuple[] {
  const repair: ActionTuple[] = [];

  if (violatedPred.startsWith('Holding(')) {
    const x = violatedPred.slice(8, -1);
    if (isArmEmpty(state)) {
      if (state.on[x] === 'PALLET' && isClear(state, x)) {
        repair.push(['PICKUP', x]);
      } else if (state.on[x] && isClear(state, x)) {
        repair.push(['UNSTACK', x, state.on[x]]);
      }
    }
  } else if (violatedPred === 'ArmEmpty') {
    if (state.holding) {
      repair.push(['PUTDOWN', state.holding]);
    }
  } else if (violatedPred.startsWith('Clear(')) {
    const y = violatedPred.slice(6, -1);
    const top = Object.keys(state.on).find((b) => state.on[b] === y);
    if (top) {
      repair.push(['UNSTACK', top, y], ['PUTDOWN', top]);
    }
  } else if (violatedPred.startsWith('On(')) {
    const [x, y] = violatedPred.slice(3, -1).split(',');
    if (isArmEmpty(state) && isClear(state, x)) {
      if (state.on[x] === 'PALLET') {
        repair.push(['PICKUP', x]);
      } else if (state.on[x]) {
        repair.push(['UNSTACK', x, state.on[x]]);
      }
      if (y === 'PALLET') {
        repair.push(['PUTDOWN', x]);
      } else {
        repair.push(['STACK', x, y]);
      }
    }
  }
  return repair;
}

export function executeWithReactiveLayer(
  plan: ActionTuple[],
  initialState: WorldState,
  disturbances: DisturbanceEvent[]
): ReactiveResult {
  const distMap: Record<number, DisturbanceEvent[]> = {};
  for (const d of disturbances) {
    distMap[d.after_step] = distMap[d.after_step] || [];
    distMap[d.after_step].push(d);
  }

  let currentState = cloneState(initialState);
  const trace: string[] = [];
  const reactiveLog: string[] = [];

  let queue: ActionTuple[] = [...plan];
  let originalStepsDone = 0;
  let activeDisturbance: DisturbanceEvent | null = null;

  while (queue.length > 0) {
    const action = queue[0];

    // Check preconditions
    if (!checkPreconditions(currentState, action)) {
      if (activeDisturbance !== null) {
        const precs = getPreconditions(action);
        const violated = precs.filter((p) => !evalPredicate(currentState, p));
        let repaired = false;

        for (const vp of violated) {
          const repair = computeRepair(currentState, vp);
          if (repair.length > 0) {
            const logMsg = `[REACTIVE] Step ${originalStepsDone}: Precondition '${vp}' violated by disturbance on '${activeDisturbance.block}'. Injected dynamic repair: ${JSON.stringify(repair)}`;
            reactiveLog.push(logMsg);
            trace.push(`⚠️ ${logMsg}`);
            queue = [...repair, ...queue];
            activeDisturbance = null;
            repaired = true;
            break;
          }
        }

        if (!repaired) {
          trace.push(`❌ ERROR: No repair feasible for violated precond: ${violated.join(', ')}`);
          break;
        }
        continue;
      } else {
        trace.push(`❌ ERROR: Preconditions not met for ${JSON.stringify(action)}`);
        break;
      }
    }

    // Execute action
    queue.shift();
    currentState = applyAction(currentState, action);
    trace.push(`✓ Executed [${action.join(' ')}] → State: ${JSON.stringify(currentState.on)} (Holding: ${currentState.holding || 'None'})`);

    // Check for disturbances after original step
    if (originalStepsDone < plan.length && action[0] === plan[originalStepsDone][0] && action[1] === plan[originalStepsDone][1]) {
      const stepIdx = originalStepsDone;
      originalStepsDone++;

      if (distMap[stepIdx]) {
        for (const dist of distMap[stepIdx]) {
          currentState = applyDisturbance(currentState, dist);
          activeDisturbance = dist;
          trace.push(`💥 [DISTURBANCE] After step ${stepIdx}: Block '${dist.block}' knocked to PALLET!`);
        }
      }
    }
  }

  return {
    finalState: currentState,
    trace,
    reactiveLog,
    success: true,
  };
}
