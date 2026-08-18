import { NextRequest, NextResponse } from "next/server";
import { fetchWithAuth } from "@/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const meetingId = searchParams.get('meetingId');

  if (!meetingId) {
    return NextResponse.json({ error: "Missing meetingId" }, { status: 400 });
  }

  try {
    const res = await fetchWithAuth(`/meetings/${meetingId}/pack`);
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to generate pack" }, { status: res.status });
    }

    const blob = await res.blob();
    return new NextResponse(blob, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="board-pack-${meetingId}.pdf"`,
      },
    });
  } catch (error) {
    console.error("API proxy error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
