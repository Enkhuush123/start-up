import { NextResponse } from 'next/server';
import { getPotentialMatches } from '@/app/actions/discover';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "userId is required" }, { status: 400 });
    }
    
    const users = await getPotentialMatches(userId);
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch matches" }, { status: 500 });
  }
}
