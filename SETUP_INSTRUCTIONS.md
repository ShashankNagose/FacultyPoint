# FacultyPoint - Complete Setup Instructions

## 🚀 ONE-COMMAND QUICK START

### Windows
1. **Backend** - Open PowerShell in `backend/` and run:
   ```
   .\run-backend.bat
   ```

2. **Frontend** - Open PowerShell in `frontend/` and run:
   ```
   .\run-frontend.bat
   ```

### macOS / Linux
1. **Backend** - Open Terminal in `backend/` and run:
   ```bash
   chmod +x run-backend.sh
   ./run-backend.sh
   ```

2. **Frontend** - Open Terminal in `frontend/` and run:
   ```bash
   chmod +x run-frontend.sh
   ./run-frontend.sh
   ```

Then open your browser to **http://localhost:5173** ✨

---

## 📋 DETAILED SETUP (Step-by-Step)

### System Requirements
- **Python**: 3.8 or higher
- **Node.js**: 16 or higher  
- **Browser**: Modern browser (Chrome, Firefox, Safari, Edge)
- **Disk Space**: ~500MB
- **Internet**: Not required after initial setup

### Step 1: Backend Setup

#### Windows
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```

#### macOS/Linux
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start backend server
uvicorn app.main:app --reload --port 8000
```

**✓ Backend ready at: http://localhost:8000**

**🔍 Access API docs at: http://localhost:8000/docs**

### Step 2: Frontend Setup

Open a **NEW terminal/PowerShell window** (keep backend running)

```bash
# Navigate to frontend folder
cd frontend

# Install npm dependencies
npm install

# Start development server
npm run dev
```

**✓ Frontend ready at: http://localhost:5173**

The browser should open automatically. If not, click the link in terminal.

---

## 🎯 TESTING THE APPLICATION

### Test Scenario 1: Share Study Materials

1. **Open app** at http://localhost:5173
2. **Role should be**: "Faculty View" (top right)
3. **Click**: "Share Materials" tab
4. **Fill form**:
   - Title: `Linear Algebra Notes`
   - Drive Link: `https://drive.google.com/file/d/1example/view` (or any URL)
5. **Click**: "Share Material"
6. **Result**: Material appears in list below ✓

### Test Scenario 2: Create Assignment with Auto-Population

1. **Click**: "Create Assignment" tab
2. **Fill form**:
   - Title: `Calculus Assignment 1`
   - Description: `Solve problems 1-10 on page 42`
   - Due Date: Pick a future date
3. **Click**: "Create Assignment"
4. **Result**: 
   - ✓ Assignment created
   - ✓ Automatically created 5 "Pending" submission records (one per student)

### Test Scenario 3: View Live Tracking Report

1. **Click**: "Track Submissions" tab
2. **Click**: The assignment you just created
3. **See**:
   - 📊 Summary: "0 / 5 submitted"
   - All 5 students listed with 🔴 "Pending" status
   - Red-highlighted rows

### Test Scenario 4: Student Submits Assignment

1. **Switch Role**: Click "Switch to Student" button (top right)
2. **Click**: "Submit Assignment" tab
3. **Fill form**:
   - Student ID: `STU001` (from dropdown)
   - Assignment: `Calculus Assignment 1`
   - Drive Link: `https://drive.google.com/file/d/1mystudentwork/view` (or any URL)
4. **Click**: "Submit Assignment"
5. **Result**: 
   - ✓ Green success message appears
   - ✓ Form clears

### Test Scenario 5: Verify Status Update (Faculty View)

1. **Switch back to Faculty**: Click "Switch to Faculty" (top right)
2. **Go to**: "Track Submissions" tab
3. **Select**: Same assignment
4. **See**:
   - 📊 Summary updated: "1 / 5 submitted"
   - STU001 now shows 🟢 "Submitted" (green)
   - Other 4 students still show 🔴 "Pending" (red)
   - STU001 row has clickable "Open Drive Link" button

---

## ✅ FEATURE CHECKLIST

- [ ] Backend starts without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] Role switcher works (Faculty ↔ Student)
- [ ] Share Materials appears in both views
- [ ] Assignment creation works
- [ ] Report shows all 5 students after assignment creation
- [ ] Student submission works
- [ ] Status updates immediately in faculty view
- [ ] Green/Red status badges display correctly
- [ ] Drive links are clickable

---

## 🐛 TROUBLESHOOTING

### Backend Issues

**"Port 8000 already in use"**
```bash
# Use different port
uvicorn app.main:app --reload --port 8001
# Then update frontend API_URL in FacultyDashboard.jsx
```

**"ModuleNotFoundError: No module named 'fastapi'"**
```bash
# Ensure virtual environment is activated
# Windows: venv\Scripts\activate
# Linux/Mac: source venv/bin/activate
# Then: pip install -r requirements.txt
```

**Database errors or need to reset**
```bash
# Stop backend (Ctrl+C)
# Delete the database file
# Windows: del facultypoint.db
# Linux/Mac: rm facultypoint.db
# Restart: uvicorn app.main:app --reload --port 8000
```

