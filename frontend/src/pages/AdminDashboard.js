import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LogOut, Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import Logo from '@/components/Logo';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QUESTION_TYPES = ['MCQ', 'Assertion Reason', '2 Marks', '3 Marks', '5 Marks', 'Case Study'];
const CLASSES = ['Class 10', 'Class 11', 'Class 12', 'CA Foundation', 'JEE'];
const MARKS_OPTIONS = [1, 2, 3, 4, 5];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('questions');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'MCQ',
    marks: '1',
    class_level: '',
    chapter: '',
    chapter_number: '1',
    correct_answer: '',
    options: ['', '', '', ''],
    youtube_link: '',
    explanation: ''
  });

  useEffect(() => {
    fetchUserData();
    fetchStats();
    fetchQuestions();
    fetchReports();
  }, []);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`, { withCredentials: true });
      setUser(response.data);
    } catch (error) {
      navigate('/admin/login');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/questions/stats/overview`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API}/questions`, { params: { limit: 100 } });
      setQuestions(response.data);
    } catch (error) {
      toast.error('Failed to load questions');
    }
  };

  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API}/admin/reports`, { withCredentials: true });
      setReports(response.data);
    } catch (error) {
      console.error('Failed to load reports:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      marks: parseInt(formData.marks),
      chapter_number: parseInt(formData.chapter_number),
      options: formData.question_type === 'MCQ' || formData.question_type === 'Assertion Reason' 
        ? formData.options.filter(opt => opt.trim() !== '') 
        : null
    };

    try {
      if (editingQuestion) {
        await axios.put(
          `${API}/admin/questions/${editingQuestion.question_id}`,
          payload,
          { withCredentials: true }
        );
        toast.success('Question updated successfully');
      } else {
        await axios.post(`${API}/admin/questions`, payload, { withCredentials: true });
        toast.success('Question created successfully');
      }
      
      resetForm();
      setShowAddDialog(false);
      setEditingQuestion(null);
      fetchQuestions();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save question');
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    
    try {
      await axios.delete(`${API}/admin/questions/${questionId}`, { withCredentials: true });
      toast.success('Question deleted');
      fetchQuestions();
      fetchStats();
    } catch (error) {
      toast.error('Failed to delete question');
    }
  };

  const startEdit = (question) => {
    setEditingQuestion(question);
    setFormData({
      question_text: question.question_text,
      question_type: question.question_type,
      marks: question.marks.toString(),
      class_level: question.class_level,
      chapter: question.chapter,
      chapter_number: question.chapter_number.toString(),
      correct_answer: question.correct_answer || '',
      options: question.options || ['', '', '', ''],
      youtube_link: question.youtube_link || '',
      explanation: question.explanation || ''
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setFormData({
      question_text: '',
      question_type: 'MCQ',
      marks: '1',
      class_level: '',
      chapter: '',
      chapter_number: '1',
      correct_answer: '',
      options: ['', '', '', ''],
      youtube_link: '',
      explanation: ''
    });
    setEditingQuestion(null);
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
          <div className="flex items-center gap-3">
            <Logo linkTo="/admin/dashboard" />
            <Badge variant="outline" className="ml-2">Admin</Badge>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">
              {user?.name} (Admin)
            </span>
            <Button variant="outline" onClick={handleLogout} data-testid="admin-logout-btn">
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-8 py-8">
        <div className="bento-grid mb-8">
          <Card className="stat-card p-6" data-testid="admin-stat-total">
            <p className="text-sm text-muted-foreground mb-1">Total Questions</p>
            <p className="text-3xl font-heading font-bold text-primary">{stats?.total || 0}</p>
          </Card>
          <Card className="stat-card p-6" data-testid="admin-stat-reports">
            <p className="text-sm text-muted-foreground mb-1">Pending Reports</p>
            <p className="text-3xl font-heading font-bold text-warning">
              {reports.filter(r => r.status === 'pending').length}
            </p>
          </Card>
          <Card className="stat-card p-6" data-testid="admin-stat-classes">
            <p className="text-sm text-muted-foreground mb-1">Classes</p>
            <p className="text-3xl font-heading font-bold">{Object.keys(stats?.by_class || {}).length}</p>
          </Card>
          <Card className="stat-card p-6" data-testid="admin-stat-types">
            <p className="text-sm text-muted-foreground mb-1">Question Types</p>
            <p className="text-3xl font-heading font-bold">{Object.keys(stats?.by_type || {}).length}</p>
          </Card>
        </div>

        <div className="flex gap-4 mb-6">
          <Button
            variant={activeTab === 'questions' ? 'default' : 'outline'}
            onClick={() => setActiveTab('questions')}
            data-testid="tab-questions-btn"
          >
            Questions ({questions.length})
          </Button>
          <Button
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reports')}
            data-testid="tab-reports-btn"
          >
            Reports ({reports.length})
          </Button>
        </div>

        {activeTab === 'questions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-heading font-semibold">Manage Questions</h2>
              <Dialog open={showAddDialog} onOpenChange={(open) => {
                setShowAddDialog(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button data-testid="add-question-btn">
                    <Plus className="mr-2 h-4 w-4" /> Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {editingQuestion ? 'Edit Question' : 'Add New Question'}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Class</Label>
                        <Select value={formData.class_level} onValueChange={(val) => setFormData({...formData, class_level: val})}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {CLASSES.map(cls => <SelectItem key={cls} value={cls}>{cls}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Question Type</Label>
                        <Select value={formData.question_type} onValueChange={(val) => setFormData({...formData, question_type: val})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_TYPES.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Chapter</Label>
                        <Input value={formData.chapter} onChange={(e) => setFormData({...formData, chapter: e.target.value})} required />
                      </div>
                      <div>
                        <Label>Chapter Number</Label>
                        <Input type="number" value={formData.chapter_number} onChange={(e) => setFormData({...formData, chapter_number: e.target.value})} required />
                      </div>
                      <div>
                        <Label>Marks</Label>
                        <Select value={formData.marks} onValueChange={(val) => setFormData({...formData, marks: val})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {MARKS_OPTIONS.map(m => <SelectItem key={m} value={m.toString()}>{m}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label>Question Text</Label>
                      <Textarea value={formData.question_text} onChange={(e) => setFormData({...formData, question_text: e.target.value})} rows={3} required />
                    </div>

                    {(formData.question_type === 'MCQ' || formData.question_type === 'Assertion Reason') && (
                      <div>
                        <Label>Options</Label>
                        {formData.options.map((opt, idx) => (
                          <Input
                            key={idx}
                            placeholder={`Option ${String.fromCharCode(65 + idx)}`}
                            value={opt}
                            onChange={(e) => {
                              const newOpts = [...formData.options];
                              newOpts[idx] = e.target.value;
                              setFormData({...formData, options: newOpts});
                            }}
                            className="mt-2"
                          />
                        ))}
                      </div>
                    )}

                    <div>
                      <Label>Correct Answer</Label>
                      <Input value={formData.correct_answer} onChange={(e) => setFormData({...formData, correct_answer: e.target.value})} />
                    </div>

                    <div>
                      <Label>Explanation (Optional)</Label>
                      <Textarea value={formData.explanation} onChange={(e) => setFormData({...formData, explanation: e.target.value})} rows={2} />
                    </div>

                    <div>
                      <Label>YouTube Link (Optional)</Label>
                      <Input value={formData.youtube_link} onChange={(e) => setFormData({...formData, youtube_link: e.target.value})} placeholder="https://youtube.com/..." />
                    </div>

                    <Button type="submit" className="w-full" data-testid="save-question-btn">
                      {editingQuestion ? 'Update Question' : 'Create Question'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-4">
              {questions.map((q, index) => (
                <Card key={q.question_id} className="p-6" data-testid={`admin-question-${index}`}>
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge variant="outline">{q.class_level}</Badge>
                        <Badge variant="outline">{q.chapter}</Badge>
                        <Badge>{q.question_type}</Badge>
                        <Badge className="bg-success/10 text-success">{q.marks}M</Badge>
                      </div>
                      <p className="text-foreground line-clamp-2">{q.question_text}</p>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => startEdit(q)} data-testid={`edit-question-${index}`}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(q.question_id)} data-testid={`delete-question-${index}`}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <h2 className="text-2xl font-heading font-semibold mb-6">Question Reports</h2>
            {reports.length === 0 ? (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No reports yet</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <Card key={report.report_id} className="p-6" data-testid={`report-${index}`}>
                    <div className="flex items-start gap-4">
                      <AlertTriangle className="h-6 w-6 text-warning shrink-0 mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant={report.status === 'pending' ? 'default' : 'secondary'}>
                            {report.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            Question ID: {report.question_id}
                          </span>
                        </div>
                        <p className="text-foreground mb-2">{report.issue_description}</p>
                        <p className="text-xs text-muted-foreground">
                          Reported by: {report.user_id}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
