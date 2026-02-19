"""
Test suite for DECODE MATHS Review feature
Tests: POST /api/reviews (auth required), GET /api/reviews, GET /api/reviews/stats
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestReviewsAPI:
    """Review endpoints tests"""
    
    # Class-level variables to share data between tests
    session = None
    test_user_email = None
    test_user_name = None
    
    @classmethod
    def setup_class(cls):
        """Setup: Create a test user and get session"""
        cls.session = requests.Session()
        cls.session.headers.update({"Content-Type": "application/json"})
        
        # Generate unique test user
        unique_id = uuid.uuid4().hex[:8]
        cls.test_user_email = f"TEST_reviewer_{unique_id}@test.com"
        cls.test_user_name = f"Test Reviewer {unique_id}"
        
        # Register the test user
        response = cls.session.post(f"{BASE_URL}/api/auth/register", json={
            "email": cls.test_user_email,
            "password": "testpass123",
            "name": cls.test_user_name
        })
        
        if response.status_code == 200:
            print(f"Test user registered: {cls.test_user_email}")
        elif response.status_code == 400:
            # User might already exist, try login
            response = cls.session.post(f"{BASE_URL}/api/auth/login", json={
                "email": cls.test_user_email,
                "password": "testpass123"
            })
        
        assert response.status_code == 200, f"Failed to setup test user: {response.text}"

    # ==================== PUBLIC ENDPOINTS ====================

    def test_get_reviews_public_access(self):
        """GET /api/reviews - should be publicly accessible"""
        response = requests.get(f"{BASE_URL}/api/reviews")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        print(f"PASS: GET /api/reviews returned {len(data)} reviews")

    def test_get_reviews_with_limit(self):
        """GET /api/reviews?limit=5 - should respect limit parameter"""
        response = requests.get(f"{BASE_URL}/api/reviews?limit=5")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) <= 5
        print(f"PASS: GET /api/reviews with limit returned {len(data)} reviews (max 5)")

    def test_get_reviews_stats_public_access(self):
        """GET /api/reviews/stats - should be publicly accessible"""
        response = requests.get(f"{BASE_URL}/api/reviews/stats")
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate response structure
        assert "total" in data
        assert "average_rating" in data
        assert "rating_distribution" in data
        
        # Validate data types
        assert isinstance(data["total"], int)
        assert isinstance(data["average_rating"], (int, float))
        assert isinstance(data["rating_distribution"], dict)
        
        print(f"PASS: GET /api/reviews/stats - total={data['total']}, avg={data['average_rating']}")

    # ==================== AUTHENTICATED ENDPOINTS ====================

    def test_submit_review_without_auth(self):
        """POST /api/reviews - should require authentication"""
        response = requests.post(f"{BASE_URL}/api/reviews", json={
            "rating": 5,
            "review_text": "Test review without auth"
        })
        
        # Should return 401 Unauthorized
        assert response.status_code == 401
        print("PASS: POST /api/reviews returns 401 without authentication")

    def test_submit_review_with_auth(self):
        """POST /api/reviews - should work with valid auth and valid data"""
        response = self.session.post(f"{BASE_URL}/api/reviews", json={
            "rating": 5,
            "review_text": "This is a great platform for math practice!"
        })
        
        # Should succeed
        assert response.status_code == 200, f"Failed to submit review: {response.text}"
        
        data = response.json()
        
        # Validate response structure
        assert "review_id" in data
        assert "user_id" in data
        assert "user_name" in data
        assert "rating" in data
        assert "review_text" in data
        assert "created_at" in data
        
        # Validate values
        assert data["rating"] == 5
        assert data["review_text"] == "This is a great platform for math practice!"
        assert data["user_name"] == self.test_user_name
        
        print(f"PASS: POST /api/reviews - review created with id={data['review_id']}")
        
        # Store for verification
        self.__class__.review_id = data["review_id"]

    def test_submit_duplicate_review(self):
        """POST /api/reviews - should prevent duplicate reviews from same user"""
        response = self.session.post(f"{BASE_URL}/api/reviews", json={
            "rating": 4,
            "review_text": "Trying to submit another review"
        })
        
        # Should return 400 Bad Request
        assert response.status_code == 400
        assert "already submitted" in response.json().get("detail", "").lower()
        print("PASS: POST /api/reviews prevents duplicate reviews")

    def test_submit_review_invalid_rating_low(self):
        """POST /api/reviews - should reject rating < 1"""
        # Need a new user for this test since we already submitted a review
        new_session = requests.Session()
        new_session.headers.update({"Content-Type": "application/json"})
        
        unique_id = uuid.uuid4().hex[:8]
        new_email = f"TEST_reviewer_invalid_{unique_id}@test.com"
        
        response = new_session.post(f"{BASE_URL}/api/auth/register", json={
            "email": new_email,
            "password": "testpass123",
            "name": f"Test User {unique_id}"
        })
        
        if response.status_code == 200:
            # Try invalid rating
            response = new_session.post(f"{BASE_URL}/api/reviews", json={
                "rating": 0,
                "review_text": "Invalid rating test"
            })
            
            assert response.status_code == 400
            print("PASS: POST /api/reviews rejects rating < 1")
        else:
            pytest.skip("Could not create test user for invalid rating test")

    def test_submit_review_invalid_rating_high(self):
        """POST /api/reviews - should reject rating > 5"""
        new_session = requests.Session()
        new_session.headers.update({"Content-Type": "application/json"})
        
        unique_id = uuid.uuid4().hex[:8]
        new_email = f"TEST_reviewer_high_{unique_id}@test.com"
        
        response = new_session.post(f"{BASE_URL}/api/auth/register", json={
            "email": new_email,
            "password": "testpass123",
            "name": f"Test User {unique_id}"
        })
        
        if response.status_code == 200:
            response = new_session.post(f"{BASE_URL}/api/reviews", json={
                "rating": 6,
                "review_text": "Invalid rating test"
            })
            
            assert response.status_code == 400
            print("PASS: POST /api/reviews rejects rating > 5")
        else:
            pytest.skip("Could not create test user for high rating test")

    # ==================== DATA PERSISTENCE VERIFICATION ====================

    def test_verify_review_persisted(self):
        """Verify the submitted review appears in GET /api/reviews"""
        response = requests.get(f"{BASE_URL}/api/reviews?limit=50")
        
        assert response.status_code == 200
        reviews = response.json()
        
        # Find our review
        our_review = None
        for review in reviews:
            if review.get("review_id") == getattr(self.__class__, 'review_id', None):
                our_review = review
                break
        
        if hasattr(self.__class__, 'review_id'):
            assert our_review is not None, "Submitted review not found in GET /api/reviews"
            assert our_review["rating"] == 5
            assert our_review["review_text"] == "This is a great platform for math practice!"
            print(f"PASS: Review {our_review['review_id']} verified in GET /api/reviews")
        else:
            pytest.skip("Review ID not available from previous test")

    def test_verify_stats_updated(self):
        """Verify stats reflect the new review"""
        response = requests.get(f"{BASE_URL}/api/reviews/stats")
        
        assert response.status_code == 200
        data = response.json()
        
        # After our test, there should be at least 1 review
        assert data["total"] >= 1
        assert data["average_rating"] > 0
        
        print(f"PASS: Stats show total={data['total']}, avg={data['average_rating']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
