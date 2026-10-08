"""Seed the database with a default user and sample meetings."""

from database import SessionLocal
from models import User, Meeting
from datetime import datetime, timezone, timedelta


def seed_database():
    db = SessionLocal()

    # Skip if already seeded
    if db.query(User).first():
        db.close()
        return

    # ── Default user ────────────────────────────────────────────
    user = User(
        id=1,
        name="John Doe",
        email="john.doe@company.com",
        avatar_url=None,
        created_at=datetime.now(timezone.utc),
    )
    db.add(user)
    db.flush()

    now = datetime.now(timezone.utc)

    # ── Upcoming / scheduled meetings ───────────────────────────
    upcoming = [
        Meeting(
            meeting_code="847-3921-5064",
            title="Weekly Team Standup",
            description="Regular team sync to discuss progress and blockers",
            host_id=1,
            status="scheduled",
            scheduled_at=now + timedelta(hours=2),
            duration_minutes=30,
            created_at=now - timedelta(days=7),
        ),
        Meeting(
            meeting_code="562-1847-3290",
            title="Product Review Meeting",
            description="Monthly product review with stakeholders",
            host_id=1,
            status="scheduled",
            scheduled_at=now + timedelta(days=1, hours=3),
            duration_minutes=60,
            created_at=now - timedelta(days=3),
        ),
        Meeting(
            meeting_code="913-6728-4051",
            title="Sprint Planning",
            description="Plan next sprint tasks and allocate story points",
            host_id=1,
            status="scheduled",
            scheduled_at=now + timedelta(days=3, hours=5),
            duration_minutes=90,
            created_at=now - timedelta(days=1),
        ),
        Meeting(
            meeting_code="275-8143-6902",
            title="Design System Workshop",
            description="Collaborative session on the new component library",
            host_id=1,
            status="scheduled",
            scheduled_at=now + timedelta(days=5, hours=1),
            duration_minutes=120,
            created_at=now - timedelta(hours=12),
        ),
    ]
    for m in upcoming:
        db.add(m)

    # ── Recent / ended meetings ─────────────────────────────────
    recent = [
        Meeting(
            meeting_code="384-5029-1763",
            title="Project Kickoff — Q4 Initiative",
            description="Kickoff meeting for the Q4 product initiative",
            host_id=1,
            status="ended",
            scheduled_at=now - timedelta(days=1, hours=2),
            duration_minutes=45,
            created_at=now - timedelta(days=5),
            started_at=now - timedelta(days=1, hours=2),
            ended_at=now - timedelta(days=1, hours=1, minutes=15),
        ),
        Meeting(
            meeting_code="641-7382-9015",
            title="Design Review — Homepage Redesign",
            description="Reviewed new homepage mockups and gathered feedback",
            host_id=1,
            status="ended",
            scheduled_at=now - timedelta(days=2, hours=4),
            duration_minutes=30,
            created_at=now - timedelta(days=6),
            started_at=now - timedelta(days=2, hours=4),
            ended_at=now - timedelta(days=2, hours=3, minutes=28),
        ),
        Meeting(
            meeting_code="158-4967-2340",
            title="Client Call — Acme Corp",
            description="Quarterly check-in with the Acme Corp team",
            host_id=1,
            status="ended",
            scheduled_at=now - timedelta(days=3, hours=6),
            duration_minutes=60,
            created_at=now - timedelta(days=7),
            started_at=now - timedelta(days=3, hours=6),
            ended_at=now - timedelta(days=3, hours=5, minutes=5),
        ),
        Meeting(
            meeting_code="729-0163-8547",
            title="Engineering All-Hands",
            description="Monthly engineering team all-hands meeting",
            host_id=1,
            status="ended",
            scheduled_at=now - timedelta(days=5, hours=3),
            duration_minutes=60,
            created_at=now - timedelta(days=10),
            started_at=now - timedelta(days=5, hours=3),
            ended_at=now - timedelta(days=5, hours=2),
        ),
    ]
    for m in recent:
        db.add(m)

    db.commit()
    db.close()
    print("✓ Database seeded with default user and sample meetings")
