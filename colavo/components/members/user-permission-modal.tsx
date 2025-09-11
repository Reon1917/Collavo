"use client"

import { useState, useEffect, useCallback } from "react"
import { Check, X, Loader2, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"

// Define the 8 permissions as per requirements
interface ProjectPermissions {
  addMember: boolean        // Add new members to the project and remove members
  createTask: boolean       // Create tasks (main tasks and sub tasks)
  handleTask: boolean       // Manage Tasks - Edit/Deleting task details
  updateTask: boolean       // Updating sub-task's status and add/edit notes
  createEvent: boolean      // Creating new event
  handleEvent: boolean      // Manage Events & Notifications - Edit/delete event details, set up email notifications
  handleFile: boolean       // Manage Files - Add/delete files and links
  viewFiles: boolean        // View files/links
}

interface Member {
  id: string
  userId: string
  userName: string
  userEmail: string
  userImage?: string
  role: string
  permissions: string[]
}

interface PermissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (memberId: string, permissions: ProjectPermissions) => void
  member: Member
  projectId: string
}



// Default permissions based on role and requirements
const getDefaultPermissions = (member: Member): ProjectPermissions => {
  if (member.role === 'leader') {
    // Leaders have all permissions by default
    return {
      addMember: true,
      createTask: true,
      handleTask: true,
      updateTask: true,
      createEvent: true,
      handleEvent: true,
      handleFile: true,
      viewFiles: true,
    }
  }
  
  // Members have limited permissions by default
  return {
    addMember: false,      // Leader only by default
    createTask: false,     // Leader only by default
    handleTask: false,     // Leader only by default
    updateTask: member.permissions.includes('updateTask'), // Leader + assigned member by default
    createEvent: false,    // Leader only by default
    handleEvent: false,    // Leader only by default
    handleFile: member.permissions.includes('handleFile'), // All members by default
    viewFiles: member.permissions.includes('viewFiles'),   // All members by default
  }
}

