// src/lib/expertSystem.ts
// Forward-chaining expert system for warehouse maintenance diagnostics.
// Includes 18 standard rules, explanation tracing, conflict resolution, and Knowledge Acquisition.

export interface Rule {
  id: string;
  if: string[];
  not?: string[];
  then: string;
  explanation: string;
}

export interface FiredTrace {
  ruleId: string;
  explanation: string;
  addedFact: string;
}

export interface DiagnosisResult {
  diagnoses: string[];
  trace: FiredTrace[];
  firedRuleIds: string[];
  workingMemory: string[];
}

export const DEFAULT_RULES: Rule[] = [
  {
    id: 'R1',
    if: ['symptom:wheel_rpm_mismatch', 'symptom:wheel_vibration_high'],
    not: [],
    then: 'diagnosis:wheel_slipping',
    explanation: 'RPM mismatch with high vibration indicates wheel slippage.',
  },
  {
    id: 'R2',
    if: ['symptom:wheel_rpm_mismatch'],
    not: ['symptom:wheel_vibration_high'],
    then: 'diagnosis:calibration_error',
    explanation: 'RPM mismatch without vibration suggests encoder calibration drift, not slippage.',
  },
  {
    id: 'R3',
    if: ['symptom:battery_voltage_low', 'symptom:battery_drain_fast'],
    not: [],
    then: 'diagnosis:battery_fault',
    explanation: 'Low voltage plus fast drain indicates a failing battery cell.',
  },
  {
    id: 'R4',
    if: ['symptom:battery_temp_high'],
    not: [],
    then: 'derived:power_subsystem_stressed',
    explanation: 'High battery temperature is an early sign of power subsystem stress.',
  },
  {
    id: 'R5',
    if: ['symptom:battery_voltage_low', 'derived:power_subsystem_stressed'],
    not: [],
    then: 'diagnosis:power_subsystem_failure',
    explanation: 'Low voltage combined with confirmed power stress indicates subsystem-level failure, not just a weak cell.',
  },
  {
    id: 'R6',
    if: ['symptom:sensor_reading_erratic', 'symptom:sensor_calibration_expired'],
    not: [],
    then: 'diagnosis:sensor_drift',
    explanation: 'Erratic readings with expired calibration is the classic sensor-drift signature.',
  },
  {
    id: 'R7',
    if: ['symptom:sensor_checksum_fail'],
    not: [],
    then: 'diagnosis:sensor_drift',
    explanation: 'Checksum failures independently indicate sensor drift/corruption, via a second evidence path.',
  },
  {
    id: 'R8',
    if: ['symptom:motor_current_high', 'symptom:motor_temp_high'],
    not: [],
    then: 'diagnosis:motor_overheat',
    explanation: 'High current and high temperature together confirm motor overheating.',
  },
  {
    id: 'R9',
    if: ['symptom:motor_stall_detected'],
    not: ['symptom:obstacle_detected_stationary'],
    then: 'diagnosis:motor_overheat',
    explanation: 'A stall with no obstacle present points to thermal overload rather than a physical blockage.',
  },
  {
    id: 'R10',
    if: ['symptom:motor_stall_detected', 'symptom:obstacle_detected_stationary'],
    not: [],
    then: 'diagnosis:obstacle_stuck',
    explanation: 'A stall coinciding with a detected stationary obstacle indicates the robot is physically stuck.',
  },
  {
    id: 'R11',
    if: ['symptom:comm_packet_loss_high', 'symptom:comm_timeout'],
    not: [],
    then: 'diagnosis:communication_loss',
    explanation: 'High packet loss with timeouts indicates a communication link failure.',
  },
  {
    id: 'R12',
    if: ['symptom:position_drift_detected'],
    not: ['symptom:sensor_calibration_expired'],
    then: 'derived:navigation_unreliable',
    explanation: 'Position drift without a calibration excuse implies the navigation stack itself is unreliable.',
  },
  {
    id: 'R13',
    if: ['derived:navigation_unreliable'],
    not: [],
    then: 'diagnosis:navigation_failure',
    explanation: 'Confirmed navigation unreliability is escalated to a navigation failure diagnosis.',
  },
  {
    id: 'R14',
    if: ['symptom:firmware_watchdog_reset'],
    not: [],
    then: 'diagnosis:calibration_error',
    explanation: 'An unexpected watchdog reset commonly invalidates prior calibration state.',
  },
  {
    id: 'R15',
    if: ['symptom:damage_suspected'],
    not: [],
    then: 'diagnosis:structural_damage',
    explanation: 'Upstream uncertainty reasoning (Module B) flagged suspected physical damage.',
  },
  {
    id: 'R16',
    if: ['symptom:damage_suspected', 'symptom:wheel_vibration_high'],
    not: [],
    then: 'diagnosis:wheel_slipping',
    explanation: 'Suspected structural damage combined with wheel vibration can also manifest as slipping, via a second evidence path.',
  },
  {
    id: 'R17',
    if: ['symptom:sensor_checksum_fail', 'symptom:comm_timeout'],
    not: [],
    then: 'derived:power_subsystem_stressed',
    explanation: 'Checksum failures co-occurring with comm timeouts often share a common power-subsystem root cause.',
  },
  {
    id: 'R18',
    if: ['derived:power_subsystem_stressed'],
    not: ['symptom:battery_voltage_low'],
    then: 'diagnosis:sensor_drift',
    explanation: 'Power stress without confirmed low voltage points to electrical noise affecting sensors rather than the battery itself.',
  },
];

export function runForwardChaining(
  symptomFacts: Set<string> | string[],
  customRules: Rule[] = DEFAULT_RULES,
  maxPasses: number = 50
): DiagnosisResult {
  const symptomSet = Array.isArray(symptomFacts) ? new Set(symptomFacts) : symptomFacts;
  const workingMemory = new Set<string>(symptomSet);
  const firedRuleIds: string[] = [];
  const trace: FiredTrace[] = [];

  for (let pass = 0; pass < maxPasses; pass++) {
    let newFactAdded = false;

    for (const rule of customRules) {
      if (firedRuleIds.includes(rule.id)) continue;

      // Check IF preconditions
      const ifSatisfied = rule.if.every((fact) => workingMemory.has(fact));
      if (!ifSatisfied) continue;

      // Check NOT preconditions
      const notViolated = rule.not && rule.not.some((fact) => workingMemory.has(fact));
      if (notViolated) continue;

      // Rule fires!
      workingMemory.add(rule.then);
      firedRuleIds.push(rule.id);
      trace.push({
        ruleId: rule.id,
        explanation: rule.explanation,
        addedFact: rule.then,
      });

      if (!symptomSet.has(rule.then)) {
        newFactAdded = true;
      }
    }

    if (!newFactAdded) break;
  }

  const diagnoses = Array.from(workingMemory)
    .filter((f) => f.startsWith('diagnosis:'))
    .sort();

  return {
    diagnoses,
    trace,
    firedRuleIds,
    workingMemory: Array.from(workingMemory).sort(),
  };
}
