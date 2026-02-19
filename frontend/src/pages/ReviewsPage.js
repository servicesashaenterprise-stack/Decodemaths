import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, ArrowLeft } from 'lucide-react';
import Logo from '@/components/Logo';
import ReviewPrompt from '@/components/ReviewPrompt';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function ReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchReviews();
  }, []);

  const checkAuth = async () => {
    try {
      await axios.get(`${API}/auth/me`, { withCredentials: true });
      setIsAuthenticated(true);
      setHasReviewed(localStorage.getItem('hasReviewed') === 'true');
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        axios.get(`${API}/reviews?limit=50`),
        axios.get(`${API}/reviews/stats`)
      ]);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmitted = () => {
    localStorage.setItem('hasReviewed', 'true');
    setHasReviewed(true);
    setShowReviewForm(false);
    fetchReviews();
  };

  const renderStars = (rating) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderLargeStars = (rating) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-8 w-8 ${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-white sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link to="/">
            <Logo />
          </Link>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/login')} data-testid="nav-login-btn">
              Login
            </Button>
            <Button onClick={() => navigate('/register')} data-testid="nav-register-btn">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back
        </Button>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              Student Reviews
            </Badge>
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              What Students Say About Us
            </h1>
            <p className="text-lg text-muted-foreground">
              Real feedback from students who use DECODE MATHS
            </p>
          </div>

          {stats && stats.total > 0 && (
            <Card className="p-8 mb-8 text-center bg-gradient-to-br from-primary/5 to-transparent border-primary/20" data-testid="review-stats-card">
              <div className="flex justify-center mb-4">
                {renderLargeStars(Math.round(stats.average_rating))}
              </div>
              <p className="text-4xl font-heading font-bold text-primary mb-2">
                {stats.average_rating}
              </p>
              <p className="text-muted-foreground">
                Based on {stats.total} student {stats.total === 1 ? 'review' : 'reviews'}
              </p>
              
              {stats.rating_distribution && Object.keys(stats.rating_distribution).length > 0 && (
                <div className="mt-6 max-w-xs mx-auto space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = stats.rating_distribution[String(rating)] || 0;
                    const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                    return (
                      <div key={rating} className="flex items-center gap-2 text-sm">
                        <span className="w-6">{rating}</span>
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-400 rounded-full transition-all"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="w-8 text-muted-foreground">{count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          )}

          {isAuthenticated && !hasReviewed && (
            <div className="mb-8">
              {showReviewForm ? (
                <ReviewPrompt 
                  onClose={() => setShowReviewForm(false)}
                  onSubmitted={handleReviewSubmitted}
                />
              ) : (
                <Card className="p-6 text-center border-2 border-dashed border-primary/30">
                  <h3 className="text-xl font-heading font-semibold mb-2">
                    Share Your Experience
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Have you used DECODE MATHS? We'd love to hear your feedback!
                  </p>
                  <Button 
                    onClick={() => setShowReviewForm(true)}
                    data-testid="write-review-btn"
                  >
                    Write a Review
                  </Button>
                </Card>
              )}
            </div>
          )}

          {!isAuthenticated && (
            <Card className="p-6 text-center border-2 border-dashed border-primary/30 mb-8">
              <h3 className="text-xl font-heading font-semibold mb-2">
                Want to Share Your Experience?
              </h3>
              <p className="text-muted-foreground mb-4">
                Login or register to leave a review
              </p>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={() => navigate('/login')}>
                  Login
                </Button>
                <Button onClick={() => navigate('/register')}>
                  Register
                </Button>
              </div>
            </Card>
          )}

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : reviews.length === 0 ? (
            <Card className="p-12 text-center">
              <Quote className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-xl font-heading font-semibold mb-2">No Reviews Yet</h3>
              <p className="text-muted-foreground">
                Be the first to share your experience with DECODE MATHS!
              </p>
            </Card>
          ) : (
            <div className="space-y-6" data-testid="reviews-list">
              {reviews.map((review, index) => (
                <Card 
                  key={review.review_id} 
                  className="p-6 hover:shadow-lg transition-shadow"
                  data-testid={`review-item-${index}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-semibold text-lg">
                        {review.user_name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <p className="font-semibold">{review.user_name}</p>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(review.created_at)}
                        </span>
                      </div>
                      {renderStars(review.rating)}
                      <p className="mt-3 text-muted-foreground leading-relaxed">
                        {review.review_text}
                      </p>
                      
                      {review.admin_reply && (
                        <div className="mt-4 bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
                          <p className="text-sm font-medium text-primary mb-1">Response from DECODE MATHS:</p>
                          <p className="text-sm text-foreground">{review.admin_reply}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="border-t border-border bg-secondary/30 py-8 mt-16">
        <div className="container mx-auto px-4 md:px-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2026 DECODE MATHS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
