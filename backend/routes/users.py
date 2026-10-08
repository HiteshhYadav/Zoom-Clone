from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models import User
from schemas import UserResponse

router = APIRouter()


@router.get("/users/me", response_model=UserResponse)
def get_current_user(db: Session = Depends(get_db)):
    """Return the default logged-in user (id=1)."""
    user = db.query(User).filter(User.id == 1).first()
    return user
