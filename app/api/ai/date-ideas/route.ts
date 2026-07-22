import { NextResponse } from 'next/server';
import { suggestDateIdeas } from '@/app/actions/ai';

export async function POST(req: Request) {
  try {
    const { matchId } = await req.json();
    if (!matchId) {
      return NextResponse.json({ error: "matchId is required" }, { status: 400 });
    }
    
    const result = await suggestDateIdeas(matchId);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to suggest date ideas" }, { status: 500 });
  }
}
