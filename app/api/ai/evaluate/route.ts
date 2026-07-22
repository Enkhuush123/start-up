import { NextResponse } from 'next/server';
import { evaluateChat } from '@/app/actions/ai';

export async function POST(req: Request) {
  try {
    const { matchId } = await req.json();
    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }
    
    const result = await evaluateChat(matchId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to evaluate chat" }, { status: 500 });
  }
}
