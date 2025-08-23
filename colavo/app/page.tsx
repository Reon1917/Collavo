import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar';
import { CheckCircle, Star, Users, Calendar, User} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 dark:from-emerald-900 dark:via-teal-800 dark:to-cyan-900">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section with Gradient Background */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Decorative 3D Components */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Component 1 - Top Left */}
          <div className="absolute top-10 left-10 lg:top-20 lg:left-20 opacity-80 animate-float">
            <img 
              src="/component1.png" 
              alt="3D Component 1" 
              className="w-28 h-28 lg:w-40 lg:h-40 object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Component 2 - Top Right */}
          <div className="absolute top-16 right-8 lg:top-32 lg:right-16 opacity-70 animate-float-delayed">
            <img 
              src="/component2.png" 
              alt="3D Component 2" 
              className="w-24 h-24 lg:w-36 lg:h-36 object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Component 3 - Bottom Right */}
          <div className="absolute bottom-20 right-12 lg:bottom-32 lg:right-24 opacity-75 animate-float-slow">
            <img 
              src="/component3.png" 
              alt="3D Component 3" 
              className="w-32 h-32 lg:w-44 lg:h-44 object-contain drop-shadow-lg"
            />
          </div>
          
          {/* Additional subtle elements */}
          <div className="absolute top-1/3 left-1/4 w-2 h-16 bg-white/10 rounded-full rotate-45 animate-pulse"></div>
          <div className="absolute bottom-1/3 left-1/6 w-3 h-20 bg-white/8 rounded-full rotate-12 animate-pulse"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-10 container mx-auto px-6 pt-32 pb-20 min-h-screen flex flex-col justify-center">
          <div className="text-center max-w-6xl mx-auto">
            {/* Welcome Text */}
            <p className="text-white/90 text-lg md:text-xl font-medium mb-8 tracking-wide">
              Welcome to Collavo!
            </p>
            
            {/* Main Heading */}
            <div className="space-y-4 mb-12">
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight">
                Collaborate
              </h1>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight">
                Coordinate
              </h1>
              <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold text-white leading-none tracking-tight italic">
                Conquer
              </h1>
            </div>
            
            {/* Subtitle */}
            <p className="text-white/80 text-xl md:text-2xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              Deadlines Met. Projects Done. Stress Gone.
            </p>
            
            {/* CTA Button */}
            <div className="flex justify-center">
              <Button 
                asChild
                size="lg" 
                className="bg-white/95 hover:bg-white text-primary text-xl px-12 py-6 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border-0"
              >
                <Link href="/signup" className="flex items-center gap-3">
                  Get Started Now 
                  <span className="text-2xl">→</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-1 h-8 bg-white/40 rounded-full"></div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Our comprehensive suite of tools helps teams stay organized, communicate effectively, 
              and deliver projects on time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-[#008080] dark:text-[#00FFFF]" />}
              title="Smart Task Organization"
              description="Create main tasks and break them into manageable subtasks with priority levels, deadlines, and assignment tracking."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-[#008080] dark:text-[#00FFFF]" />}
              title="Role-Based Permissions"
              description="Granular permission system with leader and member roles, ensuring the right people have the right access."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8 text-[#008080] dark:text-[#00FFFF]" />}
              title="Real-Time Progress"
              description="Live progress tracking with visual indicators, completion percentages, and instant status updates."
            />
            <FeatureCard
              icon={<Star className="h-8 w-8 text-[#008080] dark:text-[#00FFFF]" />}
              title="Intuitive Dashboard"
              description="Clean overview with project stats, recent activity, team insights, and quick access to all features."
            />
            <FeatureCard
              icon={<User className="h-8 w-8 text-[#008080] dark:text-[#00FFFF]" />}
              title="Team Management"
              description="Easily invite members, manage roles, and track who's working on what with visual team indicators."
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-[#008080] dark:text-[#00FFFF]" />}
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
            <h2 className="text-4xl font-bold text-white mb-4">
              How Collavo Works
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto mb-8">
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
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20">
            <h3 className="text-2xl font-bold text-center mb-8 text-white">
              From Setup to Success
            </h3>
            
            {/* Progress Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-white/40 hidden md:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Stage 1: Project Creation */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg border border-white/40">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Project Created</h4>
                  <p className="text-sm text-white/70 mb-3">Website Redesign workspace</p>
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 w-full max-w-24 border border-white/20">
                    <div className="text-xs text-white/70">Members: 5</div>
                  </div>
                </div>

                {/* Stage 2: Active Development */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg border border-white/40">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Tasks Organized</h4>
                  <p className="text-sm text-white/70 mb-3">High priority task with progress</p>
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 w-full max-w-24 border border-white/20">
                    <div className="text-xs text-white/70">Tasks: 8</div>
                    <div className="w-full bg-white/20 rounded-full h-1 mt-1">
                      <div className="bg-white/80 h-1 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Stage 3: Tracking & Analytics */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-white/30 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg border border-white/40">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-white mb-2">Real-time Insights</h4>
                  <p className="text-sm text-white/70 mb-3">Overview dashboard with metrics</p>
                  <div className="bg-white/15 backdrop-blur-sm rounded-lg p-2 w-full max-w-24 border border-white/20">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-white">12</div>
                        <div className="text-white/70">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-white">67%</div>
                        <div className="text-white/70">Done</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-8 pt-6 border-t border-white/20">
              <p className="text-sm text-white/70">
                Join teams already using Collavo for seamless project management
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Team&apos;s Productivity?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who have already streamlined their workflow with Collavo.
          </p>
          <Button asChild size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white/90 hover:bg-white text-teal-600 border-0">
            <Link href="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/20 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center border border-white/30">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h3 className="text-xl font-bold text-white">Collavo</h3>
            </div>
            <div className="text-center md:text-right">
              <p className="text-white/80 font-medium">
                Developed by Team Stressed Coders
              </p>
              <p className="text-sm text-white/60 mt-1">
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
    <div className="bg-white/10 backdrop-blur-md p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-white/20 hover:border-white/40">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-white/80">{description}</p>
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
    <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 shadow-md border border-white/20 hover:shadow-lg transition-all duration-200">
      <div className="text-center mb-6">
        <div className="bg-white/20 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          {step}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
        <p className="text-white/80 text-sm">{description}</p>
      </div>
      <div className="border-t border-white/20 pt-4">
        {demo}
      </div>
    </div>
  );
}

function ProjectCreationDemo() {
  return (
    <div className="space-y-3">
      {/* Project Header Preview */}
      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-white/80 rounded-full"></div>
          <span className="text-sm font-semibold text-white">Website Redesign</span>
        </div>
        <div className="text-xs text-white/70">Project workspace created</div>
      </div>
      
      {/* Tabs Preview */}
      <div className="flex gap-1 bg-white/15 backdrop-blur-sm p-1 rounded-lg border border-white/20">
        <div className="px-2 py-1 bg-white/30 text-white rounded text-xs font-medium">Overview</div>
        <div className="px-2 py-1 text-white/70 text-xs">Tasks (8)</div>
        <div className="px-2 py-1 text-white/70 text-xs">Members (5)</div>
      </div>
    </div>
  );
}

function TaskOrganizationDemo() {
  return (
    <div className="space-y-3">
      {/* Task Card Preview */}
      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-1 bg-orange-400/80 text-white rounded text-xs font-medium">High</div>
        </div>
        <div className="text-sm font-semibold text-white mb-1">Design System</div>
        <div className="text-xs text-white/70 mb-2">Create component library</div>
        
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-white/70">
            <span>Progress</span>
            <span>67%</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-1">
            <div className="bg-white/80 h-1 rounded-full" style={{ width: '67%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Subtasks Preview */}
      <div className="text-xs text-white/70">+ 3 subtasks</div>
    </div>
  );
}

function ProgressTrackingDemo() {
  return (
    <div className="space-y-3">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded">
          <div className="text-lg font-bold text-white">12</div>
          <div className="text-xs text-white/70">Total Tasks</div>
        </div>
        <div className="text-center p-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded">
          <div className="text-lg font-bold text-white">5</div>
          <div className="text-xs text-white/70">Team Members</div>
        </div>
      </div>
      
      {/* Team Preview */}
      <div className="bg-white/15 backdrop-blur-sm rounded p-2 border border-white/20">
        <div className="text-xs font-medium text-white mb-1">Team</div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-white/30 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">J</span>
          </div>
          <div className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">A</span>
          </div>
          <span className="text-xs text-white/70">+3</span>
        </div>
      </div>
    </div>
  );
}
