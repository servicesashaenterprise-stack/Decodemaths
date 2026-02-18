import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Target, TrendingUp, Award, ArrowRight, Filter } from 'lucide-react';
import Logo from '@/components/Logo';
import DecodeMathsLogo from '@/components/DecodeMathsLogo';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function LandingPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [classes] = useState(['Class 10', 'Class 11', 'Class 12', 'CA Foundation', 'JEE']);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`${API}/questions/stats/overview`);
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border sticky top-0 bg-white/80 backdrop-blur-xl z-50">
        <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex gap-2 md:gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/questions')}
              data-testid="browse-questions-btn"
            >
              Browse Questions
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate('/login')}
              data-testid="login-btn"
            >
              Login
            </Button>
            <Button 
              onClick={() => navigate('/register')}
              className="active:scale-95 transition-transform"
              data-testid="get-started-btn"
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <section className="container mx-auto px-4 md:px-8 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-primary/10 text-primary border-primary/20" data-testid="hero-badge">
              Mathematics Excellence
            </Badge>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold tracking-tight leading-tight">
              Master Mathematics
              <br />
              <span className="text-primary">One Question at a Time</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              Comprehensive question bank for Class 10, 11, 12, CA Foundation & JEE. 
              Practice chapter-wise, track progress, and ace your exams.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button 
                size="lg" 
                onClick={() => navigate('/register')}
                className="active:scale-95 transition-transform"
                data-testid="hero-cta-btn"
              >
                Start Practicing <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate('/questions')}
                data-testid="explore-questions-btn"
              >
                Explore Questions
              </Button>
            </div>
            {stats && (
              <div className="flex gap-6 pt-4">
                <div>
                  <p className="text-3xl font-heading font-bold text-primary">{stats.total}+</p>
                  <p className="text-sm text-muted-foreground">Questions</p>
                </div>
                <div>
                  <p className="text-3xl font-heading font-bold text-primary">
                    {Object.keys(stats.by_class || {}).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Classes</p>
                </div>
                <div>
                  <p className="text-3xl font-heading font-bold text-primary">
                    {Object.keys(stats.by_type || {}).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Question Types</p>
                </div>
              </div>
            )}
          </div>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-primary/10 to-transparent rounded-2xl"></div>
            <div className="relative rounded-2xl shadow-2xl bg-gradient-to-br from-[#1e3a5f] to-[#2d5a8f] p-16 flex flex-col items-center justify-center min-h-[400px] space-y-6">
              <div className="h-32 w-32 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border-4 border-white/20">
                <span className="text-white font-heading font-bold text-6xl">D</span>
              </div>
              <h3 className="text-white text-3xl font-heading font-bold">DECODE MATHS</h3>
              <p className="text-white/80 text-lg">Master Mathematics, One Question at a Time</p>
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-16">
        <h3 className="text-3xl font-heading font-semibold text-center mb-12">
          Choose Your Class
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {classes.map((className) => (
            <Card 
              key={className}
              className="p-6 text-center hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer border-2 hover:border-primary"
              onClick={() => navigate(`/questions?class=${encodeURIComponent(className)}`)}
              data-testid={`class-card-${className.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <BookOpen className="h-10 w-10 mx-auto mb-3 text-primary" />
              <h4 className="font-heading font-semibold text-lg">{className}</h4>
              {stats?.by_class?.[className] && (
                <p className="text-sm text-muted-foreground mt-2">
                  {stats.by_class[className]} questions
                </p>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-secondary/50 py-16">
        <div className="container mx-auto px-4 md:px-8">
          <h3 className="text-3xl font-heading font-semibold text-center mb-12">
            Why Choose DECODE MATHS?
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
              <Filter className="h-12 w-12 text-primary mb-4" />
              <h4 className="font-heading font-semibold text-xl mb-2">Smart Filtering</h4>
              <p className="text-muted-foreground">
                Filter by class, chapter, marks, and question type for targeted practice
              </p>
            </Card>
            <Card className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
              <Target className="h-12 w-12 text-primary mb-4" />
              <h4 className="font-heading font-semibold text-xl mb-2">Practice Tests</h4>
              <p className="text-muted-foreground">
                Generate custom practice tests tailored to your needs
              </p>
            </Card>
            <Card className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
              <TrendingUp className="h-12 w-12 text-primary mb-4" />
              <h4 className="font-heading font-semibold text-xl mb-2">Track Progress</h4>
              <p className="text-muted-foreground">
                Monitor your performance and identify areas for improvement
              </p>
            </Card>
            <Card className="p-6 border-none shadow-sm hover:shadow-md transition-shadow">
              <Award className="h-12 w-12 text-primary mb-4" />
              <h4 className="font-heading font-semibold text-xl mb-2">Video Solutions</h4>
              <p className="text-muted-foreground">
                Access YouTube video explanations for better understanding
              </p>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 md:px-8 py-16 text-center">
        <h3 className="text-3xl md:text-4xl font-heading font-bold mb-6">
          Ready to Excel in Mathematics?
        </h3>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Join thousands of students who are improving their math skills with DECODE MATHS
        </p>
        <Button 
          size="lg" 
          onClick={() => navigate('/register')}
          className="active:scale-95 transition-transform"
          data-testid="footer-cta-btn"
        >
          Start Your Journey Today <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>

      <footer className="border-t border-border bg-secondary/30 py-8">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 DECODE MATHS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/admin/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Admin Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
