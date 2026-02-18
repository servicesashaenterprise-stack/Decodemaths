import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { Target, Users, Award, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-white sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex gap-4">
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link to="/contact">
              <Button variant="ghost">Contact</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-8 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            About DECODE MATHS
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Empowering students to master mathematics through structured practice and comprehensive learning resources
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="p-8">
            <h2 className="text-2xl font-heading font-semibold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              At DECODE MATHS, we believe that every student has the potential to excel in mathematics. 
              Our mission is to provide a comprehensive, easy-to-use platform that helps students practice 
              and master mathematical concepts at their own pace. We aim to make quality education accessible 
              to all students preparing for Class 10, 11, 12, CA Foundation, and JEE examinations.
            </p>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-heading font-semibold mb-4">Our Vision</h2>
            <p className="text-muted-foreground leading-relaxed">
              We envision a future where every mathematics student has access to high-quality practice materials, 
              detailed solutions, and the tools they need to succeed. Through our platform, we strive to build 
              confidence, improve problem-solving skills, and help students achieve their academic goals with 
              structured, chapter-wise practice.
            </p>
          </Card>
        </div>

        <div className="mb-16">
          <h2 className="text-3xl font-heading font-semibold text-center mb-12">What We Offer</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="p-6 text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Targeted Practice</h3>
              <p className="text-sm text-muted-foreground">
                Chapter-wise and topic-wise questions for focused learning
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="h-16 w-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-success" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">All Levels</h3>
              <p className="text-sm text-muted-foreground">
                Questions from basic to advanced difficulty levels
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="h-16 w-16 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-warning" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Quality Content</h3>
              <p className="text-sm text-muted-foreground">
                Curated questions with detailed solutions and video explanations
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="font-heading font-semibold text-lg mb-2">Progress Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Monitor your improvement and identify weak areas
              </p>
            </Card>
          </div>
        </div>

        <Card className="p-8 bg-primary/5 border-primary/20">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-2xl font-heading font-semibold mb-4">Our Approach</h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              We understand that every student learns differently. That's why DECODE MATHS offers a flexible, 
              self-paced learning environment where students can practice according to their needs. Our platform 
              features various question types including MCQs, Assertion-Reason, Short Answer, Long Answer, and 
              Case Study questions, ensuring comprehensive preparation for all examination formats.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              With features like smart filtering, bookmarking, practice test generation, and progress tracking, 
              we provide students with all the tools they need to succeed. Our YouTube channel complements the 
              platform with detailed video solutions and conceptual explanations.
            </p>
          </div>
        </Card>

        <div className="text-center mt-12">
          <h2 className="text-2xl font-heading font-semibold mb-6">Ready to Start Learning?</h2>
          <div className="flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link to="/questions">
              <Button size="lg" variant="outline">Browse Questions</Button>
            </Link>
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-secondary/30 py-8 mt-12">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 DECODE MATHS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Contact Us
              </Link>
              <a 
                href="https://www.youtube.com/@decodemathsnow" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                YouTube
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
