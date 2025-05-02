import { ReactNode } from 'react';
import Link from 'next/link';
import { getProjectById } from '@/lib/data';

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: { id: string };
}) {
  const project = await getProjectById(params.id);

  if (!project) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Project Not Found</h1>
        <p className="mb-6">The project you're looking for doesn't exist or you don't have access to it.</p>
        <Link 
          href="/dashboard" 
          className="text-blue-600 hover:underline"
        >
          Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-6 border-b border-gray-200">
          <Link href="/dashboard" className="text-sm text-blue-600 hover:underline mb-2 block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-xl font-bold truncate">{project.name}</h1>
        </div>
        <nav className="p-4">
          <ul className="space-y-1">
            <NavItem href={`/project/${params.id}`} exact>
              Overview
            </NavItem>
            <NavItem href={`/project/${params.id}/tasks`}>
              Tasks
            </NavItem>
            <NavItem href={`/project/${params.id}/files`}>
              Files & Links
            </NavItem>
            <NavItem href={`/project/${params.id}/members`}>
              Members
            </NavItem>
          </ul>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  );
}

function NavItem({ 
  href, 
  exact = false, 
  children 
}: { 
  href: string; 
  exact?: boolean; 
  children: ReactNode 
}) {
  // In a client component, we would use usePathname() to determine active state
  // For this prototype, we'll just render all items the same
  return (
    <li>
      <Link 
        href={href}
        className="block px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-blue-600 transition-colors"
      >
        {children}
      </Link>
    </li>
  );
}
