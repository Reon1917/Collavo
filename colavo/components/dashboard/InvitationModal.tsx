"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Mail, Clock, CheckCircle, X, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PendingInvitation {
  id: string;
  token: string;
  projectId: string;
  projectName: string;
  inviterName: string;
  expiresAt: string;
  createdAt: string;
}

interface InvitationModalProps {
  onInvitationAccepted?: () => void;
}

export function InvitationModal({ onInvitationAccepted }: InvitationModalProps) {
  const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingInvitations, setProcessingInvitations] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);

  const fetchInvitations = async () => {
    try {
      const response = await fetch('/api/invitations/pending');
      if (!response.ok) {
        if (response.status === 401) return; // User not logged in
        throw new Error('Failed to fetch invitations');
      }
      
      const data = await response.json();
      setInvitations(data.invitations || []);
    } catch {
      // Silently fail - errors handled by UI state
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch invitations on component mount to show badge count immediately
  useEffect(() => {
    fetchInvitations();
  }, []);

  // Refresh when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchInvitations();
    }
  }, [isOpen]);

  // Refresh every 30 seconds when modal is open, and every 2 minutes when closed
  useEffect(() => {
    const interval = setInterval(fetchInvitations, isOpen ? 30000 : 120000);
    return () => clearInterval(interval);
  }, [isOpen]);

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
  };

  const handleAcceptInvitation = async (invitation: PendingInvitation) => {
    setProcessingInvitations(prev => new Set(prev).add(invitation.id));
    
    try {
      const response = await fetch('/api/accept-invitation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: invitation.token,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Successfully joined "${invitation.projectName}"!`);
        
        // Remove the accepted invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
        
        // Notify parent component
        onInvitationAccepted?.();
        
        // Close modal if no more invitations
        if (invitations.length === 1) {
          handleOpenChange(false);
        }
        
        // Optional: Redirect to the project after a delay
        setTimeout(() => {
          window.location.href = `/project/${invitation.projectId}`;
        }, 1500);
      } else {
        throw new Error(data.error || 'Failed to accept invitation');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation.id);
        return newSet;
      });
    }
  };

  const handleDeclineInvitation = async (invitation: PendingInvitation) => {
    setProcessingInvitations(prev => new Set(prev).add(invitation.id));
    
    try {
      const response = await fetch('/api/invitations/decline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: invitation.token,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(`Declined invitation to "${invitation.projectName}"`);
        
        // Remove the declined invitation from the list
        setInvitations(prev => prev.filter(inv => inv.id !== invitation.id));
        
        // Close modal if no more invitations
        if (invitations.length === 1) {
          handleOpenChange(false);
        }
      } else {
        throw new Error(data.error || 'Failed to decline invitation');
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
    } finally {
      setProcessingInvitations(prev => {
        const newSet = new Set(prev);
        newSet.delete(invitation.id);
        return newSet;
      });
    }
  };

  const invitationCount = invitations.length;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
          <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
          {invitationCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary hover:bg-primary text-primary-foreground border-white dark:border-gray-950"
            >
              {invitationCount > 9 ? '9+' : invitationCount}
            </Badge>
          )}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] max-h-[80vh] !top-[10%] !translate-y-0">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Mail className="h-5 w-5 text-primary" />
            <span>Project Invitations</span>
            {invitationCount > 0 && (
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                {invitationCount}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Manage your pending project invitations. You will also receive an email for each invitation.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : invitations.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                <Mail className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-2 text-foreground">No pending invitations</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                You&apos;ll see project invitations here when team leaders invite you to collaborate.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {invitations.map((invitation) => {
                const isExpiringSoon = new Date(invitation.expiresAt).getTime() - Date.now() < 6 * 60 * 60 * 1000; // 6 hours
                const isProcessing = processingInvitations.has(invitation.id);
                
                return (
                  <div key={invitation.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3 flex-1 min-w-0">
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full flex-shrink-0">
                          <UserPlus className="h-5 w-5 text-primary" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-foreground truncate">
                              {invitation.projectName}
                            </h3>
                            {isExpiringSoon && (
                              <Badge variant="destructive" className="text-xs flex-shrink-0">
                                <Clock className="h-3 w-3 mr-1" />
                                Soon
                              </Badge>
                            )}
                          </div>
                          
                          <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                            by <span className="font-medium">{invitation.inviterName}</span>
                          </p>
                          
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span>Expires {formatDistanceToNow(new Date(invitation.expiresAt))}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeclineInvitation(invitation)}
                          disabled={isProcessing}
                          className="text-gray-600 hover:text-red-600 hover:border-red-200 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          size="sm"
                          onClick={() => handleAcceptInvitation(invitation)}
                          disabled={isProcessing}
                          className="bg-primary hover:bg-primary/90 text-primary-foreground h-8"
                        >
                          {isProcessing ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
