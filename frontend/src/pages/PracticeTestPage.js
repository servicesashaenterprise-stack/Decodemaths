import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function PracticeTestPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await axios.get(`${API}/practice-tests/${testId}`, { withCredentials: true });
      setTest(response.data.test);
      setQuestions(response.data.questions);
    } catch (error) {
      toast.error('Failed to load practice test');
      navigate('/dashboard');
    } finally {
      setLoading(false);
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
            <h1 className="text-2xl font-heading font-bold text-primary">DECODE MATHS</h1>
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

        <Card className="p-6 mb-8 shadow-sm">
          <h2 className="text-2xl font-heading font-bold mb-2">Practice Test</h2>
          <div className="flex flex-wrap gap-3">
            <Badge variant="outline">{test?.class_level}</Badge>
            {test?.chapter && <Badge variant="outline">{test.chapter}</Badge>}
            <Badge className="bg-primary/10 text-primary">{test?.total_questions} Questions</Badge>
          </div>
        </Card>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card 
              key={question.question_id} 
              className="p-6 shadow-sm"
              data-testid={`test-question-${index}`}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-shrink-0 w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-heading font-bold">{index + 1}</span>
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge className="text-xs bg-primary/10 text-primary">{question.question_type}</Badge>
                    <Badge className="text-xs bg-success/10 text-success">{question.marks} Marks</Badge>
                  </div>
                </div>
              </div>

              <div className="ml-14">
                <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                  <p className="text-foreground leading-relaxed whitespace-pre-line">
                    {question.question_text}
                  </p>
                </div>

                {question.options && question.options.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {question.options.map((option, optIndex) => (
                      <div 
                        key={optIndex}
                        className="p-3 bg-secondary/20 rounded-lg border border-border"
                      >
                        <span className="font-medium mr-2">{String.fromCharCode(65 + optIndex)}.</span>
                        {option}
                      </div>
                    ))}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`/questions/${question.question_id}`)}
                  data-testid={`view-solution-btn-${index}`}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> View Solution
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}