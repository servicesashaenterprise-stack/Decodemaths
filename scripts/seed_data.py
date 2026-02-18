import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone
import uuid
import bcrypt
import os

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'test_database')

async def seed_database():
    client = AsyncIOMotorClient(mongo_url)
    db = client[db_name]
    
    print("Seeding database...")
    
    # Create admin user
    admin_password = bcrypt.hashpw("admin123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    admin_user = {
        "user_id": f"user_{uuid.uuid4().hex[:12]}",
        "email": "admin@decodemaths.com",
        "name": "Admin User",
        "password": admin_password,
        "picture": None,
        "role": "admin",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    existing_admin = await db.users.find_one({"email": "admin@decodemaths.com"})
    if not existing_admin:
        await db.users.insert_one(admin_user)
        print(f"✅ Admin user created: admin@decodemaths.com / admin123")
    else:
        print("✅ Admin user already exists")
    
    # Sample questions for different classes
    questions_data = [
        # Class 10 Questions
        {
            "question_text": "If the sum of first n terms of an AP is 3n² + 5n, then which of the following is not true?",
            "question_type": "MCQ",
            "marks": 1,
            "class_level": "Class 10",
            "chapter": "Arithmetic Progressions",
            "chapter_number": 5,
            "correct_answer": "Option B",
            "options": ["First term is 8", "Common difference is 3", "Common difference is 6", "First term is 5"],
            "explanation": "For AP with sum formula Sn = 3n² + 5n, first term a = S₁ = 8 and common difference d = 6"
        },
        {
            "question_text": "Find the roots of the quadratic equation x² - 5x + 6 = 0",
            "question_type": "MCQ",
            "marks": 1,
            "class_level": "Class 10",
            "chapter": "Quadratic Equations",
            "chapter_number": 4,
            "correct_answer": "x = 2, 3",
            "options": ["x = 1, 6", "x = 2, 3", "x = -2, -3", "x = 0, 5"],
            "explanation": "Factoring: (x-2)(x-3) = 0, so x = 2 or x = 3"
        },
        {
            "question_text": "Prove that √5 is an irrational number.",
            "question_type": "3 Marks",
            "marks": 3,
            "class_level": "Class 10",
            "chapter": "Real Numbers",
            "chapter_number": 1,
            "explanation": "Use contradiction method: Assume √5 is rational, then √5 = p/q where p,q are coprime integers. Squaring both sides leads to contradiction."
        },
        {
            "question_text": "The angle of elevation of the top of a tower from a point on the ground 30m away from its foot is 60°. Find the height of the tower.",
            "question_type": "2 Marks",
            "marks": 2,
            "class_level": "Class 10",
            "chapter": "Some Applications of Trigonometry",
            "chapter_number": 9,
            "correct_answer": "30√3 meters",
            "explanation": "Using tan(60°) = height/30, height = 30 × √3 = 30√3 meters"
        },
        {
            "question_text": "Assertion (A): For any two positive integers a and b, HCF(a,b) × LCM(a,b) = a × b\\n\\nReason (R): HCF is always a factor of LCM",
            "question_type": "Assertion Reason",
            "marks": 1,
            "class_level": "Class 10",
            "chapter": "Real Numbers",
            "chapter_number": 1,
            "correct_answer": "Both A and R are true and R is the correct explanation of A",
            "options": [
                "Both A and R are true and R is the correct explanation of A",
                "Both A and R are true but R is not the correct explanation of A",
                "A is true but R is false",
                "A is false but R is true"
            ]
        },
        
        # Class 11 Questions
        {
            "question_text": "Find the derivative of f(x) = x³ + 2x² - 5x + 7",
            "question_type": "2 Marks",
            "marks": 2,
            "class_level": "Class 11",
            "chapter": "Limits and Derivatives",
            "chapter_number": 13,
            "correct_answer": "3x² + 4x - 5",
            "explanation": "Using power rule: f'(x) = 3x² + 4x - 5"
        },
        {
            "question_text": "In how many ways can 5 people be seated in a row?",
            "question_type": "MCQ",
            "marks": 1,
            "class_level": "Class 11",
            "chapter": "Permutations and Combinations",
            "chapter_number": 7,
            "correct_answer": "120",
            "options": ["24", "60", "120", "720"],
            "explanation": "5! = 5 × 4 × 3 × 2 × 1 = 120"
        },
        {
            "question_text": "Find the sum of first 20 terms of the series: 2 + 4 + 6 + 8 + ...",
            "question_type": "3 Marks",
            "marks": 3,
            "class_level": "Class 11",
            "chapter": "Sequences and Series",
            "chapter_number": 9,
            "correct_answer": "420",
            "explanation": "This is an AP with a=2, d=2, n=20. Using Sn = n/2[2a + (n-1)d] = 20/2[4 + 38] = 420"
        },
        {
            "question_text": "Solve the inequality: 3x + 7 > 2x + 1",
            "question_type": "2 Marks",
            "marks": 2,
            "class_level": "Class 11",
            "chapter": "Linear Inequalities",
            "chapter_number": 6,
            "correct_answer": "x > -6",
            "explanation": "3x - 2x > 1 - 7, x > -6"
        },
        
        # Class 12 Questions
        {
            "question_text": "Find ∫(2x + 3)dx",
            "question_type": "MCQ",
            "marks": 1,
            "class_level": "Class 12",
            "chapter": "Integrals",
            "chapter_number": 7,
            "correct_answer": "x² + 3x + C",
            "options": ["2x² + 3x + C", "x² + 3x + C", "x² + x + C", "2x + C"],
            "explanation": "∫(2x + 3)dx = x² + 3x + C"
        },
        {
            "question_text": "Find the area of the region bounded by the curve y = x² and the line y = 4.",
            "question_type": "5 Marks",
            "marks": 5,
            "class_level": "Class 12",
            "chapter": "Application of Integrals",
            "chapter_number": 8,
            "correct_answer": "32/3 square units",
            "explanation": "Intersection points: x² = 4, x = ±2. Area = ∫₋₂² (4 - x²)dx = 32/3 square units"
        },
        {
            "question_text": "If A = [1 2; 3 4] and B = [2 0; 1 3], find AB",
            "question_type": "3 Marks",
            "marks": 3,
            "class_level": "Class 12",
            "chapter": "Matrices",
            "chapter_number": 3,
            "correct_answer": "[[4, 6], [10, 12]]",
            "explanation": "Matrix multiplication: AB = [[1×2+2×1, 1×0+2×3], [3×2+4×1, 3×0+4×3]] = [[4,6], [10,12]]"
        },
        {
            "question_text": "Assertion (A): Every LPP has a unique optimal solution\\n\\nReason (R): The feasible region of an LPP is always bounded",
            "question_type": "Assertion Reason",
            "marks": 1,
            "class_level": "Class 12",
            "chapter": "Linear Programming",
            "chapter_number": 12,
            "correct_answer": "Both A and R are false",
            "options": [
                "Both A and R are true and R is the correct explanation of A",
                "Both A and R are true but R is not the correct explanation of A",
                "A is true but R is false",
                "Both A and R are false"
            ]
        },
        {
            "question_text": "A bag contains 5 red and 3 blue balls. Two balls are drawn at random. What is the probability that both are red?",
            "question_type": "3 Marks",
            "marks": 3,
            "class_level": "Class 12",
            "chapter": "Probability",
            "chapter_number": 13,
            "correct_answer": "5/14",
            "explanation": "P(both red) = (5C2)/(8C2) = (10)/(28) = 5/14"
        },
        
        # CA Foundation Questions
        {
            "question_text": "If log₁₀2 = 0.3010, find the number of digits in 2²⁰",
            "question_type": "2 Marks",
            "marks": 2,
            "class_level": "CA Foundation",
            "chapter": "Logarithms",
            "chapter_number": 3,
            "correct_answer": "7 digits",
            "explanation": "log₁₀(2²⁰) = 20 × 0.3010 = 6.02, so number of digits = 7"
        },
        {
            "question_text": "A sum of money doubles itself in 5 years at simple interest. In how many years will it become 4 times?",
            "question_type": "MCQ",
            "marks": 1,
            "class_level": "CA Foundation",
            "chapter": "Simple and Compound Interest",
            "chapter_number": 5,
            "correct_answer": "15 years",
            "options": ["10 years", "12 years", "15 years", "20 years"],
            "explanation": "If doubles in 5 years, rate = 20%. To become 4 times (300% interest), time = 300/20 = 15 years"
        },
        {
            "question_text": "Find the ratio in which the line 3x + 4y = 7 divides the line segment joining A(1,2) and B(3,4)",
            "question_type": "3 Marks",
            "marks": 3,
            "class_level": "CA Foundation",
            "chapter": "Coordinate Geometry",
            "chapter_number": 8,
            "explanation": "Using section formula and substituting in the line equation to find the ratio"
        },
        
        # JEE Questions
        {
            "question_text": "If f(x) = x³ - 6x² + 11x - 6 and f(2) = 0, find all roots of f(x) = 0",
            "question_type": "MCQ",
            "marks": 4,
            "class_level": "JEE",
            "chapter": "Theory of Equations",
            "chapter_number": 5,
            "correct_answer": "x = 1, 2, 3",
            "options": ["x = 1, 2, 3", "x = 0, 2, 3", "x = -1, 2, 3", "x = 1, 2, 4"],
            "explanation": "Since f(2) = 0, (x-2) is a factor. Dividing: (x-2)(x²-4x+3) = (x-2)(x-1)(x-3)"
        },
        {
            "question_text": "Evaluate: lim(x→0) (sin3x + sin5x)/x",
            "question_type": "3 Marks",
            "marks": 3,
            "class_level": "JEE",
            "chapter": "Limits",
            "chapter_number": 13,
            "correct_answer": "8",
            "explanation": "lim(x→0) sin3x/x + lim(x→0) sin5x/x = 3 + 5 = 8"
        },
        {
            "question_text": "Find the shortest distance between the lines: (x-1)/2 = (y-2)/3 = (z-3)/4 and (x-2)/3 = (y-4)/4 = (z-5)/5",
            "question_type": "5 Marks",
            "marks": 5,
            "class_level": "JEE",
            "chapter": "Three Dimensional Geometry",
            "chapter_number": 11,
            "explanation": "Use the formula for shortest distance between skew lines with given direction ratios and points"
        },
        {
            "question_text": "A circle touches the x-axis and passes through the point (4,3). If the center lies on the line x - y = 1, find the equation of the circle.",
            "question_type": "5 Marks",
            "marks": 5,
            "class_level": "JEE",
            "chapter": "Circle",
            "chapter_number": 7,
            "explanation": "Let center be (h, h-1). Since circle touches x-axis, radius = |h-1|. Use distance formula with point (4,3)"
        },
        {
            "question_text": "If A and B are independent events with P(A) = 0.3 and P(B) = 0.5, find P(A ∪ B)",
            "question_type": "2 Marks",
            "marks": 2,
            "class_level": "JEE",
            "chapter": "Probability",
            "chapter_number": 16,
            "correct_answer": "0.65",
            "options": ["0.65", "0.8", "0.15", "0.35"],
            "explanation": "P(A ∪ B) = P(A) + P(B) - P(A ∩ B) = 0.3 + 0.5 - (0.3 × 0.5) = 0.65"
        },
    ]
    
    # Insert questions
    existing_count = await db.questions.count_documents({})
    if existing_count == 0:
        now = datetime.now(timezone.utc).isoformat()
        for q_data in questions_data:
            question_doc = {
                "question_id": f"q_{uuid.uuid4().hex[:12]}",
                **q_data,
                "created_at": now,
                "updated_at": now
            }
            await db.questions.insert_one(question_doc)
        print(f"✅ {len(questions_data)} sample questions created")
    else:
        print(f"✅ Questions already exist ({existing_count} questions)")
    
    # Create indexes
    await db.questions.create_index([("class_level", 1), ("chapter", 1)])
    await db.questions.create_index([("question_type", 1)])
    await db.bookmarks.create_index([("user_id", 1), ("question_id", 1)])
    await db.progress.create_index([("user_id", 1)])
    await db.user_sessions.create_index([("session_token", 1)])
    print("✅ Database indexes created")
    
    client.close()
    print("\\n✨ Database seeding completed!")
    print("\\n📝 Admin credentials:")
    print("   Email: admin@decodemaths.com")
    print("   Password: admin123")

if __name__ == "__main__":
    asyncio.run(seed_database())
