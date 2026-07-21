import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/mongodb';
import KartingSession from '@/lib/models/KartingSession';
import Track from '@/lib/models/Track';
import { getUserId } from '@/lib/auth';
import { validateSession, validateKartType } from '@/lib/validation/session';

interface Params {
  params: { id: string };
}

/** GET /api/sessions/[id] — one session the user owns. */
export async function GET(_req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  try {
    await connectDB();
    // Scoped by BOTH id and userId — another user's id simply 404s.
    const session = await KartingSession.findOne({ _id: params.id, userId }).lean();
    if (!session) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

/** PATCH /api/sessions/[id] — full update of a session the user owns. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
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

    // Split out the optional time fields: when a session is edited to "No time"
    // they're undefined, and Mongoose ignores undefined keys — so we must
    // explicitly $unset them to clear a previously-recorded time.
    const { bestTime, bestTimeStr, ...rest } = result.value;
    const set: Record<string, unknown> = { ...rest, trackName: track.name };
    const unset: Record<string, ''> = {};
    if (bestTime == null) unset.bestTime = '';
    else set.bestTime = bestTime;
    if (bestTimeStr == null) unset.bestTimeStr = '';
    else set.bestTimeStr = bestTimeStr;

    // findOneAndUpdate scoped by userId — cannot touch another user's row.
    const session = await KartingSession.findOneAndUpdate(
      { _id: params.id, userId },
      Object.keys(unset).length ? { $set: set, $unset: unset } : set,
      { new: true, runValidators: true }
    ).lean();

    if (!session) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, session });
  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    );
  }
}

/** DELETE /api/sessions/[id] — delete a session the user owns. */
export async function DELETE(_req: NextRequest, { params }: Params) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }
  if (!mongoose.isValidObjectId(params.id)) {
    return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }

  try {
    await connectDB();
    const deleted = await KartingSession.findOneAndDelete({ _id: params.id, userId }).lean();
    if (!deleted) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete session' },
      { status: 500 }
    );
  }
}
