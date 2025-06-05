import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar';
import { CheckCircle, Star, Users, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
              The Future of{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                Project Collaboration
              </span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              Streamline your team&apos;s workflow with our powerful project management platform. 
              From task tracking to seamless communication, everything you need in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-lg px-8 py-4">
                <Link href="/signup">Get Started Free</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
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
      <section id="features" className="bg-gray-50 dark:bg-gray-900/50 py-20">
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
              icon={<CheckCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />}
              title="Task Management"
              description="Create, assign, and track tasks with powerful filtering and sorting options."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-green-600 dark:text-green-400" />}
              title="Team Collaboration"
              description="Work together seamlessly with real-time updates and team communication tools."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />}
              title="Project Timeline"
              description="Visualize project progress with interactive timelines and milestone tracking."
            />
            <FeatureCard
              icon={<Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />}
              title="Quality Assurance"
              description="Ensure project quality with built-in review workflows and approval processes."
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />}
              title="Progress Tracking"
              description="Monitor project progress with detailed analytics and reporting tools."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-red-600 dark:text-red-400" />}
              title="Resource Management"
              description="Efficiently allocate and manage team resources across multiple projects."
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
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Get started in minutes and transform how your team collaborates on projects.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              step="01"
              title="Create Your Project"
              description="Set up your project workspace and invite team members to collaborate."
            />
            <StepCard
              step="02"
              title="Organize Tasks"
              description="Break down your project into manageable tasks and assign them to team members."
            />
            <StepCard
              step="03"
              title="Track Progress"
              description="Monitor progress in real-time and keep everyone aligned with project goals."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Transform Your Team&apos;s Productivity?
          </h2>
          <p className="text-xl text-blue-100 dark:text-blue-200 mb-8 max-w-2xl mx-auto">
            Join thousands of teams who have already streamlined their workflow with Collavo.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 dark:bg-gray-200 dark:text-blue-800 dark:hover:bg-gray-300">
            <Link href="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">Collavo</h3>
              <p className="text-gray-400 dark:text-gray-500">
                The ultimate project management platform for modern teams.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><Link href="#features" className="hover:text-white">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-white">Pricing</Link></li>
                <li><Link href="#integrations" className="hover:text-white">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><Link href="#about" className="hover:text-white">About</Link></li>
                <li><Link href="#careers" className="hover:text-white">Careers</Link></li>
                <li><Link href="#contact" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400 dark:text-gray-500">
                <li><Link href="#help" className="hover:text-white">Help Center</Link></li>
                <li><Link href="#docs" className="hover:text-white">Documentation</Link></li>
                <li><Link href="#status" className="hover:text-white">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 dark:border-gray-700 mt-8 pt-8 text-center text-gray-400 dark:text-gray-500">
            <p>&copy; 2024 Collavo. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="bg-blue-600 dark:bg-blue-700 text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
        {step}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
