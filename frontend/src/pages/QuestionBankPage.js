import { useState, useEffect } from 'react';
import Logo from '@/components/Logo';
import ReviewPrompt from '@/components/ReviewPrompt';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Filter, X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QUESTION_TYPES = ['MCQ', 'Assertion Reason', '2 Marks', '3 Marks', '5 Marks', 'Case Study'];
const CLASSES = ['Class 10', 'Class 11', 'Class 12', 'CA Foundation', 'JEE'];
const MARKS = [1, 2, 3, 4, 5];

export default function QuestionBankPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedClass, setSelectedClass] = useState(searchParams.get('class') || '');
  const [selectedChapter, setSelectedChapter] = useState(searchParams.get('chapter') || '');
  const [selectedType, setSelectedType] = useState(searchParams.get('type') || '');
  const [selectedMarks, setSelectedMarks] = useState(searchParams.get('marks') || '');

  useEffect(() => {
    if (selectedClass) {
      fetchChapters(selectedClass);
    }
  }, [selectedClass]);

  useEffect(() => {
    fetchQuestions();
  }, [selectedClass, selectedChapter, selectedType, selectedMarks]);

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

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedClass) params.class_level = selectedClass;
      if (selectedChapter) params.chapter = selectedChapter;
      if (selectedType) params.question_type = selectedType;
      if (selectedMarks) params.marks = parseInt(selectedMarks);

      const response = await axios.get(`${API}/questions`, { params });
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to load questions');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = {};
    if (selectedClass) params.class = selectedClass;
    if (selectedChapter) params.chapter = selectedChapter;
    if (selectedType) params.type = selectedType;
    if (selectedMarks) params.marks = selectedMarks;
    setSearchParams(params);
    fetchQuestions();
  };

  const clearFilters = () => {
    setSelectedClass('');
    setSelectedChapter('');
    setSelectedType('');
    setSelectedMarks('');
    setSearchParams({});
    setChapters([]);
  };

  const hasFilters = selectedClass || selectedChapter || selectedType || selectedMarks;

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
        <div className="mb-8">
          <h2 className="text-3xl md:text-4xl font-heading font-bold mb-2">Question Bank</h2>
          <p className="text-muted-foreground">Browse and filter mathematics questions</p>
        </div>

        <Card className="p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-heading font-semibold text-lg">Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Class</label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger data-testid="filter-class-select">
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
              <label className="text-sm font-medium mb-2 block">Chapter</label>
              <Select value={selectedChapter} onValueChange={setSelectedChapter} disabled={!selectedClass}>
                <SelectTrigger data-testid="filter-chapter-select">
                  <SelectValue placeholder="Select chapter" />
                </SelectTrigger>
                <SelectContent>
                  {chapters.map((ch) => (
                    <SelectItem key={ch.name} value={ch.name}>{ch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Question Type</label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger data-testid="filter-type-select">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Marks</label>
              <Select value={selectedMarks} onValueChange={setSelectedMarks}>
                <SelectTrigger data-testid="filter-marks-select">
                  <SelectValue placeholder="Select marks" />
                </SelectTrigger>
                <SelectContent>
                  {MARKS.map((mark) => (
                    <SelectItem key={mark} value={mark.toString()}>{mark} Marks</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasFilters && (
            <div className="mt-4 flex gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters} data-testid="clear-filters-btn">
                <X className="h-4 w-4 mr-1" /> Clear Filters
              </Button>
            </div>
          )}
        </Card>

        <div className="mb-4 flex justify-between items-center">
          <p className="text-muted-foreground">
            {loading ? 'Loading...' : `${questions.length} questions found`}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : questions.length === 0 ? (
          <Card className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-heading font-semibold mb-2">No questions found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters</p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            )}
          </Card>
        ) : (
          <div className="space-y-4">
            {questions.map((question, index) => (
              <Card 
                key={question.question_id} 
                className="p-6 question-card cursor-pointer hover:border-primary transition-colors"
                onClick={() => navigate(`/questions/${question.question_id}`)}
                data-testid={`question-card-${index}`}
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">{question.class_level}</Badge>
                  <Badge variant="outline" className="text-xs">{question.chapter}</Badge>
                  <Badge className="text-xs bg-primary/10 text-primary">{question.question_type}</Badge>
                  <Badge className="text-xs bg-success/10 text-success">{question.marks} Marks</Badge>
                </div>
                <p className="text-foreground leading-relaxed line-clamp-3">
                  {question.question_text}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
