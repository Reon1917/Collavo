"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useAuth } from '@/providers/auth-provider';
import { Plus, User, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatInitials } from '@/utils/format';
import { InvitationModal } from '@/components/dashboard/InvitationModal';

export function DashboardNavbar(): React.JSX.Element {
  const { user, isAuthenticated, refetch } = useAuth();
  const router = useRouter();

  const handleLogout = async (): Promise<void> => {
    try {
      await authClient.signOut();
      await refetch();
      router.push('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-950 border-b border-[#e5e4dd] dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#008080] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Collavo</span>
            </Link>
          </div>

          {/* Right side - Actions and User */}
          <div className="flex items-center space-x-4">
            {/* Create Button */}
            <Button asChild className="bg-[#008080] hover:bg-[#008080]/90 dark:bg-[#008080] dark:hover:bg-[#008080]/70">
              <Link href="/project/new">
                <Plus className="h-4 w-4 mr-2" />
                Create
              </Link>
            </Button>

            {/* Invitation Modal */}
            {isAuthenticated && (
              <InvitationModal onInvitationAccepted={refetch} />
            )}

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* User Menu */}
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ''} alt={user.name} />
                      <AvatarFallback className="bg-[#008080] text-white text-sm">
                        {formatInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 dark:text-red-400">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-[#008080] hover:bg-[#008080]/90 dark:bg-[#008080] dark:hover:bg-[#008080]/70">
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 