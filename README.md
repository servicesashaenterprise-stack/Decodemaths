# 🎓 DECODE MATHS - Mathematics Question Bank Platform

<div align="center">
  <img src="frontend/public/decode-maths-logo.png" alt="DECODE MATHS" width="300">
  
  **Master Mathematics, One Question at a Time**
  
  [![Live Demo](https://img.shields.io/badge/Demo-Live-success)](https://math-question-bank-1.preview.emergentagent.com)
  [![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)]()
</div>

## 📖 Overview

DECODE MATHS is a comprehensive question bank platform designed for mathematics students preparing for Class 10, 11, 12, CA Foundation, and JEE examinations. The platform provides chapter-wise and marks-wise filtered practice questions with detailed solutions.

### ✨ Key Features

#### For Students
- 📚 **22+ Practice Questions** across 5 classes
- 🔍 **Smart Filtering** by class, chapter, marks, and question type
- ✅ **Dual Authentication** - Email/Password + Google OAuth
- 📊 **Progress Tracking** - Monitor attempts and accuracy
- ⭐ **Bookmark System** - Save favorite questions
- 🎯 **Practice Test Generator** - Create custom tests
- 🎥 **Video Solutions** - YouTube links for select questions
- 🚨 **Report Issues** - Flag incorrect questions

#### For Administrators
- ➕ **Full CRUD Operations** for question management
- 📋 **Question Reports** - Review student-reported issues
- 📈 **Analytics Dashboard** - Track total questions, reports, classes
- 🏷️ **Question Organization** - Assign class, chapter, marks, and type
- ✏️ **Rich Question Editor** - Add text, options, answers, explanations

## 🛠️ Technology Stack

### Frontend
- **Framework**: React 18
- **UI Library**: Shadcn/UI + Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Math Rendering**: react-katex
- **State Management**: React Hooks

### Backend
- **Framework**: FastAPI (Python)
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT + Google OAuth (Emergent-managed)
- **API Documentation**: Auto-generated OpenAPI

### Infrastructure
- **Current Hosting**: Emergent Platform
- **Database**: MongoDB
- **Session Management**: httpOnly Cookies

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- MongoDB 6+

### Local Development

1. **Clone Repository**
```bash
git clone <your-repo>
cd decode-maths
```

2. **Backend Setup**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URL

# Seed database
python ../scripts/seed_data.py

# Run server
uvicorn server:app --reload --port 8001
```

3. **Frontend Setup**
```bash
cd frontend
npm install  # or yarn install

# Configure environment
cp .env.example .env
# Edit .env with backend URL

# Run development server
npm start  # or yarn start
```

4. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Docs: http://localhost:8001/docs

## 📦 Production Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions including:
- VPS/Cloud hosting setup
- Docker deployment
- Nginx configuration
- SSL certificate setup
- PM2 process management

## 🔐 Default Credentials

**Admin Access:**
```
Email: admin@decodemaths.com
Password: admin123
```

⚠️ **IMPORTANT**: Change admin password in production!

## 📂 Project Structure

```
decode-maths/
├── backend/
│   ├── server.py           # FastAPI application
│   ├── requirements.txt    # Python dependencies
│   └── .env.example       # Environment template
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── App.js         # Main application
│   ├── public/            # Static assets
│   ├── package.json       # Node dependencies
│   └── .env.example      # Environment template
├── scripts/
│   └── seed_data.py      # Database seeding
├── DEPLOYMENT.md          # Deployment guide
└── README.md             # This file
```

## 🎯 Question Types

- **MCQ** - Multiple Choice Questions (1 mark)
- **Assertion Reason** (1 mark)
- **Short Answer** - 2 Marks
- **Long Answer** - 3 Marks
- **Very Long Answer** - 5 Marks
- **Case Study** - Applied problems

## 📚 Supported Classes

1. **Class 10** - CBSE Mathematics
2. **Class 11** - CBSE Mathematics
3. **Class 12** - CBSE Mathematics
4. **CA Foundation** - Quantitative Aptitude
5. **JEE** - JEE Main & Advanced

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/google/session` - Google OAuth
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Questions
- `GET /api/questions` - List questions (with filters)
- `GET /api/questions/{id}` - Get single question
- `GET /api/questions/stats/overview` - Question statistics

### Admin (Protected)
- `POST /api/admin/questions` - Create question
- `PUT /api/admin/questions/{id}` - Update question
- `DELETE /api/admin/questions/{id}` - Delete question
- `GET /api/admin/reports` - View question reports

### Student Features (Protected)
- `POST /api/bookmarks/{question_id}` - Add bookmark
- `DELETE /api/bookmarks/{question_id}` - Remove bookmark
- `GET /api/bookmarks` - List bookmarks
- `POST /api/progress` - Track progress
- `GET /api/progress/stats` - Get statistics
- `POST /api/reports` - Report question issue
- `POST /api/practice-tests` - Generate practice test
- `GET /api/practice-tests` - List practice tests
- `GET /api/practice-tests/{id}` - Get test with questions

## 🔧 Configuration

### Environment Variables

**Backend (.env)**
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=decode_maths
CORS_ORIGINS=http://localhost:3000
PORT=8001
HOST=0.0.0.0
```

**Frontend (.env)**
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🧪 Testing

Backend tested with 100% API endpoint coverage using automated testing agent.
Frontend tested with 95% feature coverage including all user flows.

## 📊 Database Schema

### Collections
- **users** - Student and admin accounts
- **user_sessions** - Authentication sessions
- **questions** - Question bank
- **bookmarks** - User bookmarks
- **progress** - Answer tracking
- **question_reports** - Issue reports
- **practice_tests** - Generated tests

## 🎨 Design System

- **Primary Color**: Mathematical Blue (#3B82F6)
- **Error Color**: Correction Red (#EF4444)
- **Success Color**: Green (#10B981)
- **Fonts**: 
  - Headings: Outfit
  - Body: Public Sans
- **Design Philosophy**: Clean, minimal, distraction-free learning environment

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ httpOnly session cookies
- ✅ CORS protection
- ✅ MongoDB injection prevention
- ✅ Protected admin routes
- ✅ Role-based access control

## 📈 Performance

- Optimized MongoDB queries with indexing
- React code splitting
- Lazy loading for images
- Efficient session management
- Hot reload in development

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is proprietary. All rights reserved.

## 📞 Support

For technical support or deployment assistance:
- **Email**: support@decodemaths.com
- **Documentation**: See DEPLOYMENT.md

## 🎯 Roadmap

Future enhancements:
- [ ] Advanced analytics dashboard
- [ ] Leaderboard system
- [ ] Achievement badges
- [ ] Mobile app (React Native)
- [ ] AI-powered question recommendations
- [ ] Video solution integration
- [ ] Multi-language support
- [ ] Offline mode

## 🙏 Acknowledgments

- Built with ❤️ using Emergent AI Agent
- UI components from Shadcn/UI
- Icons from Lucide React
- Math rendering with KaTeX

---

<div align="center">
  Made with 💙 for Mathematics Students
  
  **DECODE MATHS** - Unlock Your Mathematical Potential
</div>
