import { redirect } from 'next/navigation';
import { Navbar } from '@/components/ui/navbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default async function NewProjectPage() {
  // TODO: Replace with proper authentication check
  // const session = await fetch('/api/auth/session').then(res => res.json());
  // if (!session) {
  //   redirect('/login');
  // }

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
        
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl">Create New Project</CardTitle>
              <CardDescription>
                Set up a new project workspace for your team
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="projectName">Project Name</Label>
                <Input 
                  id="projectName" 
                  placeholder="Enter a descriptive name for your project" 
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="projectDescription">Description</Label>
                <Textarea 
                  id="projectDescription" 
                  placeholder="Describe the purpose and goals of this project"
                  className="min-h-32"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input 
                  id="deadline" 
                  type="date" 
                  className="w-full"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Project Visibility</Label>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-private"
                    name="visibility"
                    value="private"
                    defaultChecked
                    className="h-4 w-4"
                  />
                  <Label htmlFor="visibility-private" className="text-sm">
                    Private - Only visible to invited members
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="visibility-public"
                    name="visibility"
                    value="public"
                    className="h-4 w-4"
                  />
                  <Label htmlFor="visibility-public" className="text-sm">
                    Public - Visible to all Collavo users
                  </Label>
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-6 flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Create Project
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
} 