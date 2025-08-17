import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar';
import { CheckCircle, Star, Users, Calendar, User} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background dark:bg-background">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-foreground dark:text-foreground leading-tight">
              The Future of{' '}
              <span className="text-primary dark:text-primary">
                Project Collaboration
              </span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Streamline your team&apos;s workflow with our powerful project management platform. 
              From task tracking to seamless communication, everything you need in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-primary hover:bg-primary/90 dark:bg-primary dark:hover:bg-primary/70 text-foreground text-lg px-8 py-4">
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-border dark:border-gray-600 text-foreground hover:bg-muted dark:hover:bg-muted">
                <Link href="#features">Learn More</Link>
              </Button>
            </div>
          </div>
          <div className="lg:w-1/2">
            <video
              src="/mockup.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full max-w-[600px] h-auto rounded-lg shadow-2xl"
              aria-label="Project management platform demonstration"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="bg-muted dark:bg-card/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground dark:text-foreground mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our comprehensive suite of tools helps teams stay organized, communicate effectively, 
              and deliver projects on time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-primary dark:text-secondary" />}
              title="Smart Task Organization"
              description="Create main tasks and break them into manageable subtasks with priority levels, deadlines, and assignment tracking."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-primary dark:text-secondary" />}
              title="Role-Based Permissions"
              description="Granular permission system with leader and member roles, ensuring the right people have the right access."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8 text-primary dark:text-secondary" />}
              title="Real-Time Progress"
              description="Live progress tracking with visual indicators, completion percentages, and instant status updates."
            />
            <FeatureCard
              icon={<Star className="h-8 w-8 text-primary dark:text-secondary" />}
              title="Intuitive Dashboard"
              description="Clean overview with project stats, recent activity, team insights, and quick access to all features."
            />
            <FeatureCard
              icon={<User className="h-8 w-8 text-primary dark:text-secondary" />}
              title="Team Management"
              description="Easily invite members, manage roles, and track who's working on what with visual team indicators."
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-primary dark:text-secondary" />}
              title="Responsive Design"
              description="Beautiful interface that works seamlessly across desktop, tablet, and mobile devices with dark mode support."
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground dark:text-foreground mb-4">
              How Collavo Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Get started in minutes and transform how your team collaborates on projects.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 mb-12">
            <StepCardWithDemo
              step="01"
              title="Create Your Project"
              description="Set up your project workspace and invite team members to collaborate."
              demo={<ProjectCreationDemo />}
            />
            <StepCardWithDemo
              step="02"
              title="Organize Tasks"
              description="Break down your project into manageable tasks and assign them to team members."
              demo={<TaskOrganizationDemo />}
            />
            <StepCardWithDemo
              step="03"
              title="Track Progress"
              description="Monitor progress in real-time and keep everyone aligned with project goals."
              demo={<ProgressTrackingDemo />}
            />
          </div>

          {/* Interactive Flow Visualization */}
          <div className="bg-background dark:bg-card rounded-2xl p-8 shadow-lg border border-border dark:border-border">
            <h3 className="text-2xl font-bold text-center mb-8 text-foreground dark:text-foreground">
              From Setup to Success
            </h3>
            
            {/* Progress Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-primary hidden md:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Stage 1: Project Creation */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg">
                    <Users className="h-6 w-6 text-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground dark:text-foreground mb-2">Project Created</h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">Website Redesign workspace</p>
                  <div className="bg-muted dark:bg-muted rounded-lg p-2 w-full max-w-24">
                    <div className="text-xs text-muted-foreground dark:text-muted-foreground">Members: 5</div>
                  </div>
                </div>

                {/* Stage 2: Active Development */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground dark:text-foreground mb-2">Tasks Organized</h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">High priority task with progress</p>
                  <div className="bg-muted dark:bg-muted rounded-lg p-2 w-full max-w-24">
                    <div className="text-xs text-muted-foreground dark:text-muted-foreground">Tasks: 8</div>
                    <div className="w-full bg-muted dark:bg-gray-700 rounded-full h-1 mt-1">
                      <div className="bg-primary h-1 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Stage 3: Tracking & Analytics */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg">
                    <Calendar className="h-6 w-6 text-foreground" />
                  </div>
                  <h4 className="font-semibold text-foreground dark:text-foreground mb-2">Real-time Insights</h4>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground mb-3">Overview dashboard with metrics</p>
                  <div className="bg-muted dark:bg-muted rounded-lg p-2 w-full max-w-24">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-foreground dark:text-foreground">12</div>
                        <div className="text-muted-foreground dark:text-muted-foreground">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-foreground dark:text-foreground">67%</div>
                        <div className="text-muted-foreground dark:text-muted-foreground">Done</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-8 pt-6 border-t border-border dark:border-border">
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                Join teams already using Collavo for seamless project management
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary dark:bg-[#006666] py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Ready to Transform Your Team&apos;s Productivity?
          </h2>
          <p className="text-xl text-foreground/90 dark:text-foreground/80 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who have already streamlined their workflow with Collavo.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-background text-primary hover:bg-muted dark:bg-muted dark:text-primary dark:hover:bg-gray-300">
            <Link href="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted dark:bg-card border-t border-border dark:border-border py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-foreground font-bold text-sm">C</span>
              </div>
              <h3 className="text-xl font-bold text-foreground dark:text-foreground">Collavo</h3>
            </div>
            <div className="text-center md:text-right">
              <p className="text-muted-foreground dark:text-muted-foreground font-medium">
                Developed by Team Stressed Coders
              </p>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground mt-1">
                &copy; 2025 Senior Project 1
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-background dark:bg-card p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-border/60 dark:border-border hover:border-secondary/30 dark:hover:border-secondary/50 backdrop-blur-sm">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-foreground">{title}</h3>
      <p className="text-muted-foreground dark:text-muted-foreground">{description}</p>
    </div>
  );
}



function StepCardWithDemo({ step, title, description, demo }: { 
  step: string; 
  title: string; 
  description: string; 
  demo: React.ReactNode;
}) {
  return (
    <div className="bg-background dark:bg-card rounded-xl p-6 shadow-md border border-border dark:border-border hover:shadow-lg transition-all duration-200">
      <div className="text-center mb-6">
        <div className="bg-primary dark:bg-primary text-foreground text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          {step}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-foreground dark:text-foreground">{title}</h3>
        <p className="text-muted-foreground dark:text-muted-foreground text-sm">{description}</p>
      </div>
      <div className="border-t border-border dark:border-border pt-4">
        {demo}
      </div>
    </div>
  );
}

function ProjectCreationDemo() {
  return (
    <div className="space-y-3">
      {/* Project Header Preview */}
      <div className="bg-muted dark:bg-muted rounded-lg p-3 border border-border dark:border-border">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-primary rounded-full"></div>
          <span className="text-sm font-semibold text-foreground dark:text-foreground">Website Redesign</span>
        </div>
        <div className="text-xs text-muted-foreground dark:text-muted-foreground">Project workspace created</div>
      </div>
      
      {/* Tabs Preview */}
      <div className="flex gap-1 bg-muted dark:bg-muted p-1 rounded-lg">
        <div className="px-2 py-1 bg-background dark:bg-card text-primary rounded text-xs font-medium">Overview</div>
        <div className="px-2 py-1 text-muted-foreground dark:text-muted-foreground text-xs">Tasks (8)</div>
        <div className="px-2 py-1 text-muted-foreground dark:text-muted-foreground text-xs">Members (5)</div>
      </div>
    </div>
  );
}

function TaskOrganizationDemo() {
  return (
    <div className="space-y-3">
      {/* Task Card Preview */}
      <div className="bg-background dark:bg-card border border-border dark:border-border rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">High</div>
        </div>
        <div className="text-sm font-semibold text-foreground dark:text-foreground mb-1">Design System</div>
        <div className="text-xs text-muted-foreground dark:text-muted-foreground mb-2">Create component library</div>
        
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground dark:text-muted-foreground">
            <span>Progress</span>
            <span>67%</span>
          </div>
          <div className="w-full bg-muted dark:bg-gray-700 rounded-full h-1">
            <div className="bg-primary h-1 rounded-full" style={{ width: '67%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Subtasks Preview */}
      <div className="text-xs text-muted-foreground dark:text-muted-foreground">+ 3 subtasks</div>
    </div>
  );
}

function ProgressTrackingDemo() {
  return (
    <div className="space-y-3">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-background dark:bg-card border border-border dark:border-border rounded">
          <div className="text-lg font-bold text-foreground dark:text-foreground">12</div>
          <div className="text-xs text-muted-foreground dark:text-muted-foreground">Total Tasks</div>
        </div>
        <div className="text-center p-2 bg-background dark:bg-card border border-border dark:border-border rounded">
          <div className="text-lg font-bold text-foreground dark:text-foreground">5</div>
          <div className="text-xs text-muted-foreground dark:text-muted-foreground">Team Members</div>
        </div>
      </div>
      
      {/* Team Preview */}
      <div className="bg-muted dark:bg-muted rounded p-2">
        <div className="text-xs font-medium text-foreground dark:text-foreground mb-1">Team</div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
            <span className="text-foreground text-xs">J</span>
          </div>
          <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
            <span className="text-foreground text-xs">A</span>
          </div>
          <span className="text-xs text-muted-foreground dark:text-muted-foreground">+3</span>
        </div>
      </div>
    </div>
  );
}
