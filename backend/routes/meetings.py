from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Meeting, User, Participant
from schemas import (
    MeetingCreate,
    MeetingSchedule,
    MeetingResponse,
    JoinMeetingRequest,
)
from datetime import datetime, timezone
import random

router = APIRouter()


def generate_meeting_code() -> str:
    """Generate a Zoom-style meeting code: xxx-xxxx-xxxx"""
    digits = "".join([str(random.randint(0, 9)) for _ in range(11)])
    return f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"


def get_invite_link(meeting_code: str) -> str:
    return f"http://localhost:3000/meeting/{meeting_code}"


# ── Instant Meeting ─────────────────────────────────────────────

@router.post("/meetings", response_model=MeetingResponse)
def create_instant_meeting(meeting: MeetingCreate, db: Session = Depends(get_db)):
    """Create a new instant meeting and redirect host to the room."""
    code = generate_meeting_code()
    while db.query(Meeting).filter(Meeting.meeting_code == code).first():
        code = generate_meeting_code()

    db_meeting = Meeting(
        meeting_code=code,
        title=meeting.title or "Zoom Meeting",
        description=meeting.description,
        host_id=1,
        status="active",
        started_at=datetime.now(timezone.utc),
        created_at=datetime.now(timezone.utc),
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)

    # Add host as first participant
    host = db.query(User).filter(User.id == 1).first()
    participant = Participant(
        meeting_id=db_meeting.id,
        user_id=1,
        display_name=host.name,
        role="host",
        joined_at=datetime.now(timezone.utc),
    )
    db.add(participant)
    db.commit()
    db.refresh(db_meeting)

    resp = MeetingResponse.model_validate(db_meeting)
    resp.invite_link = get_invite_link(code)
    return resp


# ── Schedule Meeting ────────────────────────────────────────────

@router.post("/meetings/schedule", response_model=MeetingResponse)
def schedule_meeting(meeting: MeetingSchedule, db: Session = Depends(get_db)):
    """Schedule a future meeting."""
    code = generate_meeting_code()
    while db.query(Meeting).filter(Meeting.meeting_code == code).first():
        code = generate_meeting_code()

    scheduled_dt = datetime.fromisoformat(meeting.scheduled_at)

    db_meeting = Meeting(
        meeting_code=code,
        title=meeting.title,
        description=meeting.description,
        host_id=1,
        status="scheduled",
        scheduled_at=scheduled_dt,
        duration_minutes=meeting.duration_minutes,
        created_at=datetime.now(timezone.utc),
    )
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)

    resp = MeetingResponse.model_validate(db_meeting)
    resp.invite_link = get_invite_link(code)
    return resp


# ── List Meetings ───────────────────────────────────────────────

@router.get("/meetings/upcoming")
def get_upcoming_meetings(db: Session = Depends(get_db)):
    """Return all scheduled (upcoming) meetings for the default user."""
    meetings = (
        db.query(Meeting)
        .filter(Meeting.status == "scheduled", Meeting.host_id == 1)
        .order_by(Meeting.scheduled_at.asc())
        .all()
    )
    return [
        {
            "id": m.id,
            "meeting_code": m.meeting_code,
            "title": m.title,
            "description": m.description,
            "host_id": m.host_id,
            "status": m.status,
            "scheduled_at": m.scheduled_at.isoformat() if m.scheduled_at else None,
            "duration_minutes": m.duration_minutes,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "invite_link": get_invite_link(m.meeting_code),
            "host_name": m.host.name if m.host else "",
            "participant_count": len(m.participants),
        }
        for m in meetings
    ]


@router.get("/meetings/recent")
def get_recent_meetings(db: Session = Depends(get_db)):
    """Return recent/ended meetings for the default user."""
    meetings = (
        db.query(Meeting)
        .filter(Meeting.status == "ended", Meeting.host_id == 1)
        .order_by(Meeting.ended_at.desc())
        .limit(10)
        .all()
    )
    return [
        {
            "id": m.id,
            "meeting_code": m.meeting_code,
            "title": m.title,
            "description": m.description,
            "host_id": m.host_id,
            "status": m.status,
            "scheduled_at": m.scheduled_at.isoformat() if m.scheduled_at else None,
            "duration_minutes": m.duration_minutes,
            "created_at": m.created_at.isoformat() if m.created_at else None,
            "started_at": m.started_at.isoformat() if m.started_at else None,
            "ended_at": m.ended_at.isoformat() if m.ended_at else None,
            "invite_link": get_invite_link(m.meeting_code),
            "host_name": m.host.name if m.host else "",
            "participant_count": len(m.participants),
        }
        for m in meetings
    ]


# ── Single Meeting ──────────────────────────────────────────────

@router.get("/meetings/{meeting_code}", response_model=MeetingResponse)
def get_meeting(meeting_code: str, db: Session = Depends(get_db)):
    """Get meeting details by its code."""
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    resp = MeetingResponse.model_validate(meeting)
    resp.invite_link = get_invite_link(meeting_code)
    return resp


# ── Join Meeting ────────────────────────────────────────────────

@router.post("/meetings/{meeting_code}/join")
def join_meeting(
    meeting_code: str, request: JoinMeetingRequest, db: Session = Depends(get_db)
):
    """Join an existing meeting as a participant."""
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    if meeting.status == "scheduled":
        meeting.status = "active"
        meeting.started_at = datetime.now(timezone.utc)

    if meeting.status == "ended":
        raise HTTPException(status_code=400, detail="This meeting has already ended")

    participant = Participant(
        meeting_id=meeting.id,
        display_name=request.display_name,
        role="participant",
        joined_at=datetime.now(timezone.utc),
    )
    db.add(participant)
    db.commit()
    db.refresh(meeting)

    resp = MeetingResponse.model_validate(meeting)
    resp.invite_link = get_invite_link(meeting_code)
    return resp


# ── Start Scheduled Meeting ────────────────────────────────────

@router.post("/meetings/{meeting_code}/start")
def start_meeting(meeting_code: str, db: Session = Depends(get_db)):
    """Start a scheduled meeting (host action)."""
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    meeting.status = "active"
    meeting.started_at = datetime.now(timezone.utc)

    host = db.query(User).filter(User.id == meeting.host_id).first()
    participant = Participant(
        meeting_id=meeting.id,
        user_id=meeting.host_id,
        display_name=host.name,
        role="host",
        joined_at=datetime.now(timezone.utc),
    )
    db.add(participant)
    db.commit()
    db.refresh(meeting)

    resp = MeetingResponse.model_validate(meeting)
    resp.invite_link = get_invite_link(meeting_code)
    return resp


# ── End Meeting ─────────────────────────────────────────────────

@router.post("/meetings/{meeting_code}/end")
def end_meeting(meeting_code: str, db: Session = Depends(get_db)):
    """End an active meeting."""
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    meeting.status = "ended"
    meeting.ended_at = datetime.now(timezone.utc)

    for p in meeting.participants:
        if not p.left_at:
            p.left_at = datetime.now(timezone.utc)

    db.commit()
    return {"status": "ended", "meeting_code": meeting_code}


# ── Delete Meeting ──────────────────────────────────────────────

@router.delete("/meetings/{meeting_code}")
def delete_meeting(meeting_code: str, db: Session = Depends(get_db)):
    """Delete a scheduled meeting."""
    meeting = db.query(Meeting).filter(Meeting.meeting_code == meeting_code).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    db.delete(meeting)
    db.commit()
    return {"status": "deleted", "meeting_code": meeting_code}
