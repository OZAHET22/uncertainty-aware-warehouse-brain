// src/lib/integration.ts
// Integrated Warehouse Shift Simulation & Central Control Loop.
// Dispatches events across Module A (Planning), Module B (Uncertainty),
// Module C (Game Playing), and Module E (Expert System).

import { planGoalStack, executeWithReactiveLayer, WorldState } from './planning';
import { evaluateAllMethods, SensorReading, UncertaintyEvaluation } from './uncertainty';
import { simulateDockGame, SimulationResult } from './game';
import { runForwardChaining, DiagnosisResult } from './expertSystem';

export type ShiftEventType = 'sensor_reading' | 'disturbance' | 'dock_request';

export interface ShiftEvent {
  id: string;
  index: number;
  type: ShiftEventType;
  timestamp: string;
  data?: SensorReading & {
    vibration?: number;
    current?: number;
    temperature?: number;
    wheel_rpm_mismatch?: boolean;
    battery_voltage_low?: boolean;
  };
  disturbance?: {
    after_step: number;
    block: string;
  };
  opponent?: 'random' | 'self';
}

export interface EventDispatchResult {
  event: ShiftEvent;
  module: 'Module B & E' | 'Module A' | 'Module C';
  summary: string;
  details: {
    uncertainty?: UncertaintyEvaluation;
    expertDiagnosis?: DiagnosisResult;
    reactivePlanning?: {
      repairFired: boolean;
      reactiveLog: string[];
      steps: number;
    };
    dockContention?: SimulationResult;
  };
  severity: 'nominal' | 'warning' | 'critical' | 'info';
}

export function generateShiftLog(count: number = 25, seed: number = 42): ShiftEvent[] {
  let s = seed;
  function pseudoRandom() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  }

  const events: ShiftEvent[] = [];
  const blocks = ['A', 'B', 'C', 'D', 'E'];
  const baseTime = new Date('2026-10-16T08:00:00Z');

  for (let i = 0; i < count; i++) {
    const r = pseudoRandom();
    const eventTime = new Date(baseTime.getTime() + i * 35000).toISOString().substr(11, 8);
    const eventId = `EVT-${(i + 1).toString().padStart(3, '0')}`;

    if (r < 0.60) {
      // Sensor reading
      const weightDev = Math.round(pseudoRandom() * 95);
      const crackSev = Math.round(pseudoRandom() * 90);
      const tilt = pseudoRandom() > 0.65;
      const rpmMismatch = pseudoRandom() > 0.80;
      const lowBatt = pseudoRandom() > 0.85;

      events.push({
        id: eventId,
        index: i + 1,
        type: 'sensor_reading',
        timestamp: eventTime,
        data: {
          weight_deviation_pct: weightDev,
          crack_severity_pct: crackSev,
          tilt_triggered: tilt,
          vibration: Math.round((0.5 + pseudoRandom() * 0.4) * 100) / 100,
          current: Math.round((1.0 + pseudoRandom() * 0.5) * 100) / 100,
          temperature: Math.round((30.0 + pseudoRandom() * 10) * 10) / 10,
          wheel_rpm_mismatch: rpmMismatch,
          battery_voltage_low: lowBatt,
        },
      });
    } else if (r < 0.82) {
      // Disturbance
      const block = blocks[Math.floor(pseudoRandom() * blocks.length)];
      const afterStep = Math.floor(pseudoRandom() * 4);
      events.push({
        id: eventId,
        index: i + 1,
        type: 'disturbance',
        timestamp: eventTime,
        disturbance: {
          after_step: afterStep,
          block,
        },
      });
    } else {
      // Dock request
      events.push({
        id: eventId,
        index: i + 1,
        type: 'dock_request',
        timestamp: eventTime,
        opponent: pseudoRandom() > 0.5 ? 'self' : 'random',
      });
    }
  }

  return events;
}

export function processShiftEvent(
  event: ShiftEvent,
  startState: WorldState = { on: { C: 'A', A: 'PALLET', B: 'PALLET' }, holding: null },
  goalState: { on: Record<string, string> } = { on: { A: 'B', B: 'C' } }
): EventDispatchResult {
  if (event.type === 'sensor_reading' && event.data) {
    const uncert = evaluateAllMethods(event.data);
    const damageSuspected = uncert.bayes > 0.5 || uncert.nonmonotonic === 'Damaged';

    let expertResult: DiagnosisResult | undefined;
    if (damageSuspected) {
      const symptoms = new Set<string>();
      symptoms.add('symptom:damage_suspected');
      if (event.data.wheel_rpm_mismatch) symptoms.add('symptom:wheel_rpm_mismatch');
      if (event.data.battery_voltage_low) symptoms.add('symptom:battery_voltage_low');
      if (event.data.crack_severity_pct > 50) symptoms.add('symptom:wheel_vibration_high');

      expertResult = runForwardChaining(symptoms);
    }

    const diagCount = expertResult?.diagnoses.length || 0;
    return {
      event,
      module: 'Module B & E',
      summary: damageSuspected
        ? `Damage Suspected! Escalated to Expert System -> ${diagCount} fault(s) detected.`
        : 'Telemetry nominal: All 6 uncertainty formalisms report box intact.',
      details: {
        uncertainty: uncert,
        expertDiagnosis: expertResult,
      },
      severity: damageSuspected ? 'critical' : 'nominal',
    };
  } else if (event.type === 'disturbance' && event.disturbance) {
    const { plan } = planGoalStack(startState, goalState);
    const reactiveResult = executeWithReactiveLayer(plan, startState, [
      { after_step: event.disturbance.after_step, block: event.disturbance.block },
    ]);

    const repairDone = reactiveResult.reactiveLog.length > 0;
    return {
      event,
      module: 'Module A',
      summary: repairDone
        ? `Physical disturbance on block '${event.disturbance.block}'! Dynamic repair injected; pallet stack recovered.`
        : `Disturbance on block '${event.disturbance.block}' handled without violating pre-conditions.`,
      details: {
        reactivePlanning: {
          repairFired: repairDone,
          reactiveLog: reactiveResult.reactiveLog,
          steps: reactiveResult.trace.length,
        },
      },
      severity: repairDone ? 'warning' : 'info',
    };
  } else {
    // Dock request
    const opponent = event.opponent || 'random';
    const gameResult = simulateDockGame(4, opponent);
    return {
      event,
      module: 'Module C',
      summary: `Dock contention vs ${opponent.toUpperCase()}: Resolved in ${gameResult.plies} plies. Winner: ${gameResult.winner}`,
      details: {
        dockContention: gameResult,
      },
      severity: gameResult.winner === 'R1' ? 'nominal' : 'warning',
    };
  }
}