export function PermissionModal({ isOpen, onClose, onSave, member, projectId }: PermissionModalProps) {
  // Helper function to get current member permissions
  const getCurrentPermissions = useCallback((): ProjectPermissions => {
    const defaultPerms = getDefaultPermissions(member)
    const currentPerms = { ...defaultPerms }
    
    // Override with actual permissions from member data
    if (member.permissions.includes('addMember')) currentPerms.addMember = true
    if (member.permissions.includes('createTask')) currentPerms.createTask = true
    if (member.permissions.includes('handleTask')) currentPerms.handleTask = true
    if (member.permissions.includes('updateTask')) currentPerms.updateTask = true
    if (member.permissions.includes('createEvent')) currentPerms.createEvent = true
    if (member.permissions.includes('handleEvent')) currentPerms.handleEvent = true
    if (member.permissions.includes('handleFile')) currentPerms.handleFile = true
    if (member.permissions.includes('viewFiles')) currentPerms.viewFiles = true
    
    return currentPerms
  }, [member])

  const [permissions, setPermissions] = useState<ProjectPermissions>(getCurrentPermissions())
  const [isSaving, setIsSaving] = useState(false)

  // Reset permissions when modal opens or member changes
  useEffect(() => {
    if (isOpen) {
      setPermissions(getCurrentPermissions())
    }
  }, [isOpen, getCurrentPermissions])

  const handlePermissionChange = (permission: keyof ProjectPermissions, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: checked,
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    
    try {
      const response = await fetch(`/api/projects/${projectId}/members/${member.id}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          permissions,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to update permissions')
        return
      }

      // Permission update successful
      toast.success('Permissions updated successfully')
      
      if (onSave) {
        onSave(member.id, permissions)
      }
      
      onClose()
    } catch {
      toast.error('Failed to update permissions')
    } finally {
      setIsSaving(false)
    }
  }

  // Don't show modal for leaders
  if (member.role === 'leader') {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md sm:max-w-lg max-h-[80vh] bg-card border border-border flex flex-col p-0">
        <DialogHeader className="px-6 pt-6">
          <DialogTitle className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-primary" aria-hidden="true" />
            <Avatar className="h-10 w-10">
              <AvatarImage src={member.userImage} alt={member.userName} />
              <AvatarFallback className="bg-primary text-primary-foreground">
                {member.userName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <span className="text-foreground font-bold">Permissions for {member.userName}</span>
              <p className="text-sm text-muted-foreground font-normal">
                {member.userEmail}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure what this team member can access and modify in the project.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-6 pb-2">
          <div className="bg-muted/50 p-4 rounded-xl shadow-sm transition-all duration-200">
            {/* Members Section */}
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wider">Members</h4>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="addMember" className="font-medium text-foreground">Manage Members</Label>
                <p className="text-sm text-muted-foreground">Add new members to the project and remove members</p>
              </div>
              <Switch
                id="addMember"
                checked={permissions.addMember}
                onCheckedChange={(checked) => handlePermissionChange("addMember", checked)}
                aria-label="Toggle manage members permission"
                className="focus-visible:ring-2 transition-all duration-200 data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-400"
              />
            </div>
            <Separator className="my-2" />
            {/* Tasks Section */}
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wider">Tasks</h4>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="createTask" className="font-medium text-foreground">Create Tasks</Label>
                <p className="text-sm text-muted-foreground">Create main tasks and sub tasks</p>
              </div>
              <Switch
                id="createTask"
                checked={permissions.createTask}
                onCheckedChange={(checked) => handlePermissionChange("createTask", checked)}
                aria-label="Toggle create tasks permission"
                className="focus-visible:ring-2 transition-all duration-200 data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-400"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="handleTask" className="font-medium text-foreground">Manage Tasks</Label>
                <p className="text-sm text-muted-foreground">Edit and delete task details like deadline or assigned member</p>
              </div>
              <Switch
                id="handleTask"
                checked={permissions.handleTask}
                onCheckedChange={(checked) => handlePermissionChange("handleTask", checked)}
                aria-label="Toggle manage tasks permission"
                className="focus-visible:ring-2 transition-all duration-200 data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-400"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="updateTask" className="font-medium text-foreground">Update Sub-tasks</Label>
                <p className="text-sm text-muted-foreground">Update sub-task status and add/edit short notes</p>
              </div>
              <Switch
                id="updateTask"
                checked={permissions.updateTask}
                onCheckedChange={(checked) => handlePermissionChange("updateTask", checked)}
                aria-label="Toggle update sub-tasks permission"
                className="focus-visible:ring-2 transition-all duration-200 data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-400"
              />
            </div>
            <Separator className="my-2" />
            {/* Events Section */}
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wider">Events</h4>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="createEvent" className="font-medium text-foreground">Create Events</Label>
                <p className="text-sm text-muted-foreground">Create new events with title, description, date, time, and location</p>
              </div>
              <Switch
                id="createEvent"
                checked={permissions.createEvent}
                onCheckedChange={(checked) => handlePermissionChange("createEvent", checked)}
                aria-label="Toggle create events permission"
                className="focus-visible:ring-2 transition-all duration-200 data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-400"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="handleEvent" className="font-medium text-foreground">Manage Events & Notifications</Label>
                <p className="text-sm text-muted-foreground">Edit and delete event details, set up email notifications for team members</p>
              </div>
              <Switch
                id="handleEvent"
                checked={permissions.handleEvent}
                onCheckedChange={(checked) => handlePermissionChange("handleEvent", checked)}
                aria-label="Toggle manage events permission"
                className="focus-visible:ring-2 transition-all duration-200 data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-400"
              />
            </div>
            <Separator className="my-2" />
            {/* Files Section */}
            <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2 tracking-wider">Files</h4>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="handleFile" className="font-medium text-foreground">Manage Files</Label>
                <p className="text-sm text-muted-foreground">Add and delete files and links</p>
              </div>
              <Switch
                id="handleFile"
                checked={permissions.handleFile}
                onCheckedChange={(checked) => handlePermissionChange("handleFile", checked)}
                aria-label="Toggle manage files permission"
                className="focus-visible:ring-2 transition-all duration-200 data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-400"
              />
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <Label htmlFor="viewFiles" className="font-medium text-foreground">View Files</Label>
                <p className="text-sm text-muted-foreground">View and download files and links</p>
              </div>
              <Switch
                id="viewFiles"
                checked={permissions.viewFiles}
                onCheckedChange={(checked) => handlePermissionChange("viewFiles", checked)}
                aria-label="Toggle view files permission"
                className="focus-visible:ring-2 transition-all duration-200 data-[state=checked]:bg-green-600 dark:data-[state=checked]:bg-green-400"
              />
            </div>
          </div>
        </div>
        {/* Sticky footer for actions */}
        <div className="bg-card border-t border-border px-6 pb-4 pt-3 shadow-lg">
          <DialogFooter className="flex gap-3 sm:justify-between">
            <Button variant="outline" onClick={onClose} disabled={isSaving} className="flex-1 focus-visible:ring-2 transition-all duration-200" aria-label="Cancel">
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground focus-visible:ring-2 transition-all duration-200" aria-label="Save Permissions">
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Check className="mr-2 h-4 w-4" />
              Save Permissions
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
