from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# Material Schemas
class MaterialBase(BaseModel):
    title: str
    subject: Optional[str] = None
    resource_type: Optional[str] = "link"
    drive_link: Optional[str] = None
    file_path: Optional[str] = None


class MaterialCreate(MaterialBase):
    pass


class MaterialResponse(MaterialBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# Assignment Schemas
class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: str


class AssignmentCreate(AssignmentBase):
    pass


class SubmissionResponse(BaseModel):
    id: int
    assignment_id: int
    student_id: str
    drive_link: Optional[str]
    submitted_at: Optional[datetime]
    status: str

    class Config:
        from_attributes = True


class AssignmentResponse(AssignmentBase):
    id: int
    created_at: datetime
    submissions: list[SubmissionResponse] = []

    class Config:
        from_attributes = True


# Submission Schemas
class SubmissionCreate(BaseModel):
    student_id: str
    drive_link: str


class SubmissionUpdate(BaseModel):
    assignment_id: int
    student_id: str
    drive_link: str
