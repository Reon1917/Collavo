import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        {/* Top navigation with logo */}
        <Navbar />

        <div className="container mx-auto px-4 py-16 md:py-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="md:w-1/2 space-y-6">
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
                Transform Chaos into Academic Excellence
              </h2>
              <p className="text-lg md:text-xl opacity-90">
                The ultimate project management tool designed specifically for students. Crush deadlines, streamline group work, and boost your academic performance with our intuitive platform.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link href="/dashboard">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                    Get Started Free
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-white/10">
                  See How It Works
                </Button>
              </div>
              <p className="text-sm text-blue-100">
                Built by students, for students.
              </p>
            </div>
            <div className="md:w-1/2 relative">
              <div className="absolute -top-4 -left-4 w-20 h-20 bg-yellow-400 rounded-full opacity-20 blur-xl"></div>
              <div className="absolute -bottom-8 -right-8 w-40 h-40 bg-blue-300 rounded-full opacity-20 blur-xl"></div>
              <img 
                src="/landingpage-img/dashboard.png" 
                alt="Collavo Dashboard Preview - Student Project Management" 
                className="rounded-lg shadow-xl relative z-10"
                width={600}
                height={400}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Designed for Student Success</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            From solo assignments to complex group projects, Collavo gives you the tools to excel in today's competitive academic environment.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              title="Intelligent Task Management" 
              description="Prioritize assignments, track progress, and never miss another deadline with our smart task system built for academic workflows."
              icon="📝"
            />
            <FeatureCard 
              title="Frictionless Collaboration" 
              description="Invite classmates, assign responsibilities, and coordinate effortlessly—even with the most challenging group projects."
              icon="👥"
            />
            <FeatureCard 
              title="Visual Deadline Tracking" 
              description="Transform overwhelming semester schedules into clear visual timelines that help you plan ahead and stay in control."
              icon="📅"
            />
            <FeatureCard 
              title="Centralized Resource Hub" 
              description="Connect all your academic tools—Google Docs, Canva, research papers, and more—in one organized workspace."
              icon="📁"
            />
            <FeatureCard 
              title="Strategic Reminder System" 
              description="Our intelligent notifications adapt to your work patterns, alerting you at optimal times to maximize productivity."
              icon="⏰"
            />
            <FeatureCard 
              title="Academic Privacy Controls" 
              description="Maintain control over your intellectual property with customizable sharing permissions for every project and document."
              icon="🔒"
            />
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Your Path to Academic Excellence</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Getting started takes less than 60 seconds. No complicated setup, no learning curve—just immediate productivity.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard 
              number="1" 
              title="Create Your Project Space" 
              description="Set up a dedicated workspace for each class or assignment with all the tools you need in one place."
            />
            <StepCard 
              number="2" 
              title="Organize & Delegate" 
              description="Break complex assignments into manageable tasks and distribute work among team members with precision."
            />
            <StepCard 
              number="3" 
              title="Execute & Excel" 
              description="Track progress in real-time, adapt to changes, and deliver exceptional results that stand out to professors."
            />
          </div>
        </div>
      </section>

      {/* About University Project Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">A University Project With Purpose</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-600">
            Collavo was developed as a university project aimed at solving real academic challenges. We're committed to providing this tool completely free to help students collaborate more effectively.
          </p>
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md flex-1">
              <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
              <p className="text-gray-600">To empower students with collaborative tools that enhance learning outcomes and reduce project stress.</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md flex-1">
              <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
              <p className="text-gray-600">A future where student collaboration is seamless, productive, and accessible to everyone.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Revolutionize Your Academic Experience?</h2>
          <p className="text-xl opacity-90 mb-8 max-w-2xl mx-auto">
            Join the growing community of students who are transforming how academic projects get done. Your future self will thank you.
          </p>
          <Link href="/dashboard">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              Start Using Collavo Today
            </Button>
          </Link>
          <p className="mt-4 text-sm opacity-75">100% Free University Project</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-gray-900 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="text-white text-xl font-bold">Collavo</h3>
              <p>Elevating Student Collaboration</p>
            </div>
            <div className="flex gap-6">
              <Link href="#features" className="hover:text-white">Features</Link>
              <Link href="#how-it-works" className="hover:text-white">How It Works</Link>
              <Link href="#" className="hover:text-white">Contact</Link>
              <Link href="#" className="hover:text-white">Privacy</Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            &copy; {new Date().getFullYear()} Collavo. University Project. All rights reserved.
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
