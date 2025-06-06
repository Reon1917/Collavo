"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { authClient } from '@/lib/auth-client';
import { useAuth } from '@/providers/auth-provider';
import { Menu, X, LogIn, LogOut, User } from 'lucide-react';
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

export function Navbar() {
  const { user, isAuthenticated, refetch } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await authClient.signOut();
      await refetch();
      router.push('/');
      toast.success('Logged out successfully');
    } catch {
      //console.error('Logout error:', error);
      toast.error('Error logging out');
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-950 border-b border-[#e5e4dd] dark:border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side - Logo and Navigation */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#008080] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">Collavo</span>
            </Link>
            
            {/* Quick Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <Link 
                href="/#features" 
                className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF] font-medium transition-colors"
              >
                Features
              </Link>
              <Link 
                href="/#how-it-works" 
                className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF] font-medium transition-colors"
              >
                How It Works
              </Link>
            </div>
          </div>

          {/* Right side - Actions and User */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 rounded-full p-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
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
                    <Link href="/dashboard" className="flex items-center">
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 dark:text-red-400">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link href="/login">
                    <LogIn className="h-4 w-4 mr-2" />
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="bg-[#008080] hover:bg-[#008080]/90 dark:bg-[#008080] dark:hover:bg-[#008080]/70">
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF]"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#e5e4dd] dark:border-gray-800 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/#features" 
                className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF] font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link 
                href="/#how-it-works" 
                className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF] font-medium transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </Link>
              
              {isAuthenticated && user ? (
                <>
                  <div className="border-t border-[#e5e4dd] dark:border-gray-800 pt-4">
                    <div className="flex items-center space-x-3 mb-4">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                        <AvatarFallback className="bg-[#008080] text-white text-sm">
                          {formatInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-gray-900 dark:text-white font-medium text-sm">{user.name}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF] font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF] font-medium transition-colors py-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  <Button 
                    variant="outline" 
                    className="border-[#e5e4dd] dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-[#f0efea] dark:hover:bg-gray-800 hover:text-[#008080] dark:hover:text-[#00FFFF] transition-all duration-200 justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="ghost" className="text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF] transition-colors justify-start" asChild>
                    <Link href="/login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </Link>
                  </Button>
                  <Button className="bg-[#008080] hover:bg-[#008080]/90 dark:bg-[#008080] dark:hover:bg-[#008080]/70 text-white" asChild>
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 