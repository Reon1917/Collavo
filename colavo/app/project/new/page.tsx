'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, X } from 'lucide-react';
import Link from 'next/link';
import { getUsers } from '@/lib/data';
import { User } from '@/types';

export default function NewProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedMembers, setSelectedMembers] = useState<User[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [error, setError] = useState('');

  // Fetch users when component mounts
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersData = await getUsers();
        setUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  const handleAddMember = () => {
    setError('');
    
    if (selectedMembers.length >= 5) {
      setError('Maximum 5 members can be added to a project.');
      return;
    }

    const user = users.find(u => u.email.toLowerCase() === emailInput.toLowerCase());
    
    if (!user) {
      setError('User not found. Please enter a valid email address.');
      return;
    }

    if (selectedMembers.some(member => member.id === user.id)) {
      setError('User is already added to the project.');
      return;
    }

    setSelectedMembers(prev => [...prev, user]);
    setEmailInput('');
  };

  const removeMember = (userId: string) => {
    setSelectedMembers(prev => prev.filter(member => member.id !== userId));
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name'),
      description: formData.get('description'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate'),
      members: selectedMembers.map(member => member.id),
    };

    try {
      // TODO: Replace with actual API call
      console.log('Creating project with data:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to dashboard after successful creation
      router.push('/dashboard');
    } catch (error) {
      console.error('Failed to create project:', error);
      // TODO: Show error message to user
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
          </Button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <h1 className="text-3xl font-bold mb-6">Create New Project</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Project Name
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Enter project name"
                required
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe your project"
                rows={4}
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <Input
                id="startDate"
                name="startDate"
                type="date"
                required
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date (Optional)
              </label>
              <Input
                id="endDate"
                name="endDate"
                type="date"
                className="w-full"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Team Members (up to 5)
              </label>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="email"
                    placeholder="Enter email address"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="flex-1"
                    disabled={isSubmitting || selectedMembers.length >= 5}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddMember();
                      }
                    }}
                  />
                  <Button 
                    type="button"
                    onClick={handleAddMember}
                    disabled={isSubmitting || selectedMembers.length >= 5}
                  >
                    Add
                  </Button>
                </div>
                {error && (
                  <p className="text-sm text-red-600">{error}</p>
                )}
                {selectedMembers.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">
                        Selected Members ({selectedMembers.length}/5)
                      </h4>
                      {selectedMembers.length > 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedMembers([])}
                          className="text-sm text-red-600 hover:text-red-700"
                        >
                          Clear All
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      {selectedMembers.map(member => (
                        <div
                          key={member.id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                              {member.name.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeMember(member.id)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button variant="outline" asChild disabled={isSubmitting}>
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Creating...' : 'Create Project'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 