import { NextResponse } from 'next/server';
import { recordSwipe } from '@/app/actions/discover';

export async function POST(req: Request) {
  try {
    const { userId, targetUserId, isLike } = await req.json();
    
    if (!userId || !targetUserId || typeof isLike !== 'boolean') {
      return NextResponse.json({ error: "userId, targetUserId, and isLike are required" }, { status: 400 });
    }
    
    const result = await recordSwipe(userId, targetUserId, isLike);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: "Failed to record swipe" }, { status: 500 });
  }
}
