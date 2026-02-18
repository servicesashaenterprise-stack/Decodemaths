import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LogOut, BookmarkIcon, TrendingUp, BookOpen, Target, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CLASSES = ['Class 10', 'Class 11', 'Class 12', 'CA Foundation', 'JEE'];

export default function StudentDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedChapter, setSelectedChapter] = useState('');
  const [questionCount, setQuestionCount] = useState('10');
  const [chapters, setChapters] = useState([]);
  const [creatingTest, setCreatingTest] = useState(false);

  useEffect(() => {
    fetchUserData();
    fetchProgressStats();
    fetchPracticeTests();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchChapters(selectedClass);
    }
  }, [selectedClass]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      toast.error('Session expired');
      navigate('/login');
    }
  };

  const fetchProgressStats = async () => {
    try {
      const response = await axios.get(`${API}/progress/stats`, { withCredentials: true });
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPracticeTests = async () => {
    try {
      const response = await axios.get(`${API}/practice-tests`, { withCredentials: true });
      setTests(response.data.slice(0, 5));
    } catch (error) {
      console.error('Failed to fetch tests:', error);
    }
  };

  const fetchChapters = async (className) => {
    try {
      const response = await axios.get(`${API}/metadata/chapters`, {
        params: { class_level: className }
      });
      setChapters(response.data.chapters || []);
    } catch (error) {
      console.error('Failed to fetch chapters:', error);
    }
  };

  const createPracticeTest = async () => {
    if (!selectedClass) {
      toast.error('Please select a class');
      return;
    }

    setCreatingTest(true);
    try {
      const response = await axios.post(
        `${API}/practice-tests`,
        {
          class_level: selectedClass,
          chapter: selectedChapter || null,
          question_count: parseInt(questionCount)
        },
        { withCredentials: true }
      );
      toast.success('Practice test created!');
      navigate(`/practice-test/${response.data.test_id}`);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create test');
    } finally {
      setCreatingTest(false);
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`, {}, { withCredentials: true });
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
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
        <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Link to="/">
            <h1 className="text-2xl font-heading font-bold text-primary">DECODE MATHS</h1>
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              Hello, {user?.name}
            </span>
            <Button variant="outline" onClick={handleLogout} data-testid="logout-btn">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-heading font-bold mb-2">Dashboard</h2>
          <p className="text-muted-foreground">Welcome back, {user?.name}!</p>
        </div>

        <div className="bento-grid mb-8">
          <Card className="stat-card p-6 border-primary/20" data-testid="stat-total-attempted">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Attempted</p>
                <p className="text-3xl font-heading font-bold text-primary">
                  {stats?.total_attempted || 0}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-primary/30" />
            </div>
          </Card>

          <Card className="stat-card p-6 border-success/20" data-testid="stat-correct-answers">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Correct Answers</p>
                <p className="text-3xl font-heading font-bold text-success">
                  {stats?.correct_answers || 0}
                </p>
              </div>
              <Target className="h-10 w-10 text-success/30" />
            </div>
          </Card>

          <Card className="stat-card p-6 border-warning/20" data-testid="stat-accuracy">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Accuracy</p>
                <p className="text-3xl font-heading font-bold text-warning">
                  {stats?.accuracy || 0}%
                </p>
              </div>
              <BookOpen className="h-10 w-10 text-warning/30" />
            </div>
          </Card>

          <Card 
            className="stat-card p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate('/bookmarks')}
            data-testid="bookmarks-card"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Bookmarks</p>
                <p className="text-3xl font-heading font-bold">View All</p>
              </div>
              <BookmarkIcon className="h-10 w-10 text-muted-foreground/30" />
            </div>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4 flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Create Practice Test
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Class</label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger data-testid="test-class-select">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASSES.map((cls) => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Chapter (Optional)</label>
                <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedClass}>
                  <SelectTrigger data-testid="test-chapter-select">
                    <SelectValue placeholder="All chapters" />
                  </SelectTrigger>
                  <SelectContent>
                    {chapters.map((ch) => (
                      <SelectItem key={ch.name} value={ch.name}>{ch.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Number of Questions</label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger data-testid="test-count-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25].map((count) => (
                      <SelectItem key={count} value={count.toString()}>{count} Questions</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                className="w-full" 
                onClick={createPracticeTest}
                disabled={creatingTest}
                data-testid="create-test-btn"
              >
                {creatingTest ? 'Creating...' : 'Generate Test'}
              </Button>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-xl font-heading font-semibold mb-4">Recent Practice Tests</h3>
            {tests.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No practice tests yet. Create your first one!
              </p>
            ) : (
              <div className="space-y-3">
                {tests.map((test, index) => (
                  <div
                    key={test.test_id}
                    className="p-4 bg-secondary/30 rounded-lg cursor-pointer hover:bg-secondary/50 transition-colors"
                    onClick={() => navigate(`/practice-test/${test.test_id}`)}
                    data-testid={`recent-test-${index}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{test.class_level}</p>
                        {test.chapter && (
                          <p className="text-sm text-muted-foreground">{test.chapter}</p>
                        )}
                      </div>
                      <Badge>{test.total_questions} Qs</Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Card 
            className="p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate('/questions')}
            data-testid="browse-questions-card"
          >
            <BookOpen className="h-8 w-8 text-primary mb-3" />
            <h4 className="font-heading font-semibold text-lg mb-2">Browse Questions</h4>
            <p className="text-sm text-muted-foreground">
              Explore our complete question bank
            </p>
          </Card>

          <Card 
            className="p-6 cursor-pointer hover:border-primary transition-colors"
            onClick={() => navigate('/bookmarks')}
            data-testid="view-bookmarks-card"
          >
            <BookmarkIcon className="h-8 w-8 text-primary mb-3" />
            <h4 className="font-heading font-semibold text-lg mb-2">My Bookmarks</h4>
            <p className="text-sm text-muted-foreground">
              Access your saved questions
            </p>
          </Card>

          <Card className="p-6 border-dashed border-2 opacity-60">
            <Target className="h-8 w-8 text-muted-foreground mb-3" />
            <h4 className="font-heading font-semibold text-lg mb-2">Coming Soon</h4>
            <p className="text-sm text-muted-foreground">
              More features on the way!
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}
