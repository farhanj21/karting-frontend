import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import KartingSession from '@/lib/models/KartingSession';
import Track from '@/lib/models/Track';
import { getUserId } from '@/lib/auth';
import { validateSession, validateKartType } from '@/lib/validation/session';

/**
 * GET /api/sessions — the signed-in user's sessions, newest first.
 * Always scoped to userId, so a user can only ever read their own data.
 */
export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectDB();
    const sessions = await KartingSession.find({ userId }).sort({ date: -1 }).lean();
    return NextResponse.json({ success: true, sessions });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/sessions — create a session for the signed-in user.
 * The userId is taken from the auth session, NEVER from the request body.
 */
export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const result = validateSession(body as Record<string, unknown>);
  if (!result.ok) {
    return NextResponse.json({ success: false, errors: result.errors }, { status: 422 });
  }

  try {
    await connectDB();

    // Authoritative check: the track (and kart type) must exist in our data.
    const track = await Track.findOne({ slug: result.value.trackSlug }).lean<{
      name: string;
      kartTypes?: string[];
    }>();
    if (!track) {
      return NextResponse.json(
        { success: false, errors: { trackSlug: 'Unknown track.' } },
        { status: 422 }
      );
    }
    const kartError = validateKartType(track.kartTypes, result.value.kartType);
    if (kartError) {
      return NextResponse.json(
        { success: false, errors: { kartType: kartError } },
        { status: 422 }
      );
    }

    const session = await KartingSession.create({
      ...result.value,
      userId,
      trackName: track.name,
    });

    return NextResponse.json({ success: true, session }, { status: 201 });
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
