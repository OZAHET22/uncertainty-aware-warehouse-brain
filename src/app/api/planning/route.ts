// src/app/api/planning/route.ts
import { NextResponse } from 'next/server';
import {
  planGoalStack,
  planNonlinear,
  expandLoadPallet,
  executeWithReactiveLayer,
  inferTowers,
  isGoalSatisfied,
  WorldState,
  DisturbanceEvent,
} from '@/lib/planning';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const start: WorldState = body.start || { on: { C: 'A', A: 'PALLET', B: 'PALLET' }, holding: null };
    const goal: { on: Record<string, string> } = body.goal || { on: { A: 'B', B: 'C' } };
    const disturbances: DisturbanceEvent[] = body.disturbances || [{ after_step: 0, block: 'A' }];

    // 1. Goal Stack Plan
    const gs = planGoalStack(start, goal);

    // 2. Nonlinear Plan (POP)
    const pop = planNonlinear(start, goal);

    // 3. Hierarchical Plan (HTN)
    const towers = inferTowers(goal);
    const htnOrder = towers.length > 0 ? towers[0] : Object.keys(goal.on);
    const htn = expandLoadPallet(start, 'PALLET_A', htnOrder);

    // 4. Reactive Execution Layer
    const reactive = executeWithReactiveLayer(gs.plan, start, disturbances);
    const satisfied = isGoalSatisfied(reactive.finalState, goal);

    return NextResponse.json({
      success: true,
      goalStack: {
        plan: gs.plan,
        trace: gs.trace,
        steps: gs.plan.length,
      },
      nonlinear: {
        linearized: pop.linearized,
        parallelLayers: pop.parallelLayers,
        layerCount: pop.parallelLayers.length,
      },
      hierarchical: {
        inferredOrder: htnOrder,
        actions: htn,
      },
      reactive: {
        finalState: reactive.finalState,
        trace: reactive.trace,
        reactiveLog: reactive.reactiveLog,
        goalSatisfied: satisfied,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
