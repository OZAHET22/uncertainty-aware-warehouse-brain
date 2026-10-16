// src/app/api/game/route.ts
import { NextResponse } from 'next/server';
import { simulateDockGame, runBenchmark } from '@/lib/game';

export async function GET() {
  const benchmark = runBenchmark();
  return NextResponse.json({
    success: true,
    benchmark,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const depth = Math.max(1, Math.min(6, body.depth || 4));
    const opponent = body.opponent === 'self' ? 'self' : 'random';

    const result = simulateDockGame(depth, opponent);
    return NextResponse.json({
      success: true,
      simulation: result,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
