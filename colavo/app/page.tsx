import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Manage Student Projects with Ease
              </h1>
              <p className="text-lg md:text-xl opacity-90">
                Collavo helps students track assignments alone or with friends. Organize tasks, set deadlines, and collaborate effectively.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                    Get Started
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  Learn More
                </Button>
              </div>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/dashboard-preview.png" 
                alt="Collavo Dashboard Preview" 
                className="rounded-lg shadow-xl"
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything You Need for Academic Success</h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              title="Personal Task Management" 
              description="Create projects, add tasks, and set priorities to stay organized with your individual assignments."
              icon="📝"
            />
            <FeatureCard 
              title="Team Collaboration" 
              description="Invite up to 5 friends to your projects, assign tasks, and track progress together."
              icon="👥"
            />
            <FeatureCard 
              title="Timeline Visualization" 
              description="See all your tasks on an interactive timeline to manage deadlines effectively."
              icon="📅"
            />
            <FeatureCard 
              title="File Organization" 
              description="Store links to your Canva, Google Docs, and other resources in one central location."
              icon="📁"
            />
            <FeatureCard 
              title="Deadline Reminders" 
              description="Get email notifications when important deadlines are approaching."
              icon="⏰"
            />
            <FeatureCard 
              title="Role-Based Access" 
              description="Control who can view, edit, or manage your project with customizable permissions."
              icon="🔒"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">How It Works</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Collavo makes project management simple for students. Here's how you can get started:
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number="1" 
              title="Create a Project" 
              description="Start by creating a new project and adding your assignment details."
            />
            <StepCard 
              number="2" 
              title="Add Tasks & Invite Friends" 
              description="Break down your project into tasks and invite team members if needed."
            />
            <StepCard 
              number="3" 
              title="Track Progress" 
              description="Monitor task completion and stay on top of deadlines with visual timelines."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Boost Your Academic Success?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join thousands of students who are already using Collavo to manage their assignments and group projects.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-white text-xl font-bold">Collavo</h3>
              <p>Student Project Management Tool</p>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="hover:text-white">About</Link>
              <Link href="#" className="hover:text-white">Features</Link>
              <Link href="#" className="hover:text-white">Contact</Link>
              <Link href="#" className="hover:text-white">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} Collavo. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow text-center">
      <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
        {number}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
