import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Star, Quote, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const TestimonialsSection = () => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const [reviewsRes, statsRes] = await Promise.all([
          axios.get(`${API}/reviews?limit=6`),
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
    fetchReviews();
  }, []);

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

  if (loading) {
    return (
      <section className="py-16 bg-gradient-to-b from-background to-secondary/20">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-background to-secondary/20" data-testid="testimonials-section">
      <div className="container mx-auto px-4 md:px-8">
        <div className="text-center mb-12">
          <h3 className="text-3xl font-heading font-semibold mb-4">
            What Our Students Say
          </h3>
          {stats && stats.total > 0 && (
            <div className="flex justify-center items-center gap-4">
              <div className="flex items-center gap-2">
                {renderStars(Math.round(stats.average_rating))}
                <span className="text-lg font-semibold">{stats.average_rating}</span>
              </div>
              <span className="text-muted-foreground">|</span>
              <span className="text-muted-foreground">{stats.total} reviews</span>
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {reviews.slice(0, 6).map((review, index) => (
            <Card 
              key={review.review_id} 
              className="p-6 relative hover:shadow-lg transition-shadow"
              data-testid={`review-card-${index}`}
            >
              <Quote className="h-8 w-8 text-primary/20 absolute top-4 right-4" />
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {review.user_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium">{review.user_name}</p>
                  {renderStars(review.rating)}
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed line-clamp-4">
                "{review.review_text}"
              </p>
            </Card>
          ))}
        </div>

        {stats && stats.total > 6 && (
          <div className="text-center">
            <Link to="/reviews">
              <Button variant="outline" data-testid="view-all-reviews-btn">
                View All Reviews <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
