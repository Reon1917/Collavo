"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Loader2, Search } from 'lucide-react';
import { toast } from 'sonner';

interface AddMemberFormProps {
  projectId: string;
  onMemberAdded?: () => void;
}

type IdentifierType = 'email' | 'username' | 'id';

interface AddMemberFormData {
  identifier: string;
  identifierType: IdentifierType;
}

export function AddMemberForm({ projectId, onMemberAdded }: AddMemberFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AddMemberFormData>({
    identifier: '',
    identifierType: 'email'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.identifier.trim()) {
      toast.error('Please enter a valid identifier');
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
          identifierType: formData.identifierType
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to add member');
      }

      const member = await response.json();
      toast.success(`Successfully added ${member.userName} to the project!`);
      
      // Reset form
      setFormData({
        identifier: '',
        identifierType: 'email'
      });

      // Trigger refresh callback
      onMemberAdded?.();
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to add member');
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

  const getInputValidation = () => {
    switch (formData.identifierType) {
      case 'email':
        return {
          type: 'email' as const,
          pattern: undefined
        };
      case 'username':
        return {
          type: 'text' as const,
          pattern: undefined
        };
      case 'id':
        return {
          type: 'text' as const,
          pattern: undefined
        };
      default:
        return {
          type: 'text' as const,
          pattern: undefined
        };
    }
  };

  const inputProps = getInputValidation();

  return (
    <Card className="bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-[#008080]" />
          Add Team Member
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Invite a new member to join this project by their email, username, or user ID.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Search by
            </Label>
            <Select
              value={formData.identifierType}
              onValueChange={(value: IdentifierType) => 
                setFormData(prev => ({ ...prev, identifierType: value, identifier: '' }))
              }
              disabled={isLoading}
            >
              <SelectTrigger className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <SelectItem value="email">Email Address</SelectItem>
                <SelectItem value="username">Username</SelectItem>
                <SelectItem value="id">User ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Identifier Input */}
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {formData.identifierType === 'email' ? 'Email Address' : 
               formData.identifierType === 'username' ? 'Username' : 'User ID'}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="identifier"
                type={inputProps.type}
                placeholder={getPlaceholderText()}
                value={formData.identifier}
                onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                className="pl-10 bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] transition-colors"
                required
                disabled={isLoading}
                pattern={inputProps.pattern}
              />
            </div>
            {formData.identifierType === 'email' && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                The user must have a Collavo account with this email address.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.identifier.trim()}
            className="w-full bg-[#008080] hover:bg-[#006666] dark:bg-[#008080] dark:hover:bg-[#006666] text-white shadow-md hover:shadow-lg transition-all duration-200"
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