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
        className="block px-4 py-2 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors data-[active=true]:bg-primary/10 data-[active=true]:text-primary data-[active=true]:font-medium"
        data-active={isActive}
      >
        {children}
      </Link>
    </li>
  );
} 