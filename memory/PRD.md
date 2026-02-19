# DECODE MATHS - Product Requirements Document

## Project Overview
**Name**: DECODE MATHS  
**Type**: Question Bank Website for Mathematics  
**Target Audience**: Students of Class 10, 11, 12, CA Foundation, and JEE  
**Tech Stack**: FastAPI (Python) + React.js + MongoDB + TailwindCSS

## Core Requirements

### Question Bank
- [x] Questions categorized by type (MCQ, Assertion Reason, 2 Marks, 3 Marks, 5 Marks, Case Study)
- [x] Filter by class, chapter, marks, and question type
- [x] SEO-optimized URLs for questions
- [x] Each question can have optional YouTube solution link and correct answer
- [x] Report questions with mistakes feature

### Authentication
- [x] Student sign up/login
- [x] Admin login (separate)
- [x] Google OAuth integration (Emergent-managed)

### Admin Panel
- [x] Add, modify, delete questions
- [x] Assign class, chapter, marks category
- [x] View and manage reported questions

### Design & Branding
- [x] Modern, light background design
- [x] User's logo integrated
- [x] All "Arpit Sir" mentions removed
- [x] Banner removed
- [x] Benefits section (YouTube Solutions, Question Filter, Basic to Advanced, All Question Types)

### Static Pages
- [x] About Us page
- [x] Contact Us form page

### Social Integration
- [x] YouTube channel link: https://www.youtube.com/@decodemathsnow

### Student Review Feature
- [x] Students can submit reviews (rating + text)
- [x] Testimonials section on Landing Page
- [x] Dedicated Reviews page (/reviews)
- [x] Review statistics (average rating, distribution)

### Deployment
- [x] Dockerfile created
- [x] docker-compose.yml created
- [x] DEPLOYMENT.md documentation
- [x] README.md documentation

## Implementation Status

### Completed Features (December 2025)
| Feature | Status | Date |
|---------|--------|------|
| Full-stack scaffolding | ✅ | Dec 2025 |
| User/Admin Authentication | ✅ | Dec 2025 |
| Question Bank CRUD | ✅ | Dec 2025 |
| Filtering System | ✅ | Dec 2025 |
| Admin Dashboard | ✅ | Dec 2025 |
| Question Reporting | ✅ | Dec 2025 |
| Branding Updates | ✅ | Dec 2025 |
| About/Contact Pages | ✅ | Dec 2025 |
| Deployment Files | ✅ | Dec 2025 |
| Student Review Feature | ✅ | Feb 2026 |
| Reviews Display (Landing + Page) | ✅ | Feb 2026 |

## API Endpoints

### Authentication
- `POST /api/auth/register` - Student registration
- `POST /api/auth/login` - Student login
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/google/session` - Google OAuth
- `GET /api/auth/me` - Current user
- `POST /api/auth/logout` - Logout

### Questions
- `GET /api/questions` - List with filters
- `GET /api/questions/:id` - Single question
- `GET /api/questions/stats/overview` - Statistics

### Admin
- `POST /api/admin/questions` - Create question
- `PUT /api/admin/questions/:id` - Update question
- `DELETE /api/admin/questions/:id` - Delete question
- `GET /api/admin/reports` - View reports

### Reviews
- `POST /api/reviews` - Submit review (auth required)
- `GET /api/reviews` - Get all reviews (public)
- `GET /api/reviews/stats` - Review statistics (public)

## Database Schema

### Collections
- `users` - Student and admin accounts
- `questions` - Question bank
- `bookmarks` - User bookmarks
- `progress` - User progress tracking
- `question_reports` - Reported questions
- `reviews` - Student reviews
- `practice_tests` - Generated tests
- `user_sessions` - Session management

## File Structure
```
/app/
├── backend/
│   ├── server.py          # Main FastAPI app
│   ├── seed.py            # Database seeding
│   └── tests/             # Test files
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── ReviewPrompt.js
│       │   ├── TestimonialsSection.js
│       │   └── ui/        # Shadcn components
│       └── pages/
│           ├── LandingPage.js
│           ├── ReviewsPage.js
│           ├── QuestionBankPage.js
│           └── AdminDashboard.js
├── memory/
│   └── PRD.md
├── DEPLOYMENT.md
├── Dockerfile
├── docker-compose.yml
└── README.md
```

## Credentials
- **Admin**: admin@decodemaths.com / admin123
- **Students**: Register via /register

## Next Actions
1. Push code to GitHub (use "Save to Github" feature)

## Backlog/Future Enhancements
- Advanced SEO optimization
- Email notifications for reported questions
- Student progress analytics dashboard
- Mobile app version
