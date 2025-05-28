"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { User, Plus, FolderOpen, Users, Calendar } from 'lucide-react';

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If no session and not pending, redirect to landing page
    if (!session && !isPending) {
      router.push('/');
    }
  }, [session, isPending, router]);

  // Show loading state while checking session
  if (isPending) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // If no session, don't show dashboard (redirect will happen in useEffect)
  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back to Collavo, {session.user.name}!</p>
        </div>
        <div className="flex items-center gap-2">
          <Button className="bg-blue-600 hover:bg-blue-700" asChild>
            <Link href="/project/new">
              <Plus className="h-4 w-4 mr-2" />
              Create New Project
            </Link>
          </Button>
          <Button variant="outline" size="icon" asChild>
            <Link href="/profile">
              <User className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Quick Stats */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <FolderOpen className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Projects Led</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Collaborations</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Due This Week</p>
              <p className="text-2xl font-bold text-gray-900">0</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {/* Projects you lead */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Projects You Lead</h2>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No projects yet</h3>
            <p className="text-gray-600 mb-4">
              Create your first project to get started with collaboration
            </p>
            <Button className="bg-blue-600 hover:bg-blue-700" asChild>
              <Link href="/project/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Project
              </Link>
            </Button>
          </div>
        </section>

        {/* Projects you're a member of */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Projects You&apos;re In</h2>
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No memberships yet</h3>
            <p className="text-gray-600">
              You haven&apos;t been added to any projects as a member yet. Start collaborating by creating a project or being invited to one!
            </p>
          </div>
        </section>

        {/* Recent Activity */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Recent Activity</h2>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <p className="text-gray-600 text-center py-8">
              No recent activity. Create a project to get started!
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
