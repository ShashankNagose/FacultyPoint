from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from pathlib import Path
from uuid import uuid4
import shutil
from ..database import get_db
from ..models import Material
from ..schemas import MaterialCreate, MaterialResponse

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploaded_files"
UPLOAD_DIR.mkdir(exist_ok=True)

router = APIRouter(prefix="/materials", tags=["materials"])


@router.post("", response_model=MaterialResponse)
def create_material(material: MaterialCreate, db: Session = Depends(get_db)):
    """Create a new study material with a link."""
    db_material = Material(
        title=material.title,
        subject=material.subject,
        resource_type=material.resource_type or "link",
        drive_link=material.drive_link,
        file_path=material.file_path
    )
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material


@router.post("/upload", response_model=MaterialResponse)
async def upload_material(
    title: str = Form(...),
    subject: str = Form(None),
    resource_type: str = Form(...),
    drive_link: str | None = Form(None),
    file: UploadFile | None = File(None),
    db: Session = Depends(get_db)
):
    """Upload a file or share a link as study material."""
    if resource_type not in {"link", "file"}:
        raise HTTPException(status_code=400, detail="Invalid resource type")

    if resource_type == "link":
        if not drive_link:
            raise HTTPException(status_code=400, detail="Link is required for link resources")
        db_material = Material(
            title=title,
            subject=subject,
            resource_type="link",
            drive_link=drive_link
        )
    else:
        if not file:
            raise HTTPException(status_code=400, detail="File upload is required for file resources")

        safe_name = Path(file.filename).name
        dest_name = f"{uuid4().hex}_{safe_name}"
        destination = UPLOAD_DIR / dest_name

        with destination.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        db_material = Material(
            title=title,
            subject=subject,
            resource_type="file",
            file_path=f"/files/{dest_name}"
        )

    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material


@router.get("", response_model=list[MaterialResponse])
def get_materials(db: Session = Depends(get_db)):
    """Get all study materials"""
    materials = db.query(Material).all()
    return materials
