import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { getUserId } from '@/lib/auth';

/**
 * POST /api/sessions/ocr — extract lap times (and a few related fields) from a
 * screenshot of a kart timing screen / results page, using Google Gemini vision.
 *
 * The client sends a base64-encoded image; we ask Gemini to return the times in
 * the exact "MM:SS.mmm" shape the session form / validation already understand
 * (see src/lib/validation/session.ts → parseLapTime), so the result can be
 * dropped straight into the form for the user to review before saving.
 *
 * Requires GEMINI_API_KEY in the environment (free tier works). The model can be
 * overridden with GEMINI_MODEL; the default is a fast, vision-capable model on
 * the free tier.
 */

const ALLOWED_MEDIA_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'] as const;
type AllowedMediaType = (typeof ALLOWED_MEDIA_TYPES)[number];

// ~7 MB of base64 ≈ ~5 MB image — enough for a phone screenshot, bounded so a
// huge upload can't tie up a request.
const MAX_BASE64_LENGTH = 7_000_000;

const DEFAULT_MODEL = 'gemini-2.5-flash';

const OCR_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    laps: {
      type: Type.ARRAY,
      description:
        'Every individual lap time visible, in the order shown, each formatted as MM:SS.mmm (e.g. "00:57.241"). Empty array if no per-lap breakdown is shown.',
      items: { type: Type.STRING },
    },
    bestTimeStr: {
      type: Type.STRING,
      description:
        'The best / fastest lap time, formatted as MM:SS.mmm. Empty string if a single best lap is not clearly shown.',
    },
    kartNumber: {
      type: Type.STRING,
      description: 'The kart number if shown (digits only, no "#"). Empty string if not shown.',
    },
    conditions: {
      type: Type.STRING,
      description: 'Track conditions if shown (e.g. "Dry", "Wet"). Empty string if not shown.',
    },
  },
  required: ['laps', 'bestTimeStr', 'kartNumber', 'conditions'],
  propertyOrdering: ['laps', 'bestTimeStr', 'kartNumber', 'conditions'],
};

interface OcrResult {
  laps: string[];
  bestTimeStr: string;
  kartNumber: string;
  conditions: string;
}

const PROMPT =
  'This is a screenshot from a go-karting timing system or results page. ' +
  'Extract the lap times and related details. Format every time as MM:SS.mmm ' +
  '(e.g. "00:57.241"); if the source shows only seconds like "57.241", still use ' +
  'that value. List individual laps in the order shown. Return the single fastest ' +
  'lap as bestTimeStr. If a field is not clearly visible, return an empty string ' +
  '(or empty array for laps) rather than guessing.';

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!process.env.GEMINI_API_KEY) {
    return NextResponse.json(
      { success: false, error: 'Screenshot import is not configured on this server.' },
      { status: 503 }
    );
  }

  let body: { imageBase64?: unknown; mediaType?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const imageBase64 = typeof body.imageBase64 === 'string' ? body.imageBase64 : '';
  const mediaType = body.mediaType as string;

  if (!imageBase64) {
    return NextResponse.json({ success: false, error: 'No image provided.' }, { status: 400 });
  }
  if (imageBase64.length > MAX_BASE64_LENGTH) {
    return NextResponse.json(
      { success: false, error: 'Image is too large — please use one under ~5 MB.' },
      { status: 413 }
    );
  }
  if (!ALLOWED_MEDIA_TYPES.includes(mediaType as AllowedMediaType)) {
    return NextResponse.json(
      { success: false, error: 'Unsupported image type. Use PNG, JPEG, WebP, or GIF.' },
      { status: 415 }
    );
  }

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL,
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: mediaType, data: imageBase64 } },
            { text: PROMPT },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: OCR_SCHEMA,
      },
    });

    const raw = response.text;
    if (!raw) {
      return NextResponse.json(
        { success: false, error: 'Could not read any lap times from that image.' },
        { status: 422 }
      );
    }

    let parsed: OcrResult;
    try {
      parsed = JSON.parse(raw) as OcrResult;
    } catch {
      return NextResponse.json(
        { success: false, error: 'Could not read any lap times from that image.' },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        laps: Array.isArray(parsed.laps)
          ? parsed.laps.filter((l) => typeof l === 'string' && l.trim())
          : [],
        bestTimeStr: typeof parsed.bestTimeStr === 'string' ? parsed.bestTimeStr.trim() : '',
        kartNumber: typeof parsed.kartNumber === 'string' ? parsed.kartNumber.trim() : '',
        conditions: typeof parsed.conditions === 'string' ? parsed.conditions.trim() : '',
      },
    });
  } catch (error) {
    console.error('Error running screenshot OCR:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to read the screenshot. Please try again.' },
      { status: 500 }
    );
  }
}
