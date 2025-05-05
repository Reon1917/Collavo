'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function NavItem({ 
  href, 
  exact = false, 
  children 
}: { 
  href: string; 
  exact?: boolean; 
  children: ReactNode 
}) {
  const pathname = usePathname();
  const isActive = exact ? pathname === href : pathname.startsWith(href);

  return (
    <li>
      <Link 
        href={href}
        className="block px-4 py-2 rounded-md hover:bg-gray-100 text-gray-700 hover:text-blue-600 transition-colors data-[active=true]:bg-blue-50 data-[active=true]:text-blue-600 data-[active=true]:font-medium"
        data-active={isActive}
      >
        {children}
      </Link>
    </li>
  );
} 