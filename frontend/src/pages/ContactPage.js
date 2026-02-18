import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import Logo from '@/components/Logo';
import { Mail, MessageSquare, User, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We will get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b border-border bg-white sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 md:px-8 py-4 flex justify-between items-center">
          <Logo />
          <div className="flex gap-4">
            <Link to="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link to="/about">
              <Button variant="ghost">About</Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 md:px-8 py-12 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Have questions or suggestions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 mb-12">
          <Card className="p-8">
            <h2 className="text-2xl font-heading font-semibold mb-6">Send us a Message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name">Your Name</Label>
                <div className="relative mt-2">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                    required
                    data-testid="contact-name-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <div className="relative mt-2">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    required
                    data-testid="contact-email-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="subject">Subject</Label>
                <div className="relative mt-2">
                  <MessageSquare className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="subject"
                    type="text"
                    placeholder="How can we help you?"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="pl-10"
                    required
                    data-testid="contact-subject-input"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Tell us more about your query..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="mt-2"
                  required
                  data-testid="contact-message-input"
                />
              </div>

              <Button 
                type="submit" 
                className="w-full active:scale-95 transition-transform" 
                disabled={submitting}
                data-testid="contact-submit-btn"
              >
                {submitting ? 'Sending...' : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Message
                  </>
                )}
              </Button>
            </form>
          </Card>

          <div className="space-y-8">
            <Card className="p-8">
              <h2 className="text-2xl font-heading font-semibold mb-6">Other Ways to Connect</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="font-heading font-semibold mb-2 flex items-center gap-2">
                    <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    YouTube Channel
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    Watch video solutions and tutorials on our YouTube channel
                  </p>
                  <a 
                    href="https://www.youtube.com/@decodemathsnow" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium"
                  >
                    @decodemathsnow
                  </a>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="font-heading font-semibold mb-2 flex items-center gap-2">
                    <Mail className="h-5 w-5 text-primary" />
                    Email Support
                  </h3>
                  <p className="text-muted-foreground">
                    For technical support or urgent queries, you can reach us through the contact form above.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-8 bg-primary/5 border-primary/20">
              <h3 className="font-heading font-semibold text-lg mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-1">How do I access video solutions?</h4>
                  <p className="text-sm text-muted-foreground">
                    Video solutions are linked with specific questions. Click on the YouTube icon next to questions that have video explanations.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">How can I report an incorrect question?</h4>
                  <p className="text-sm text-muted-foreground">
                    Click on "Report Issue" button on any question page to submit your feedback.
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Is the platform free to use?</h4>
                  <p className="text-sm text-muted-foreground">
                    Yes! Create a free account to access all features including practice tests, bookmarks, and progress tracking.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-secondary/30 py-8">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 DECODE MATHS. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link to="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                About Us
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
