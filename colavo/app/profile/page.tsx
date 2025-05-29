import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function ProfilePage() {
  // Get the current user
  const session = await auth();
  
  if (!session) {
    redirect('/login');
  }
  
  const user = session.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard" className="text-blue-600 hover:text-blue-800 flex items-center">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </div>
        
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Profile</CardTitle>
              <CardDescription>
                Manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-3">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.image || ''} alt={user.name || 'User'} />
                  <AvatarFallback className="bg-blue-600 text-xl">
                    {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center">
                  <h2 className="text-xl font-semibold">{user.name}</h2>
                  <p className="text-gray-500">{user.email}</p>
                </div>
              </div>
              
              <div className="pt-4 space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Full Name</h3>
                  <p className="text-base">{user.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                  <p className="text-base">{user.email}</p>
                </div>
                {user.emailVerified ? (
                  <div className="bg-green-50 text-green-800 text-sm py-2 px-3 rounded-md">
                    Email verified
                  </div>
                ) : (
                  <div className="bg-yellow-50 text-yellow-800 text-sm py-2 px-3 rounded-md">
                    Email not verified
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-end">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Return to Dashboard</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 