### Frontend Issues

**"Cannot find module 'axios' or other packages"**
```bash
# Install dependencies
npm install

# If still issues, clean cache
npm cache clean --force
npm install
```

**"Port 5173 already in use"**
```bash
# Find process using port 5173 and kill it, or:
npm run dev -- --port 5174
```

**Frontend not connecting to backend**
- Check if backend is running: http://localhost:8000 in browser
- Check browser console for CORS errors (F12 → Console)
- Verify API_URL in component files matches backend port

### API Not Working

**Check API is working**:
1. Visit: http://localhost:8000/health
2. Should see: `{"status":"healthy"}`
3. Visit: http://localhost:8000/docs for interactive API docs

**Check database exists**:
- Windows: `backend/facultypoint.db` should exist after first request
- Linux/Mac: Same location

---

## 🔑 KEY CREDENTIALS & IDs

**Valid Student IDs** (hardcoded roster):
```
STU001
STU002
STU003
STU004
STU005
```

To change roster, edit: `backend/app/settings.py`

**Default Ports**:
- Backend: `8000`
- Frontend: `5173`

---

## 📚 API ENDPOINTS REFERENCE

```
POST   /api/materials              - Share study material
GET    /api/materials              - Get all materials

POST   /api/assignments            - Create assignment
GET    /api/assignments            - Get all assignments
GET    /api/assignments/{id}       - Get assignment
GET    /api/assignments/{id}/report - Get submission report
POST   /api/assignments/submit/{id} - Submit assignment
```

**Live Interactive Docs**: http://localhost:8000/docs

---

## 🚀 PRODUCTION BUILD

### Frontend Production Build
```bash
cd frontend
npm run build      # Creates optimized dist/ folder
npm run preview    # Preview production build locally
```

### Backend Production Deploy
```bash
# Stop using --reload flag
uvicorn app.main:app --port 8000 --workers 4
```

---

## 📖 PROJECT STRUCTURE

```
FacultyPoint/
├── README.md                      # Overview & features
├── SETUP_INSTRUCTIONS.md          # This file
│
├── backend/
│   ├── run-backend.bat            # Windows quick start
│   ├── run-backend.sh             # Linux/Mac quick start
│   ├── requirements.txt           # Python dependencies
│   ├── app/
│   │   ├── main.py               # FastAPI setup
│   │   ├── models.py             # SQLAlchemy ORM models
│   │   ├── schemas.py            # Pydantic validation
│   │   ├── settings.py           # Fixed roster config
│   │   ├── database.py           # Database setup
│   │   └── routers/
│   │       ├── materials.py      # Material endpoints
│   │       └── assignments.py    # Assignment endpoints
│   └── facultypoint.db           # SQLite database (auto-created)
│
├── frontend/
│   ├── run-frontend.bat           # Windows quick start
│   ├── run-frontend.sh            # Linux/Mac quick start
│   ├── package.json               # Node dependencies
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js         # Tailwind setup
│   ├── index.html                 # HTML entry point
│   └── src/
│       ├── app.jsx                # Main component
│       ├── main.jsx               # React mount point
│       ├── index.css              # Global styles
│       ├── context/
│       │   └── RoleContext.jsx    # Role state
│       └── components/
│           ├── TopBar.jsx         # Header + switcher
│           ├── FacultyDashboard.jsx
│           └── StudentDashboard.jsx
```

---

## 💡 TIPS & TRICKS

1. **Keep terminals open** - Don't close backend/frontend terminals while testing
2. **Hard refresh** - Ctrl+Shift+R (Cmd+Shift+R on Mac) if frontend looks wrong
3. **Check console** - Press F12 → Console for frontend errors
4. **API testing** - Use http://localhost:8000/docs to test endpoints directly
5. **Real Drive links** - You can test with actual Google Drive/OneDrive shareable links

---

## ❓ FAQ

**Q: Can I use a different port?**
A: Yes! Backend: add `--port 9000` to uvicorn command. Frontend: edit vite.config.js and update API_URL in components.

**Q: Does it work offline?**
A: Yes, completely offline after initial npm/pip install.

**Q: Can I add more students?**
A: Yes, edit `backend/app/settings.py` and add to FIXED_ROSTER array.

**Q: How do I backup the data?**
A: Copy `backend/facultypoint.db` file - that's your entire database.

**Q: Can I use PostgreSQL instead of SQLite?**
A: Yes, update DATABASE_URL in `backend/app/database.py` to PostgreSQL connection string.

---

## ✨ READY TO GO!

Your complete Faculty Notes & Assignment Portal is ready to use.

**Next Steps**:
1. Start backend: `.\run-backend.bat` or `./run-backend.sh`
2. Start frontend: `.\run-frontend.bat` or `./run-frontend.sh`
3. Open http://localhost:5173
4. Follow "Testing the Application" section above

**Enjoy! 🎓**
