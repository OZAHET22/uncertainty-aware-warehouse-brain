import { NextResponse } from 'next/server';
import {
  evaluateAllMethods,
  TEST_CASES,
  DISAGREEMENTS,
  SensorReading,
} from '@/lib/uncertainty';

export const dynamic = 'force-dynamic';

export async function GET() {
  const benchmarkMatrix = TEST_CASES.map((tc) => {
    const res = evaluateAllMethods(tc);
    return {
      id: tc.id,
      reading: {
        weight_deviation_pct: tc.weight_deviation_pct,
        crack_severity_pct: tc.crack_severity_pct,
        tilt_triggered: tc.tilt_triggered,
      },
      evaluation: {
        nonmonotonic: res.nonmonotonic,
        bayes: Math.round(res.bayes * 10000) / 10000,
        cf: Math.round(res.cf * 10000) / 10000,
        bn: Math.round(res.bn * 10000) / 10000,
        ds: [Math.round(res.ds[0] * 1000) / 1000, Math.round(res.ds[1] * 1000) / 1000],
        fuzzy: Math.round(res.fuzzy * 100) / 100,
      },
    };
  });

  return NextResponse.json({
    testCases: benchmarkMatrix,
    disagreements: DISAGREEMENTS,
  });
}

export async function POST(req: Request) {
  try {
    const body: SensorReading = await req.json();
    const evaluation = evaluateAllMethods(body);

    return NextResponse.json({
      success: true,
      input: body,
      evaluation: {
        nonmonotonic: evaluation.nonmonotonic,
        bayes: Math.round(evaluation.bayes * 10000) / 10000,
        cf: Math.round(evaluation.cf * 10000) / 10000,
        bn: Math.round(evaluation.bn * 10000) / 10000,
        ds: [Math.round(evaluation.ds[0] * 1000) / 1000, Math.round(evaluation.ds[1] * 1000) / 1000],
        fuzzy: Math.round(evaluation.fuzzy * 100) / 100,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
