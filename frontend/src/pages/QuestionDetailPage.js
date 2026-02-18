import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, BookmarkPlus, BookmarkCheck, Youtube, AlertTriangle, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { InlineMath } from 'react-katex';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function QuestionDetailPage() {
  const { questionId } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [reportIssue, setReportIssue] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchQuestion();
  }, [questionId]);

  const checkAuth = async () => {
    try {
      await axios.get(`${API}/auth/me`, { withCredentials: true });
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const fetchQuestion = async () => {
    try {
      const response = await axios.get(`${API}/questions/${questionId}`);
      setQuestion(response.data);
    } catch (error) {
      toast.error('Failed to load question');
      navigate('/questions');
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to bookmark questions');
      navigate('/login');
      return;
    }

    try {
      if (isBookmarked) {
        await axios.delete(`${API}/bookmarks/${questionId}`, { withCredentials: true });
        toast.success('Bookmark removed');
        setIsBookmarked(false);
      } else {
        await axios.post(`${API}/bookmarks/${questionId}`, {}, { withCredentials: true });
        toast.success('Question bookmarked');
        setIsBookmarked(true);
      }
    } catch (error) {
      toast.error('Failed to update bookmark');
    }
  };

  const submitReport = async () => {
    if (!reportIssue.trim()) {
      toast.error('Please describe the issue');
      return;
    }
    if (!isAuthenticated) {
      toast.error('Please login to report issues');
      navigate('/login');
      return;
    }

    setSubmittingReport(true);
    try {
      await axios.post(
        `${API}/reports`,
        { question_id: questionId, issue_description: reportIssue },
        { withCredentials: true }
      );
      toast.success('Issue reported successfully');
      setReportIssue('');
    } catch (error) {
      toast.error('Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!question) return null;

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-white sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <Link to="/">
            <h1 className="text-2xl font-heading font-bold text-primary">DECODE MATHS</h1>
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)} 
          className="mb-6"
          data-testid="back-btn"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>

        <Card className="p-8 shadow-lg">
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="outline">{question.class_level}</Badge>
            <Badge variant="outline">{question.chapter}</Badge>
            <Badge className="bg-primary/10 text-primary">{question.question_type}</Badge>
            <Badge className="bg-success/10 text-success">{question.marks} Marks</Badge>
          </div>

          <div className="prose prose-lg max-w-none mb-8">
            <h3 className="text-2xl font-heading font-semibold mb-4">Question:</h3>
            <div className="p-6 bg-secondary/30 rounded-lg border-l-4 border-primary">
              <p className="text-foreground leading-relaxed whitespace-pre-line">
                {question.question_text}
              </p>
            </div>
          </div>

          {question.options && question.options.length > 0 && (
            <div className="mb-8">
              <h4 className="font-heading font-semibold text-lg mb-3">Options:</h4>
              <div className="space-y-2">
                {question.options.map((option, index) => (
                  <div 
                    key={index}
                    className="p-4 bg-secondary/20 rounded-lg border border-border hover:border-primary transition-colors"
                  >
                    <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                    {option}
                  </div>
                ))}
              </div>
            </div>
          )}

          {question.correct_answer && (
            <div className="mb-8 p-6 bg-success/5 rounded-lg border border-success/20">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                <div>
                  <h4 className="font-heading font-semibold text-lg mb-2">Correct Answer:</h4>
                  <p className="text-foreground">{question.correct_answer}</p>
                </div>
              </div>
            </div>
          )}

          {question.explanation && (
            <div className="mb-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h4 className="font-heading font-semibold text-lg mb-3">Explanation:</h4>
              <p className="text-foreground leading-relaxed whitespace-pre-line">{question.explanation}</p>
            </div>
          )}

          {question.youtube_link && (
            <div className="mb-8">
              <Button 
                variant="outline" 
                className="w-full md:w-auto"
                onClick={() => window.open(question.youtube_link, '_blank')}
                data-testid="youtube-solution-btn"
              >
                <Youtube className="mr-2 h-4 w-4" /> Watch Video Solution
              </Button>
            </div>
          )}

          <div className="flex flex-wrap gap-3 pt-6 border-t border-border">
            <Button
              variant={isBookmarked ? "default" : "outline"}
              onClick={toggleBookmark}
              data-testid="bookmark-btn"
            >
              {isBookmarked ? (
                <><BookmarkCheck className="mr-2 h-4 w-4" /> Bookmarked</>
              ) : (
                <><BookmarkPlus className="mr-2 h-4 w-4" /> Bookmark</>
              )}
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" data-testid="report-issue-btn">
                  <AlertTriangle className="mr-2 h-4 w-4" /> Report Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Report an Issue</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Describe the issue with this question..."
                    value={reportIssue}
                    onChange={(e) => setReportIssue(e.target.value)}
                    rows={4}
                    data-testid="report-textarea"
                  />
                  <Button 
                    onClick={submitReport} 
                    disabled={submittingReport}
                    data-testid="submit-report-btn"
                  >
                    {submittingReport ? 'Submitting...' : 'Submit Report'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </Card>
      </div>
    </div>
  );
}
