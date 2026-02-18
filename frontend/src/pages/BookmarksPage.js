import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Bookmark, Trash2 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function BookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = async () => {
    try {
      const response = await axios.get(`${API}/bookmarks`, { withCredentials: true });
      setBookmarks(response.data);
    } catch (error) {
      toast.error('Failed to load bookmarks');
    } finally {
      setLoading(false);
    }
  };

  const removeBookmark = async (questionId, e) => {
    e.stopPropagation();
    try {
      await axios.delete(`${API}/bookmarks/${questionId}`, { withCredentials: true });
      setBookmarks(bookmarks.filter(q => q.question_id !== questionId));
      toast.success('Bookmark removed');
    } catch (error) {
      toast.error('Failed to remove bookmark');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-white sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 py-4">
          <Link to="/">
            <Logo />
          </Link>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')} 
          className="mb-6"
          data-testid="back-to-dashboard-btn"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
        </Button>

        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold mb-2 flex items-center gap-2">
            <Bookmark className="h-8 w-8 text-primary" />
            My Bookmarks
          </h2>
          <p className="text-muted-foreground">{bookmarks.length} saved questions</p>
        </div>

        {bookmarks.length === 0 ? (
          <Card className="p-12 text-center">
            <Bookmark className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-heading font-semibold mb-2">No bookmarks yet</h3>
            <p className="text-muted-foreground mb-4">Start bookmarking questions to save them here</p>
            <Button onClick={() => navigate('/questions')}>Browse Questions</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((question, index) => (
              <Card 
                key={question.question_id} 
                className="p-6 question-card cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate(`/questions/${question.question_id}`)}
                data-testid={`bookmark-card-${index}`}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge variant="outline" className="text-xs">{question.class_level}</Badge>
                      <Badge variant="outline" className="text-xs">{question.chapter}</Badge>
                      <Badge className="text-xs bg-primary/10 text-primary">{question.question_type}</Badge>
                      <Badge className="text-xs bg-success/10 text-success">{question.marks} Marks</Badge>
                    </div>
                    <p className="text-foreground leading-relaxed line-clamp-2">
                      {question.question_text}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => removeBookmark(question.question_id, e)}
                    className="shrink-0"
                    data-testid={`remove-bookmark-btn-${index}`}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}