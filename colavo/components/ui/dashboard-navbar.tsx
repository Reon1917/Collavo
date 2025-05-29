"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useAuth } from '@/providers/auth-provider';
import { Search, Bell, Plus, User, Settings, LogOut, Moon, Sun } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatInitials } from '@/utils/format';
import { useTheme } from 'next-themes';

export function DashboardNavbar(): React.JSX.Element {
  const { user, isAuthenticated, refetch } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const { setTheme, theme } = useTheme();

  const handleLogout = async (): Promise<void> => {
    try {
      await authClient.signOut();
      await refetch();
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  const handleSearch = (e: React.FormEvent): void => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // TODO: Implement search functionality
      toast.info(`Searching for: ${searchQuery}`);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-950 border-b border-[#e5e4dd] dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#008080] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Collavo</span>
            </Link>
            
            {/* Quick Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/dashboard" 
                className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF] font-medium transition-colors"
              >
                Dashboard
              </Link>
              <Link 
                href="/projects" 
                className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF] font-medium transition-colors"
              >
                Projects
              </Link>
              <Link 
                href="/team" 
                className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF] font-medium transition-colors"
              >
                Team
              </Link>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search projects, tasks, people..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 w-full bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] transition-colors"
              />
            </form>
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

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {/* Notification badge */}
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-[#00FFFF] rounded-full text-xs text-gray-800 flex items-center justify-center">
                3
              </span>
            </Button>

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
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center">
                      <Settings className="h-4 w-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {/* Theme Toggle */}
                  <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="flex items-center">
                    {theme === 'dark' ? (
                      <>
                        <Sun className="h-4 w-4 mr-2" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="h-4 w-4 mr-2" />
                        Dark Mode
                      </>
                    )}
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