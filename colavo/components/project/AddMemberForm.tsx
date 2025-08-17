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
        throw new Error('Failed to add member');
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
    } catch {
      toast.error('Failed to add member');
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
    <Card className="bg-background dark:bg-card border border-border/60 dark:border-border shadow-md">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-foreground dark:text-foreground flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Add Team Member
        </CardTitle>
        <CardDescription className="text-muted-foreground dark:text-muted-foreground">
          Invite a new member to join this project by their email, username, or user ID.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Type Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">
              Search by
            </Label>
            <Select
              value={formData.identifierType}
              onValueChange={(value) => {
                const typedValue = value as IdentifierType;
                setFormData(prev => ({ ...prev, identifierType: typedValue, identifier: '' }));
              }}
            >
              <SelectTrigger className="bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email Address</SelectItem>
                <SelectItem value="username">Username</SelectItem>
                <SelectItem value="id">User ID</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Identifier Input */}
          <div className="space-y-2">
            <Label htmlFor="identifier" className="text-sm font-medium text-foreground">
              {formData.identifierType === 'email' ? 'Email Address' : 
               formData.identifierType === 'username' ? 'Username' : 'User ID'}
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="identifier"
                type={inputProps.type}
                placeholder={getPlaceholderText()}
                value={formData.identifier}
                onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                className="pl-10 bg-background dark:bg-muted border-border dark:border-border focus:bg-background dark:focus:bg-card focus:border-primary dark:focus:border-secondary transition-colors"
                required
                disabled={isLoading}
                pattern={inputProps.pattern}
              />
            </div>
            {formData.identifierType === 'email' && (
              <p className="text-xs text-muted-foreground dark:text-muted-foreground">
                The user must have a Collavo account with this email address.
              </p>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading || !formData.identifier.trim()}
            className="w-full bg-primary hover:bg-[#006666] dark:bg-primary dark:hover:bg-[#006666] text-foreground shadow-md hover:shadow-lg transition-all duration-200"
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