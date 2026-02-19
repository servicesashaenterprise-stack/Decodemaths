import requests
import sys
import json
from datetime import datetime
import uuid

class DecodeMathsAPITester:
    def __init__(self, base_url="https://qbank-decode.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.session_token = None
        self.admin_session_token = None
        self.test_user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        
    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, cookies=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        request_headers = {'Content-Type': 'application/json'}
        if headers:
            request_headers.update(headers)
            
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            response = None
            if method == 'GET':
                response = requests.get(url, headers=request_headers, cookies=cookies)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=request_headers, cookies=cookies)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=request_headers, cookies=cookies)
            elif method == 'DELETE':
                response = requests.delete(url, headers=request_headers, cookies=cookies)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                
                # Extract cookies if present
                if response.cookies and 'session_token' in response.cookies:
                    return success, response.json() if response.content else {}, response.cookies
                
                return success, response.json() if response.content else {}, None
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                if response.content:
                    try:
                        error_data = response.json()
                        print(f"   Error: {error_data}")
                    except:
                        print(f"   Error: {response.text}")
                return False, {}, None

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}, None

    # ============= BASIC HEALTH CHECKS =============
    
    def test_health_check(self):
        """Test basic API availability"""
        success, response, _ = self.run_test(
            "API Health Check",
            "GET",
            "questions/stats/overview",
            200
        )
        return success

    def test_get_classes(self):
        """Test getting available classes"""
        success, response, _ = self.run_test(
            "Get Classes Metadata",
            "GET", 
            "metadata/classes",
            200
        )
        if success:
            classes = response.get('classes', [])
            print(f"   Available classes: {len(classes)}")
        return success

    # ============= AUTH TESTS =============
    
    def test_student_registration(self):
        """Test student registration"""
        test_email = f"test_student_{uuid.uuid4().hex[:8]}@example.com"
        success, response, cookies = self.run_test(
            "Student Registration",
            "POST",
            "auth/register",
            200,
            data={
                "name": "Test Student",
                "email": test_email,
                "password": "test123456"
            }
        )
        if success and cookies:
            self.session_token = cookies.get('session_token')
            self.test_user_id = response.get('user_id')
            print(f"   User ID: {self.test_user_id}")
        return success

    def test_student_login(self):
        """Test student login with new account"""
        test_email = f"test_login_{uuid.uuid4().hex[:8]}@example.com"
        
        # First register
        reg_success, reg_response, reg_cookies = self.run_test(
            "Student Registration for Login Test",
            "POST",
            "auth/register", 
            200,
            data={
                "name": "Test Login User",
                "email": test_email,
                "password": "test123456"
            }
        )
        
        if not reg_success:
            return False
            
        # Then login
        success, response, cookies = self.run_test(
            "Student Login",
            "POST",
            "auth/login",
            200,
            data={
                "email": test_email,
                "password": "test123456"
            }
        )
        return success

    def test_admin_login(self):
        """Test admin login"""
        success, response, cookies = self.run_test(
            "Admin Login",
            "POST",
            "auth/admin/login",
            200,
            data={
                "email": "admin@decodemaths.com",
                "password": "admin123"
            }
        )
        if success and cookies:
            self.admin_session_token = cookies.get('session_token')
            print(f"   Admin logged in successfully")
        return success

    def test_get_current_user(self):
        """Test getting current user info"""
        if not self.session_token:
            print("❌ Skipped - No session token available")
            return False
            
        success, response, _ = self.run_test(
            "Get Current User",
            "GET",
            "auth/me",
            200,
            cookies={'session_token': self.session_token}
        )
        if success:
            print(f"   User: {response.get('name')} ({response.get('role')})")
        return success

    # ============= QUESTION TESTS =============
    
    def test_get_questions(self):
        """Test getting questions list"""
        success, response, _ = self.run_test(
            "Get Questions List",
            "GET",
            "questions",
            200
        )
        if success:
            print(f"   Found {len(response)} questions")
        return success

    def test_get_questions_with_filters(self):
        """Test getting questions with filters"""
        success, response, _ = self.run_test(
            "Get Filtered Questions",
            "GET",
            "questions?class_level=Class 10&limit=5",
            200
        )
        if success:
            print(f"   Found {len(response)} Class 10 questions")
        return success

    def test_get_single_question(self):
        """Test getting single question"""
        # First get list to find a question ID
        list_success, questions_list, _ = self.run_test(
            "Get Questions for Single Test",
            "GET",
            "questions?limit=1",
            200
        )
        
        if not list_success or not questions_list:
            return False
            
        question_id = questions_list[0]['question_id']
        success, response, _ = self.run_test(
            "Get Single Question",
            "GET",
            f"questions/{question_id}",
            200
        )
        if success:
            print(f"   Question: {response.get('question_text', '')[:50]}...")
        return success

    # ============= BOOKMARK TESTS =============
    
    def test_bookmark_operations(self):
        """Test bookmark add/remove operations"""
        if not self.session_token:
            print("❌ Skipped - No session token available") 
            return False
            
        # Get a question to bookmark
        list_success, questions_list, _ = self.run_test(
            "Get Questions for Bookmark Test",
            "GET",
            "questions?limit=1",
            200
        )
        
        if not list_success or not questions_list:
            return False
            
        question_id = questions_list[0]['question_id']
        
        # Add bookmark
        add_success, add_response, _ = self.run_test(
            "Add Bookmark",
            "POST",
            f"bookmarks/{question_id}",
            200,
            cookies={'session_token': self.session_token}
        )
        
        if not add_success:
            return False
            
        # Get bookmarks
        get_success, get_response, _ = self.run_test(
            "Get Bookmarks",
            "GET",
            "bookmarks",
            200,
            cookies={'session_token': self.session_token}
        )
        
        if not get_success:
            return False
            
        print(f"   Found {len(get_response)} bookmarks")
        
        # Remove bookmark
        remove_success, _, _ = self.run_test(
            "Remove Bookmark",
            "DELETE",
            f"bookmarks/{question_id}",
            200,
            cookies={'session_token': self.session_token}
        )
        
        return add_success and get_success and remove_success

    # ============= PROGRESS TESTS =============
    
    def test_progress_tracking(self):
        """Test progress tracking"""
        if not self.session_token:
            print("❌ Skipped - No session token available")
            return False
            
        # Get a question for progress
        list_success, questions_list, _ = self.run_test(
            "Get Questions for Progress Test", 
            "GET",
            "questions?limit=1",
            200
        )
        
        if not list_success or not questions_list:
            return False
            
        question_id = questions_list[0]['question_id']
        
        # Add progress
        add_success, _, _ = self.run_test(
            "Add Progress Entry",
            "POST",
            "progress",
            200,
            data={
                "question_id": question_id,
                "is_correct": True,
                "time_spent": 120
            },
            cookies={'session_token': self.session_token}
        )
        
        # Get progress stats
        stats_success, stats_response, _ = self.run_test(
            "Get Progress Stats",
            "GET",
            "progress/stats",
            200,
            cookies={'session_token': self.session_token}
        )
        
        if stats_success:
            print(f"   Stats: {stats_response.get('total_attempted', 0)} attempted, {stats_response.get('accuracy', 0)}% accuracy")
        
        return add_success and stats_success

    # ============= PRACTICE TEST OPERATIONS =============
    
    def test_practice_test_operations(self):
        """Test practice test creation and retrieval"""
        if not self.session_token:
            print("❌ Skipped - No session token available")
            return False
            
        # Create practice test
        create_success, create_response, _ = self.run_test(
            "Create Practice Test",
            "POST",
            "practice-tests",
            200,
            data={
                "class_level": "Class 10",
                "question_count": 5
            },
            cookies={'session_token': self.session_token}
        )
        
        if not create_success:
            return False
            
        test_id = create_response.get('test_id')
        print(f"   Created test: {test_id}")
        
        # Get practice tests list
        list_success, list_response, _ = self.run_test(
            "Get Practice Tests List",
            "GET",
            "practice-tests",
            200,
            cookies={'session_token': self.session_token}
        )
        
        # Get specific practice test
        get_success, get_response, _ = self.run_test(
            "Get Practice Test Details",
            "GET",
            f"practice-tests/{test_id}",
            200,
            cookies={'session_token': self.session_token}
        )
        
        if get_success:
            questions_count = len(get_response.get('questions', []))
            print(f"   Test contains {questions_count} questions")
        
        return create_success and list_success and get_success

    # ============= ADMIN OPERATIONS =============
    
    def test_admin_question_crud(self):
        """Test admin question CRUD operations"""
        if not self.admin_session_token:
            print("❌ Skipped - No admin session token available")
            return False
            
        # Create question
        create_success, create_response, _ = self.run_test(
            "Admin Create Question",
            "POST",
            "admin/questions",
            200,
            data={
                "question_text": "Test question created via API",
                "question_type": "MCQ",
                "marks": 2,
                "class_level": "Class 10",
                "chapter": "Test Chapter",
                "chapter_number": 1,
                "correct_answer": "A",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "explanation": "Test explanation"
            },
            cookies={'session_token': self.admin_session_token}
        )
        
        if not create_success:
            return False
            
        question_id = create_response.get('question_id')
        print(f"   Created question: {question_id}")
        
        # Update question
        update_success, _, _ = self.run_test(
            "Admin Update Question",
            "PUT",
            f"admin/questions/{question_id}",
            200,
            data={
                "question_text": "Updated test question",
                "explanation": "Updated explanation"
            },
            cookies={'session_token': self.admin_session_token}
        )
        
        # Delete question
        delete_success, _, _ = self.run_test(
            "Admin Delete Question",
            "DELETE",
            f"admin/questions/{question_id}",
            200,
            cookies={'session_token': self.admin_session_token}
        )
        
        return create_success and update_success and delete_success

    def test_admin_reports(self):
        """Test admin reports functionality"""
        if not self.admin_session_token:
            print("❌ Skipped - No admin session token available")
            return False
            
        success, response, _ = self.run_test(
            "Get Admin Reports",
            "GET",
            "admin/reports",
            200,
            cookies={'session_token': self.admin_session_token}
        )
        
        if success:
            print(f"   Found {len(response)} reports")
        
        return success

    # ============= REPORT FUNCTIONALITY =============
    
    def test_question_reporting(self):
        """Test question reporting by students"""
        if not self.session_token:
            print("❌ Skipped - No session token available")
            return False
            
        # Get a question to report
        list_success, questions_list, _ = self.run_test(
            "Get Questions for Report Test",
            "GET", 
            "questions?limit=1",
            200
        )
        
        if not list_success or not questions_list:
            return False
            
        question_id = questions_list[0]['question_id']
        
        success, _, _ = self.run_test(
            "Submit Question Report",
            "POST",
            "reports",
            200,
            data={
                "question_id": question_id,
                "issue_description": "This is a test report via API"
            },
            cookies={'session_token': self.session_token}
        )
        
        return success

