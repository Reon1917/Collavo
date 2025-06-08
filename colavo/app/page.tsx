import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar';
import { CheckCircle, Star, Users, Calendar, User} from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f9f8f0] dark:bg-gray-950">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
              The Future of{' '}
              <span className="text-[#008080] dark:text-[#008080]">
                Project Collaboration
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Streamline your team&apos;s workflow with our powerful project management platform. 
              From task tracking to seamless communication, everything you need in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-[#008080] hover:bg-[#008080]/90 dark:bg-[#008080] dark:hover:bg-[#008080]/70 text-white text-lg px-8 py-4">
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-[#e5e4dd] dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-[#f0efea] dark:hover:bg-gray-800">
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
      <section id="features" className="bg-[#f0efea] dark:bg-gray-900/50 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
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
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              How Collavo Works
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
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
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-white">
              From Setup to Success
            </h3>
            
            {/* Progress Timeline */}
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute top-6 left-6 right-6 h-0.5 bg-[#008080] hidden md:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
                {/* Stage 1: Project Creation */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-[#008080] rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Project Created</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Website Redesign workspace</p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 w-full max-w-24">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Members: 5</div>
                  </div>
                </div>

                {/* Stage 2: Active Development */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-[#008080] rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg">
                    <CheckCircle className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Tasks Organized</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">High priority task with progress</p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 w-full max-w-24">
                    <div className="text-xs text-gray-500 dark:text-gray-400">Tasks: 8</div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1 mt-1">
                      <div className="bg-[#008080] h-1 rounded-full" style={{ width: '67%' }}></div>
                    </div>
                  </div>
                </div>

                {/* Stage 3: Tracking & Analytics */}
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-[#008080] rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Real-time Insights</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Overview dashboard with metrics</p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 w-full max-w-24">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="text-center">
                        <div className="font-bold text-gray-900 dark:text-white">12</div>
                        <div className="text-gray-500 dark:text-gray-400">Total</div>
                      </div>
                      <div className="text-center">
                        <div className="font-bold text-gray-900 dark:text-white">67%</div>
                        <div className="text-gray-500 dark:text-gray-400">Done</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom CTA */}
            <div className="text-center mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Join teams already using Collavo for seamless project management
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#008080] dark:bg-[#006666] py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Team&apos;s Productivity?
          </h2>
          <p className="text-xl text-white/90 dark:text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who have already streamlined their workflow with Collavo.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-[#008080] hover:bg-gray-50 dark:bg-gray-200 dark:text-[#008080] dark:hover:bg-gray-300">
            <Link href="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#f0efea] dark:bg-gray-900 border-t border-[#e5e4dd] dark:border-gray-800 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#008080] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Collavo</h3>
            </div>
            <div className="text-center md:text-right">
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                Developed by Team Stressed Coders
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
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
    <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 border border-gray-200/60 dark:border-gray-700 hover:border-[#00FFFF]/30 dark:hover:border-[#00FFFF]/50 backdrop-blur-sm">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
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
    <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200">
      <div className="text-center mb-6">
        <div className="bg-[#008080] dark:bg-[#008080] text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          {step}
        </div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm">{description}</p>
      </div>
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
        {demo}
      </div>
    </div>
  );
}

function ProjectCreationDemo() {
  return (
    <div className="space-y-3">
      {/* Project Header Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-3 h-3 bg-[#008080] rounded-full"></div>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">Website Redesign</span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400">Project workspace created</div>
      </div>
      
      {/* Tabs Preview */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        <div className="px-2 py-1 bg-white dark:bg-gray-900 text-[#008080] rounded text-xs font-medium">Overview</div>
        <div className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">Tasks (8)</div>
        <div className="px-2 py-1 text-gray-600 dark:text-gray-400 text-xs">Members (5)</div>
      </div>
    </div>
  );
}

function TaskOrganizationDemo() {
  return (
    <div className="space-y-3">
      {/* Task Card Preview */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="px-2 py-1 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded text-xs font-medium">High</div>
        </div>
        <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Design System</div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Create component library</div>
        
        {/* Progress bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Progress</span>
            <span>67%</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
            <div className="bg-[#008080] h-1 rounded-full" style={{ width: '67%' }}></div>
          </div>
        </div>
      </div>
      
      {/* Subtasks Preview */}
      <div className="text-xs text-gray-500 dark:text-gray-400">+ 3 subtasks</div>
    </div>
  );
}

function ProgressTrackingDemo() {
  return (
    <div className="space-y-3">
      {/* Overview Stats Cards */}
      <div className="grid grid-cols-2 gap-2">
        <div className="text-center p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
          <div className="text-lg font-bold text-gray-900 dark:text-white">12</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Tasks</div>
        </div>
        <div className="text-center p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded">
          <div className="text-lg font-bold text-gray-900 dark:text-white">5</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Team Members</div>
        </div>
      </div>
      
      {/* Team Preview */}
      <div className="bg-gray-50 dark:bg-gray-800 rounded p-2">
        <div className="text-xs font-medium text-gray-900 dark:text-white mb-1">Team</div>
        <div className="flex items-center gap-1">
          <div className="w-4 h-4 bg-[#008080] rounded-full flex items-center justify-center">
            <span className="text-white text-xs">J</span>
          </div>
          <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
            <span className="text-white text-xs">A</span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">+3</span>
        </div>
      </div>
    </div>
  );
}
