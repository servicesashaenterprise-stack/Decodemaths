"""
Test suite for DECODE MATHS Admin Review Management feature
Tests: GET /api/admin/reviews, POST /api/admin/reviews/{id}/reply, DELETE /api/admin/reviews/{id}
"""
import pytest
import requests
import os
import uuid

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminReviewsAPI:
    """Admin review management endpoint tests"""
    
    admin_session = None
    student_session = None
    test_review_id = None
    
    @classmethod
    def setup_class(cls):
        """Setup: Login as admin and create test student with review"""
        # Admin session
        cls.admin_session = requests.Session()
        cls.admin_session.headers.update({"Content-Type": "application/json"})
        
        response = cls.admin_session.post(f"{BASE_URL}/api/auth/admin/login", json={
            "email": "admin@decodemaths.com",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Admin login failed: {response.text}"
        print(f"Admin logged in successfully")
        
        # Student session for 403 tests
        cls.student_session = requests.Session()
        cls.student_session.headers.update({"Content-Type": "application/json"})
        
        unique_id = uuid.uuid4().hex[:8]
        cls.test_student_email = f"TEST_admin_review_{unique_id}@test.com"
        
        response = cls.student_session.post(f"{BASE_URL}/api/auth/register", json={
            "email": cls.test_student_email,
            "password": "testpass123",
            "name": f"Test Student {unique_id}"
        })
        
        if response.status_code == 200:
            print(f"Test student registered: {cls.test_student_email}")
            
            # Create a review for testing
            review_resp = cls.student_session.post(f"{BASE_URL}/api/reviews", json={
                "rating": 4,
                "review_text": f"TEST review for admin management {unique_id}"
            })
            if review_resp.status_code == 200:
                cls.test_review_id = review_resp.json().get("review_id")
                print(f"Test review created: {cls.test_review_id}")
    
    # ==================== AUTH CHECKS ====================
    
    def test_admin_reviews_requires_auth(self):
        """GET /api/admin/reviews - returns 403 without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/reviews")
        assert response.status_code == 403
        assert "Admin access required" in response.json().get("detail", "")
        print("PASS: GET /api/admin/reviews returns 403 without auth")
    
    def test_admin_reviews_rejects_student(self):
        """GET /api/admin/reviews - returns 403 for non-admin user"""
        response = self.student_session.get(f"{BASE_URL}/api/admin/reviews")
        assert response.status_code == 403
        assert "Admin access required" in response.json().get("detail", "")
        print("PASS: GET /api/admin/reviews returns 403 for student")
    
    def test_reply_requires_auth(self):
        """POST /api/admin/reviews/{id}/reply - returns 403 without auth"""
        response = requests.post(f"{BASE_URL}/api/admin/reviews/test_id/reply", json={
            "reply_text": "Test reply"
        })
        assert response.status_code == 403
        print("PASS: POST /api/admin/reviews/{id}/reply returns 403 without auth")
    
    def test_reply_rejects_student(self):
        """POST /api/admin/reviews/{id}/reply - returns 403 for non-admin"""
        if not self.test_review_id:
            pytest.skip("No test review available")
        
        response = self.student_session.post(
            f"{BASE_URL}/api/admin/reviews/{self.test_review_id}/reply",
            json={"reply_text": "Student trying to reply"}
        )
        assert response.status_code == 403
        print("PASS: POST /api/admin/reviews/{id}/reply returns 403 for student")
    
    def test_delete_requires_auth(self):
        """DELETE /api/admin/reviews/{id} - returns 403 without auth"""
        response = requests.delete(f"{BASE_URL}/api/admin/reviews/test_id")
        assert response.status_code == 403
        print("PASS: DELETE /api/admin/reviews/{id} returns 403 without auth")
    
    def test_delete_rejects_student(self):
        """DELETE /api/admin/reviews/{id} - returns 403 for non-admin"""
        if not self.test_review_id:
            pytest.skip("No test review available")
        
        response = self.student_session.delete(
            f"{BASE_URL}/api/admin/reviews/{self.test_review_id}"
        )
        assert response.status_code == 403
        print("PASS: DELETE /api/admin/reviews/{id} returns 403 for student")
    
    # ==================== ADMIN FUNCTIONALITY ====================
    
    def test_admin_get_all_reviews(self):
        """GET /api/admin/reviews - admin can fetch all reviews"""
        response = self.admin_session.get(f"{BASE_URL}/api/admin/reviews")
        
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        
        # Validate review structure
        if len(data) > 0:
            review = data[0]
            assert "review_id" in review
            assert "user_id" in review
            assert "user_name" in review
            assert "rating" in review
            assert "review_text" in review
            assert "created_at" in review
            # Admin-specific fields
            assert "admin_reply" in review
            assert "admin_reply_at" in review
        
        print(f"PASS: GET /api/admin/reviews returned {len(data)} reviews")
    
    def test_admin_reply_to_review(self):
        """POST /api/admin/reviews/{id}/reply - admin can reply to review"""
        if not self.test_review_id:
            pytest.skip("No test review available")
        
        reply_text = f"Thank you for your feedback! - Test reply {uuid.uuid4().hex[:6]}"
        
        response = self.admin_session.post(
            f"{BASE_URL}/api/admin/reviews/{self.test_review_id}/reply",
            json={"reply_text": reply_text}
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Validate reply was added
        assert data["admin_reply"] == reply_text
        assert data["admin_reply_at"] is not None
        assert data["review_id"] == self.test_review_id
        
        print(f"PASS: Admin reply added to review {self.test_review_id}")
        
        # Store reply for verification
        self.__class__.test_reply_text = reply_text
    
    def test_admin_edit_reply(self):
        """POST /api/admin/reviews/{id}/reply - admin can edit existing reply"""
        if not self.test_review_id:
            pytest.skip("No test review available")
        
        new_reply = f"Updated reply text - {uuid.uuid4().hex[:6]}"
        
        response = self.admin_session.post(
            f"{BASE_URL}/api/admin/reviews/{self.test_review_id}/reply",
            json={"reply_text": new_reply}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["admin_reply"] == new_reply
        
        print(f"PASS: Admin reply updated for review {self.test_review_id}")
        
        # Update stored reply
        self.__class__.test_reply_text = new_reply
    
    def test_reply_persists_in_public_reviews(self):
        """Admin reply should appear in public GET /api/reviews"""
        if not self.test_review_id or not hasattr(self, 'test_reply_text'):
            pytest.skip("No test review/reply available")
        
        response = requests.get(f"{BASE_URL}/api/reviews?limit=50")
        assert response.status_code == 200
        
        reviews = response.json()
        our_review = next((r for r in reviews if r["review_id"] == self.test_review_id), None)
        
        assert our_review is not None, "Test review not found in public reviews"
        assert our_review["admin_reply"] == self.test_reply_text
        
        print(f"PASS: Admin reply visible in public reviews")
    
    def test_reply_to_nonexistent_review(self):
        """POST /api/admin/reviews/{id}/reply - 404 for non-existent review"""
        response = self.admin_session.post(
            f"{BASE_URL}/api/admin/reviews/nonexistent_review_id/reply",
            json={"reply_text": "Test reply"}
        )
        
        assert response.status_code == 404
        assert "not found" in response.json().get("detail", "").lower()
        print("PASS: Reply to non-existent review returns 404")
    
    def test_admin_delete_review(self):
        """DELETE /api/admin/reviews/{id} - admin can delete review"""
        # Create a new review to delete
        unique_id = uuid.uuid4().hex[:8]
        temp_session = requests.Session()
        temp_session.headers.update({"Content-Type": "application/json"})
        
        # Register temp user
        temp_session.post(f"{BASE_URL}/api/auth/register", json={
            "email": f"TEST_delete_{unique_id}@test.com",
            "password": "testpass123",
            "name": f"Delete Test {unique_id}"
        })
        
        # Create review
        review_resp = temp_session.post(f"{BASE_URL}/api/reviews", json={
            "rating": 2,
            "review_text": f"TEST review to delete {unique_id}"
        })
        
        if review_resp.status_code != 200:
            pytest.skip("Could not create review for delete test")
        
        delete_review_id = review_resp.json().get("review_id")
        
        # Delete as admin
        delete_resp = self.admin_session.delete(
            f"{BASE_URL}/api/admin/reviews/{delete_review_id}"
        )
        
        assert delete_resp.status_code == 200
        assert "deleted" in delete_resp.json().get("message", "").lower()
        
        # Verify deletion - review should no longer exist
        reviews_resp = requests.get(f"{BASE_URL}/api/reviews?limit=100")
        reviews = reviews_resp.json()
        assert not any(r["review_id"] == delete_review_id for r in reviews), "Deleted review still exists"
        
        print(f"PASS: Admin deleted review {delete_review_id}")
    
    def test_delete_nonexistent_review(self):
        """DELETE /api/admin/reviews/{id} - 404 for non-existent review"""
        response = self.admin_session.delete(
            f"{BASE_URL}/api/admin/reviews/nonexistent_review_id"
        )
        
        assert response.status_code == 404
        assert "not found" in response.json().get("detail", "").lower()
        print("PASS: Delete non-existent review returns 404")


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