def main():
    print("🚀 Starting DECODE MATHS Backend API Testing...")
    print("=" * 60)
    
    tester = DecodeMathsAPITester()
    
    # Basic health checks
    print("\n📋 BASIC HEALTH CHECKS")
    print("-" * 30)
    tester.test_health_check()
    tester.test_get_classes()
    
    # Authentication tests
    print("\n🔐 AUTHENTICATION TESTS")
    print("-" * 30)
    tester.test_student_registration()
    tester.test_student_login()
    tester.test_admin_login()
    tester.test_get_current_user()
    
    # Question tests
    print("\n📚 QUESTION TESTS")
    print("-" * 30)
    tester.test_get_questions()
    tester.test_get_questions_with_filters()
    tester.test_get_single_question()
    
    # User functionality tests
    print("\n👤 USER FUNCTIONALITY TESTS")
    print("-" * 30)
    tester.test_bookmark_operations()
    tester.test_progress_tracking()
    tester.test_practice_test_operations()
    tester.test_question_reporting()
    
    # Admin tests
    print("\n👑 ADMIN TESTS")
    print("-" * 30)
    tester.test_admin_question_crud()
    tester.test_admin_reports()
    
    # Summary
    print("\n" + "=" * 60)
    print(f"📊 FINAL RESULTS: {tester.tests_passed}/{tester.tests_run} tests passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())