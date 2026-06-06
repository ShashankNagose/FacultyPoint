from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from ..database import get_db
from ..models import Assignment, Submission
from ..schemas import AssignmentCreate, AssignmentResponse, SubmissionUpdate
from ..settings import FIXED_ROSTER

router = APIRouter(prefix="/assignments", tags=["assignments"])


@router.post("", response_model=AssignmentResponse)
def create_assignment(assignment: AssignmentCreate, db: Session = Depends(get_db)):
    """
    Create a new assignment and automatically initialize 'Pending' submissions
    for all students in the fixed roster
    """
    db_assignment = Assignment(
        title=assignment.title,
        description=assignment.description,
        deadline=assignment.deadline
    )
    db.add(db_assignment)
    db.flush()  # Get the assignment ID

    # Create 'Pending' submissions for all students in the fixed roster
    for student_id in FIXED_ROSTER:
        submission = Submission(
            assignment_id=db_assignment.id,
            student_id=student_id,
            status="Pending"
        )
        db.add(submission)

    db.commit()
    db.refresh(db_assignment)
    return db_assignment


@router.get("", response_model=list[AssignmentResponse])
def get_assignments(db: Session = Depends(get_db)):
    """Get all assignments with their submission status"""
    assignments = db.query(Assignment).all()
    return assignments


@router.get("/{assignment_id}", response_model=AssignmentResponse)
def get_assignment(assignment_id: int, db: Session = Depends(get_db)):
    """Get a specific assignment with full submission report"""
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return assignment


@router.get("/{assignment_id}/report", response_model=dict)
def get_assignment_report(assignment_id: int, db: Session = Depends(get_db)):
    """
    Get full report for an assignment showing all students from the fixed roster
    with their submission status (Submitted or Pending)
    """
    assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found")

    submissions = db.query(Submission).filter(
        Submission.assignment_id == assignment_id
    ).all()

    submitted = []
    pending = []

    for submission in submissions:
        submission_data = {
            "student_id": submission.student_id,
            "status": submission.status,
            "submitted_at": submission.submitted_at,
            "drive_link": submission.drive_link
        }
        if submission.status == "Submitted":
            submitted.append(submission_data)
        else:
            pending.append(submission_data)

    return {
        "assignment_id": assignment.id,
        "assignment_title": assignment.title,
        "assignment_description": assignment.description,
        "deadline": assignment.deadline,
        "submitted": submitted,
        "pending": pending,
        "summary": {
            "total_students": len(FIXED_ROSTER),
            "submitted_count": len(submitted),
            "pending_count": len(pending)
        }
    }


@router.post("/submit/{assignment_id}")
def submit_assignment(assignment_id: int, submission_data: SubmissionUpdate, db: Session = Depends(get_db)):
    """
    Submit an assignment for a student.
    Validates if student_id exists in the fixed roster and updates status to 'Submitted'
    """
    # Validate student ID
    if submission_data.student_id not in FIXED_ROSTER:
        raise HTTPException(status_code=400, detail="Invalid student ID")

    # Find the submission record
    submission = db.query(Submission).filter(
        (Submission.assignment_id == assignment_id) &
        (Submission.student_id == submission_data.student_id)
    ).first()

    if not submission:
        raise HTTPException(status_code=404, detail="Submission record not found")

    # Update submission
    submission.drive_link = submission_data.drive_link
    submission.status = "Submitted"
    submission.submitted_at = datetime.utcnow()

    db.commit()
    db.refresh(submission)

    return {
        "status": "success",
        "message": f"Assignment submitted successfully for {submission_data.student_id}",
        "submission": {
            "id": submission.id,
            "student_id": submission.student_id,
            "status": submission.status,
            "submitted_at": submission.submitted_at,
            "drive_link": submission.drive_link
        }
    }
