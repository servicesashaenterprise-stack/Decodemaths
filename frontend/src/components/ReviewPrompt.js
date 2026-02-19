import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Star } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export const ReviewPrompt = ({ onClose, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }
    if (!reviewText.trim()) {
      toast.error('Please write a review');
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(
        `${API}/reviews`,
        { rating, review_text: reviewText },
        { withCredentials: true }
      );
      toast.success('Thank you for your review!');
      if (onSubmitted) onSubmitted();
      if (onClose) onClose();
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.detail);
      } else {
        toast.error('Failed to submit review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <div className="text-center mb-4">
        <h3 className="text-xl font-heading font-semibold mb-2">
          How was your experience?
        </h3>
        <p className="text-sm text-muted-foreground">
          Help us improve by sharing your feedback
        </p>
      </div>

      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            className="transition-transform hover:scale-110"
            data-testid={`star-${star}`}
          >
            <Star
              className={`h-8 w-8 ${
                star <= (hoverRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>

      <Textarea
        placeholder="Tell us what you think about DECODE MATHS..."
        value={reviewText}
        onChange={(e) => setReviewText(e.target.value)}
        rows={4}
        className="mb-4"
        data-testid="review-textarea"
      />

      <div className="flex gap-2">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="flex-1"
          data-testid="submit-review-btn"
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </Button>
        {onClose && (
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            data-testid="skip-review-btn"
          >
            Maybe Later
          </Button>
        )}
      </div>
    </Card>
  );
};

export default ReviewPrompt;
