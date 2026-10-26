import { NextResponse } from 'next/server';
import { runForwardChaining, DEFAULT_RULES, Rule } from '@/lib/expertSystem';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    rules: DEFAULT_RULES,
    ruleCount: DEFAULT_RULES.length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const symptoms: string[] = body.symptoms || [];
    const customRules: Rule[] = body.customRules || DEFAULT_RULES;

    const result = runForwardChaining(new Set(symptoms), customRules);
    return NextResponse.json({
      success: true,
      diagnoses: result.diagnoses,
      trace: result.trace,
      firedRuleIds: result.firedRuleIds,
      workingMemory: result.workingMemory,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
