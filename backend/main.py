from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, List

from database import engine
import models
from routes import meetings, users

# ── Create all tables ───────────────────────────────────────────
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Zoom Clone API", version="1.0.0")

# ── CORS ────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────
app.include_router(meetings.router, prefix="/api", tags=["meetings"])
app.include_router(users.router, prefix="/api", tags=["users"])


# ── WebSocket Connection Manager ───────────────────────────────
class ConnectionManager:
    """Manages WebSocket connections per meeting room."""

    def __init__(self):
        self.active_connections: Dict[str, List[dict]] = {}

    async def connect(self, ws: WebSocket, meeting_code: str, name: str):
        await ws.accept()
        if meeting_code not in self.active_connections:
            self.active_connections[meeting_code] = []
        self.active_connections[meeting_code].append({"ws": ws, "name": name})

    def disconnect(self, ws: WebSocket, meeting_code: str):
        if meeting_code in self.active_connections:
            self.active_connections[meeting_code] = [
                c for c in self.active_connections[meeting_code] if c["ws"] != ws
            ]
            if not self.active_connections[meeting_code]:
                del self.active_connections[meeting_code]

    async def broadcast(
        self, meeting_code: str, message: dict, exclude: WebSocket = None
    ):
        for conn in self.active_connections.get(meeting_code, []):
            if conn["ws"] != exclude:
                try:
                    await conn["ws"].send_json(message)
                except Exception:
                    pass

    def get_participants(self, meeting_code: str) -> List[str]:
        return [c["name"] for c in self.active_connections.get(meeting_code, [])]


manager = ConnectionManager()


@app.websocket("/ws/{meeting_code}")
async def websocket_endpoint(websocket: WebSocket, meeting_code: str):
    name = websocket.query_params.get("name", "Guest")
    await manager.connect(websocket, meeting_code, name)

    # Notify everyone that a new participant joined
    await manager.broadcast(
        meeting_code,
        {
            "type": "participant_joined",
            "name": name,
            "participants": manager.get_participants(meeting_code),
        },
    )

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type")

            if msg_type == "chat_message":
                await manager.broadcast(
                    meeting_code,
                    {
                        "type": "chat_message",
                        "name": name,
                        "message": data.get("message", ""),
                        "timestamp": data.get("timestamp", ""),
                    },
                )
            elif msg_type == "toggle_mute":
                await manager.broadcast(
                    meeting_code,
                    {
                        "type": "participant_muted",
                        "name": name,
                        "is_muted": data.get("is_muted", False),
                    },
                    exclude=websocket,
                )
            elif msg_type == "toggle_video":
                await manager.broadcast(
                    meeting_code,
                    {
                        "type": "participant_video",
                        "name": name,
                        "is_video_on": data.get("is_video_on", True),
                    },
                    exclude=websocket,
                )
            elif msg_type == "mute_all":
                await manager.broadcast(
                    meeting_code,
                    {"type": "mute_all", "by": name},
                )
            elif msg_type == "remove_participant":
                await manager.broadcast(
                    meeting_code,
                    {
                        "type": "participant_removed",
                        "target_name": data.get("target_name", ""),
                        "by": name,
                    },
                )
            elif msg_type == "reaction":
                await manager.broadcast(
                    meeting_code,
                    {
                        "type": "reaction",
                        "name": name,
                        "emoji": data.get("emoji", "👍"),
                    },
                )

    except WebSocketDisconnect:
        manager.disconnect(websocket, meeting_code)
        await manager.broadcast(
            meeting_code,
            {
                "type": "participant_left",
                "name": name,
                "participants": manager.get_participants(meeting_code),
            },
        )


# ── Startup: seed DB ───────────────────────────────────────────
@app.on_event("startup")
def on_startup():
    from seed import seed_database
    seed_database()


@app.get("/api/health")
def health_check():
    return {"status": "ok", "message": "Zoom Clone API is running"}
