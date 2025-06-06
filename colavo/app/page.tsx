import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/ui/navbar';
import { CheckCircle, Star, Users, Calendar } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f9f8f0] to-white dark:from-gray-950 dark:to-gray-900">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="lg:w-1/2 space-y-8">
            <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
              The Future of{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#008080] to-[#00FFFF] dark:from-[#008080] dark:to-[#00FFFF]">
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
              title="Task Management"
              description="Create, assign, and track tasks with powerful filtering and sorting options."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-[#008080] dark:text-[#00FFFF]" />}
              title="Team Collaboration"
              description="Work together seamlessly with real-time updates and team communication tools."
            />
            <FeatureCard
              icon={<Calendar className="h-8 w-8 text-[#008080] dark:text-[#00FFFF]" />}
              title="Project Timeline"
              description="Visualize project progress with interactive timelines and milestone tracking."
            />
            <FeatureCard
              icon={<Star className="h-8 w-8 text-[#00FFFF] dark:text-[#00FFFF]" />}
              title="Quality Assurance"
              description="Ensure project quality with built-in review workflows and approval processes."
            />
            <FeatureCard
              icon={<CheckCircle className="h-8 w-8 text-[#008080] dark:text-[#00FFFF]" />}
              title="Progress Tracking"
              description="Monitor project progress with detailed analytics and reporting tools."
            />
            <FeatureCard
              icon={<Users className="h-8 w-8 text-[#00FFFF] dark:text-[#00FFFF]" />}
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
      <section className="bg-gradient-to-r from-[#008080] to-[#00FFFF] dark:from-[#008080] dark:to-[#006666] py-20">
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
      <footer className="bg-[#f0efea] dark:bg-gray-900 border-t border-[#e5e4dd] dark:border-gray-800 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-[#008080] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">C</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Collavo</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400">
                The ultimate project management platform for modern teams.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Product</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="#features" className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors">Pricing</Link></li>
                <li><Link href="#integrations" className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Company</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="#about" className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors">About</Link></li>
                <li><Link href="#careers" className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors">Careers</Link></li>
                <li><Link href="#contact" className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Support</h4>
              <ul className="space-y-2 text-gray-600 dark:text-gray-400">
                <li><Link href="#help" className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors">Help Center</Link></li>
                <li><Link href="#docs" className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors">Documentation</Link></li>
                <li><Link href="#status" className="hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors">Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#e5e4dd] dark:border-gray-700 mt-8 pt-8 text-center text-gray-600 dark:text-gray-400">
            <p>&copy; 2024 Collavo. All rights reserved.</p>
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

function StepCard({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="text-center">
      <div className="bg-[#008080] dark:bg-[#008080] text-white text-2xl font-bold w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
        {step}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
}
