// src/app/api/simulation/route.ts
import { NextResponse } from 'next/server';
import { generateShiftLog, processShiftEvent } from '@/lib/integration';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = Math.max(5, Math.min(100, body.count || 20));
    const seed = body.seed !== undefined ? body.seed : 42;

    const events = generateShiftLog(count, seed);
    const results = events.map((evt) => processShiftEvent(evt));

    const metrics = {
      totalEvents: events.length,
      sensorReadings: events.filter((e) => e.type === 'sensor_reading').length,
      disturbances: events.filter((e) => e.type === 'disturbance').length,
      dockRequests: events.filter((e) => e.type === 'dock_request').length,
      expertInterventions: results.filter((r) => r.details.expertDiagnosis).length,
      reactiveRepairs: results.filter((r) => r.details.reactivePlanning?.repairFired).length,
      dockWonR1: results.filter((r) => r.details.dockContention?.winner === 'R1').length,
    };

    return NextResponse.json({
      success: true,
      metrics,
      events,
      dispatchedResults: results,
    });
  } catch (err: any) {
    console.error('Simulation API Error:', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 400 });
  }
}
