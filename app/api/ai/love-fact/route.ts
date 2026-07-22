import { NextResponse } from 'next/server';
import { getLoveFact } from '@/app/actions/ai';

export async function GET() {
  try {
    const fact = await getLoveFact();
    return NextResponse.json({ fact });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch love fact" }, { status: 500 });
  }
}
