import { NextResponse } from 'next/server';

function generateMeetingCode() {
  const digits = Math.floor(10000000000 + Math.random() * 90000000000).toString();
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const code = generateMeetingCode();
  const origin = request.headers.get('origin') || 'https://zoom-clone.vercel.app';

  const newMeeting = {
    id: Date.now(),
    meeting_code: code,
    title: body.title || 'Instant Zoom Meeting',
    description: body.description || null,
    host_id: 1,
    status: 'active',
    started_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    duration_minutes: 40,
    invite_link: `${origin}/meeting/${code}`,
    host_name: 'John Doe',
    participant_count: 1,
    participants: []
  };

  return NextResponse.json(newMeeting);
}
