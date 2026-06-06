# FacultyPoint - Faculty Notes & Assignment Portal

A complete Full-Stack application for faculty to share study materials and track student assignments using Google Drive/OneDrive links.

## Technology Stack

- **Backend**: FastAPI (Python), SQLAlchemy ORM, SQLite
- **Frontend**: React 18, Vite, Tailwind CSS
- **Database**: SQLite (instant local testing, no setup needed)

## Features

✅ **Fixed Student Roster** - Pre-configured with 5 sample student IDs (STU001-STU005)
✅ **Material Sharing** - Faculty can share Google Drive/OneDrive links for study materials
✅ **Assignment Management** - Automatic tracking of all students (Pending/Submitted status)
✅ **Submission Tracking** - Live dashboard showing submission status for each student
✅ **Role Switcher** - Easy toggle between Faculty and Student views
✅ **Real-time Status Updates** - Instant visual feedback on submission status

## Project Structure

```
FacultyPoint/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app setup
│   │   ├── models.py            # SQLAlchemy models
│   │   ├── schemas.py           # Pydantic schemas
│   │   ├── database.py          # Database configuration
│   │   ├── settings.py          # Fixed student roster
│   │   └── routers/
│   │       ├── materials.py     # Material endpoints
│   │       └── assignments.py   # Assignment endpoints
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── app.jsx              # Main App component
│   │   ├── main.jsx             # React entry point
│   │   ├── index.css            # Tailwind CSS
│   │   ├── context/
│   │   │   └── RoleContext.jsx  # Role state management
│   │   └── components/
│   │       ├── TopBar.jsx       # Header with role switcher
│   │       ├── FacultyDashboard.jsx
│   │       └── StudentDashboard.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
```

## Quick Start Guide

### Prerequisites
- Python 3.8+
- Node.js 16+
- Git (optional)

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

Backend will run on: **http://localhost:8000**
API Docs available at: **http://localhost:8000/docs**

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

### 3. Access the Application

Open your browser and go to: **http://localhost:5173**

## Fixed Student Roster

The following student IDs are pre-configured and can submit assignments:
- **STU001**
- **STU002**
- **STU003**
- **STU004**
- **STU005**

To modify the roster, edit `backend/app/settings.py`:

```python
FIXED_ROSTER = [
    "STU001",
    "STU002",
    "STU003",
    "STU004",
    "STU005"
]
```

## API Endpoints

### Materials
- `POST /api/materials` - Share study material
- `GET /api/materials` - Get all study materials

### Assignments
- `POST /api/assignments` - Create new assignment (auto-creates Pending submissions for all students)
- `GET /api/assignments` - Get all assignments
- `GET /api/assignments/{id}` - Get specific assignment
- `GET /api/assignments/{id}/report` - Get full submission report
- `POST /api/assignments/submit/{id}` - Submit assignment for a student

## Usage Guide

### Faculty View

1. **Share Study Materials**:
   - Click "Share Materials" tab
   - Enter material title and paste Google Drive/OneDrive shareable link
   - Click "Share Material"
   - Material appears in list immediately

2. **Create Assignment**:
   - Click "Create Assignment" tab
   - Fill in title, description, and due date
   - Click "Create Assignment"
   - System automatically creates "Pending" records for all 5 students

3. **Track Submissions**:
   - Click "Track Submissions" tab
   - Select an assignment from the list
   - See real-time status for all students:
     - 🟢 **Green "Submitted"** - with clickable drive link
     - 🔴 **Red "Pending"** - awaiting submission

### Student View

1. **Access Study Materials**:
   - Click "Materials Hub" tab
   - View all shared materials
   - Click "Open Drive Link" to access

2. **Submit Assignment**:
   - Click "Submit Assignment" tab
   - Select your Student ID from dropdown
   - Select the assignment to submit
   - Paste your Google Drive/OneDrive shareable link
   - Click "Submit Assignment"
   - Status immediately updates to "Submitted" ✓

## Database Schema

### Materials Table
- `id` (Primary Key)
- `title` (String)
- `drive_link` (String)
- `created_at` (DateTime)

### Assignments Table
- `id` (Primary Key)
- `title` (String)
- `description` (Text)
- `deadline` (String)
- `created_at` (DateTime)

### Submissions Table
- `id` (Primary Key)
- `assignment_id` (Foreign Key)
- `student_id` (String)
- `drive_link` (String, nullable)
- `submitted_at` (DateTime, nullable)
- `status` (String - 'Pending' or 'Submitted')

## Key Features Explained

### Auto-Population of Submissions
When a faculty member creates an assignment, the system:
1. Creates the assignment record
2. Loops through the fixed roster (STU001-STU005)
3. Automatically creates a "Pending" submission record for each student
4. Faculty can then track submissions on the live dashboard

### Validation
- Student must provide a valid ID from the fixed roster
- Assignment and drive links are validated before submission
- Duplicate submissions update the same record

### Real-time Status Updates
- Faculty dashboard shows live status without needing to refresh
- Green badges for submitted, red for pending
- Clickable links for submitted work

## Troubleshooting

**Backend connection error?**
- Ensure backend is running on http://localhost:8000
- Check that CORS is enabled (should be in main.py)

**Database issues?**
- The SQLite database is automatically created on first run
- Location: `backend/facultypoint.db`
- To reset: delete the .db file and restart the backend

**Frontend not loading?**
- Clear browser cache
- Ensure npm dependencies are installed: `npm install`
- Check console for errors (F12 → Console tab)

## Building for Production

### Backend
```bash
# Run without --reload flag
uvicorn app.main:app --port 8000
```

### Frontend
```bash
# Build optimized production bundle
npm run build

# Preview production build locally
npm run preview
```

## Support

For issues or questions, check the API documentation at: **http://localhost:8000/docs**

---

**Built with ❤️ using FastAPI, React, and Tailwind CSS**
