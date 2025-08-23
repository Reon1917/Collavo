"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { UserPlus, Loader2, Mail, UserCheck, UserX, Users } from 'lucide-react';
import { toast } from 'sonner';
import { MAX_PROJECT_MEMBERS } from '@/types';

interface AddMemberFormProps {
  projectId: string;
  onMemberAdded?: () => void;
}

type IdentifierType = 'email' | 'username' | 'id';
type UserType = 'existing' | 'new';

interface AddMemberFormData {
  identifier: string;
  identifierType: IdentifierType;
  userType: UserType;
}

export function AddMemberForm({ projectId, onMemberAdded }: AddMemberFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [memberCount, setMemberCount] = useState<number>(0);
  const [isLoadingCount, setIsLoadingCount] = useState(true);
  const [formData, setFormData] = useState<AddMemberFormData>({
    identifier: '',
    identifierType: 'username',
    userType: 'existing'
  });

  // Fetch current member count
  const fetchMemberCount = async () => {
    try {
      setIsLoadingCount(true);
      const response = await fetch(`/api/projects/${projectId}/members`);
      if (response.ok) {
        const members = await response.json();
        setMemberCount(members.length);
      }
    } catch (error) {
      console.error('Failed to fetch member count:', error);
    } finally {
      setIsLoadingCount(false);
    }
  };

  useEffect(() => {
    fetchMemberCount();
  }, [projectId]);

  // Check if at member limit
  const isAtMemberLimit = memberCount >= MAX_PROJECT_MEMBERS;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.identifier.trim()) {
      toast.error('Please enter a valid identifier');
      return;
    }

    // Validation based on user type and identifier type
    if (formData.userType === 'new' && formData.identifierType !== 'email') {
      toast.error('Invalid selection', {
        description: 'New users can only be invited by email address. Please select "Email Address" or change to "Existing User".',
      });
      return;
    }

    if (formData.userType === 'existing' && formData.identifierType === 'email') {
      toast.error('Are you sure this user exists?', {
        description: 'You selected "Existing User" but are using an email. If they don\'t have a Collavo account yet, please select "New User" instead.',
        action: {
          label: 'Switch to New User',
          onClick: () => setFormData(prev => ({ ...prev, userType: 'new' })),
        },
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${projectId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          identifier: formData.identifier.trim(),
          identifierType: formData.identifierType,
          userType: formData.userType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server error (${response.status})`;
        
        // Provide specific error messages for common cases
        if (response.status === 409) {
          toast.error('Cannot send invitation', {
            description: errorMessage.includes('already a member') 
              ? 'This user is already a member of the project.'
              : errorMessage.includes('already sent')
              ? 'An invitation has already been sent to this email address.'
              : errorMessage,
          });
          return;
        } else if (response.status === 404) {
          if (formData.userType === 'existing') {
            toast.error('User not found', {
              description: 'No user found with this identifier. Please check the spelling or try selecting "New User" if they don\'t have an account yet.',
              action: {
                label: 'Switch to New User',
                onClick: () => setFormData(prev => ({ ...prev, userType: 'new', identifierType: 'email' })),
              },
            });
          } else {
            toast.error('System error', {
              description: 'Unexpected error occurred. Please try again.',
            });
          }
          return;
        } else if (response.status === 403) {
          toast.error('Permission denied', {
            description: 'You don&apos;t have permission to add members to this project.',
          });
          return;
        } else if (response.status === 400) {
          const description = errorMessage.includes('New users can only be invited by email') 
            ? 'New users can only be invited by email address. Please check your selection.'
            : errorMessage.includes('Cannot add yourself')
            ? 'You cannot add yourself as a member.'
            : errorMessage.includes('maximum limit')
            ? `This project has reached the maximum limit of ${MAX_PROJECT_MEMBERS} members. Please remove a member before adding a new one.`
            : errorMessage;
          
          toast.error('Cannot add member', {
            description,
          });
          
          // Refresh member count if limit error
          if (errorMessage.includes('maximum limit')) {
            await fetchMemberCount();
          }
          return;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Handle different response types with more specific feedback
      if (result.message) {
        if (formData.userType === 'new') {
          toast.success('🎉 Invitation sent to new user!', {
            description: `They'll receive a welcome email with signup instructions and project details. The invitation will appear in their inbox after they create their account.`,
          });
        } else {
          toast.success('📧 Invitation sent!', {
            description: `They'll receive an email notification and can accept the invitation from their dashboard inbox.`,
          });
        }
      } else if (result.userName) {
        // Existing user added directly
        toast.success(`Welcome ${result.userName} to the team! 🎉`, {
          description: `${result.userName} has been added to the project and can now start collaborating.`,
        });
      } else {
        toast.success('Member added successfully!');
      }
      
      // Reset form
      setFormData({
        identifier: '',
        identifierType: 'username',
        userType: 'existing'
      });

      // Refresh member count and trigger callback
      await fetchMemberCount();
      onMemberAdded?.();
    } catch (error) {
      // Handle network and other errors
      if (error instanceof Error) {
        toast.error('Failed to add member', {
          description: error.message || 'Please check your connection and try again.',
        });
      } else {
        toast.error('Failed to add member', {
          description: 'An unexpected error occurred. Please try again.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getPlaceholderText = () => {
    switch (formData.identifierType) {
      case 'email':
        return 'user@example.com';
      case 'username':
        return 'username';
      case 'id':
        return 'User ID';
      default:
        return 'Enter identifier';
    }
  };

  // Input validation logic removed as it was unused



  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Add Team Member
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-4 w-4" />
            {isLoadingCount ? (
              <span className="text-gray-500">Loading...</span>
            ) : (
              <span className={memberCount >= MAX_PROJECT_MEMBERS ? "text-red-500" : "text-gray-600 dark:text-gray-400"}>
                {memberCount}/{MAX_PROJECT_MEMBERS}
              </span>
            )}
          </div>
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {isAtMemberLimit ? (
            <span className="text-red-500 font-medium">
              This project has reached the maximum limit of {MAX_PROJECT_MEMBERS} members. Remove a member to add a new one.
            </span>
          ) : (
            "Invite a new member to join this project by their email, username, or user ID."
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {isAtMemberLimit && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
                <Users className="h-4 w-4" />
                <span className="font-medium">Member limit reached</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                Remove an existing member before adding a new one.
              </p>
            </div>
          )}
          {/* User Type Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Are you inviting an existing Collavo user or someone new?
            </Label>
            <RadioGroup
              value={formData.userType}
              onValueChange={(value) => {
                const typedValue = value as UserType;
                setFormData(prev => ({ 
                  ...prev, 
                  userType: typedValue,
                  // Reset identifier type: email for new users, username for existing users
                  identifierType: typedValue === 'new' ? 'email' : 'username',
                  identifier: '' // Reset identifier when switching types
                }));
              }}
              className="grid grid-cols-1 gap-3"
              disabled={isAtMemberLimit}
            >
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <RadioGroupItem value="existing" id="existing" disabled={isAtMemberLimit} />
                <Label htmlFor="existing" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <UserCheck className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">Existing User</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">They already have a Collavo account</div>
                  </div>
                </Label>
              </div>
              <div className="flex items-center space-x-2 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <RadioGroupItem value="new" id="new" disabled={isAtMemberLimit} />
                <Label htmlFor="new" className="flex items-center space-x-2 cursor-pointer flex-1">
                  <UserX className="h-4 w-4 text-primary" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">New User</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">They need to create a Collavo account first</div>
                  </div>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Identifier Type Selection - Only show for existing users */}
          {formData.userType === 'existing' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Search by
              </Label>
              <Select
                value={formData.identifierType}
                onValueChange={(value) => {
                  const typedValue = value as IdentifierType;
                  setFormData(prev => ({ ...prev, identifierType: typedValue, identifier: '' }));
                }}
                disabled={isAtMemberLimit}
              >
                <SelectTrigger className="bg-background border-border focus:bg-card focus:border-primary">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="username">Username</SelectItem>
                  <SelectItem value="id">User ID</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Identifier Input */}
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formData.userType === 'new' ? 'Email Address' :
               formData.identifierType === 'username' ? 'Username' : 'User ID'}
            </Label>
            <div className="relative">
              {formData.userType === 'new' ? (
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              ) : (
                <UserCheck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              )}
              <Input
                id="identifier"
                type={formData.userType === 'new' ? 'email' : 'text'}
                placeholder={formData.userType === 'new' ? 'user@example.com' : getPlaceholderText()}
                value={formData.identifier}
                onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                className="pl-10 bg-background border-border focus:bg-card focus:border-primary transition-colors"
                required
                disabled={isLoading || isAtMemberLimit}
              />
            </div>
            {formData.userType === 'new' ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                They&apos;ll receive a welcome email with signup instructions and project details.
              </p>
            ) : (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                They must have an existing Collavo account.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.identifier.trim() || isAtMemberLimit}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Adding Member...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Add Member
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 