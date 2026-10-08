from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List


# ── User Schemas ────────────────────────────────────────────────

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    avatar_url: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Meeting Schemas ─────────────────────────────────────────────

class MeetingCreate(BaseModel):
    title: str = "Zoom Meeting"
    description: Optional[str] = None


class MeetingSchedule(BaseModel):
    title: str
    description: Optional[str] = None
    scheduled_at: str          # ISO-8601 format string
    duration_minutes: int = 40


class ParticipantResponse(BaseModel):
    id: int
    display_name: str
    is_muted: bool
    is_video_on: bool
    role: str
    joined_at: datetime
    user_id: Optional[int] = None

    class Config:
        from_attributes = True


class MeetingResponse(BaseModel):
    id: int
    meeting_code: str
    title: str
    description: Optional[str] = None
    host_id: int
    status: str
    scheduled_at: Optional[datetime] = None
    duration_minutes: int
    created_at: datetime
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    host: Optional[UserResponse] = None
    participants: List[ParticipantResponse] = []
    invite_link: str = ""

    class Config:
        from_attributes = True


# ── Request Schemas ─────────────────────────────────────────────

class JoinMeetingRequest(BaseModel):
    display_name: str
