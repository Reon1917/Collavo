"use client"

import { useState } from "react"
import { Check, X } from "lucide-react"
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

interface Permissions {
  viewTasks: boolean
  createTasks: boolean
  assignTasks: boolean
  editProjectDetails: boolean
  inviteMembers: boolean
  deleteProject: boolean
}

interface PermissionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave?: (memberId: string, permissions: Permissions, role: string) => void
  member: {
    id: string
    name: string
    role: string
    avatar: string
  }
}

export function PermissionModal({ isOpen, onClose, onSave, member }: PermissionModalProps) {
  const [permissions, setPermissions] = useState({
    viewTasks: true,
    createTasks: true,
    assignTasks: member.role !== 'viewer',
    editProjectDetails: member.role === 'leader',
    inviteMembers: member.role === 'leader',
    deleteProject: false,
  })

  const handlePermissionChange = (permission: keyof typeof permissions, checked: boolean) => {
    setPermissions((prev) => ({
      ...prev,
      [permission]: checked,
    }))
  }

  const [selectedRole, setSelectedRole] = useState(member.role)

  const handleSave = () => {
    // TODO: Replace with actual API call to save permissions
    // await updateMemberPermissions(member.id, permissions, selectedRole);
    
    if (onSave) {
      onSave(member.id, permissions, selectedRole);
    }
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold">
              {member.avatar}
            </div>
            <span>Permissions for {member.name}</span>
          </DialogTitle>
          <DialogDescription>Configure what this team member can access and modify in the project.</DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-2">
          {/* Role Selection */}
          <div className="mb-4">
            <Label htmlFor="role" className="block mb-2 font-medium">
              Member Role
            </Label>
            <div className="grid grid-cols-3 gap-2">
              <Button
                type="button"
                variant={selectedRole === 'viewer' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('viewer')}
                className="justify-center"
              >
                Viewer
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'member' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('member')}
                className="justify-center"
              >
                Member
              </Button>
              <Button
                type="button"
                variant={selectedRole === 'leader' ? 'default' : 'outline'}
                onClick={() => setSelectedRole('leader')}
                className="justify-center"
              >
                Leader
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="viewTasks" className="font-medium">
                  View Tasks
                </Label>
                <p className="text-sm text-muted-foreground">Allow member to view project tasks</p>
              </div>
              <Switch
                id="viewTasks"
                checked={permissions.viewTasks}
                onCheckedChange={(checked) => handlePermissionChange("viewTasks", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="createTasks" className="font-medium">
                  Create Tasks
                </Label>
                <p className="text-sm text-muted-foreground">Allow member to create new tasks in the project</p>
              </div>
              <Switch
                id="createTasks"
                checked={permissions.createTasks}
                onCheckedChange={(checked) => handlePermissionChange("createTasks", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="assignTasks" className="font-medium">
                  Assign Tasks
                </Label>
                <p className="text-sm text-muted-foreground">Allow member to assign tasks to other team members</p>
              </div>
              <Switch
                id="assignTasks"
                checked={permissions.assignTasks}
                onCheckedChange={(checked) => handlePermissionChange("assignTasks", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="editProjectDetails" className="font-medium">
                  Edit Project Details
                </Label>
                <p className="text-sm text-muted-foreground">Allow member to modify project information and settings</p>
              </div>
              <Switch
                id="editProjectDetails"
                checked={permissions.editProjectDetails}
                onCheckedChange={(checked) => handlePermissionChange("editProjectDetails", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="inviteMembers" className="font-medium">
                  Invite Members
                </Label>
                <p className="text-sm text-muted-foreground">Allow member to invite new people to the project</p>
              </div>
              <Switch
                id="inviteMembers"
                checked={permissions.inviteMembers}
                onCheckedChange={(checked) => handlePermissionChange("inviteMembers", checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="deleteProject" className="font-medium text-red-600">
                  Delete Project
                </Label>
                <p className="text-sm text-muted-foreground">Allow member to delete this project (use with caution)</p>
              </div>
              <Switch
                id="deleteProject"
                checked={permissions.deleteProject}
                onCheckedChange={(checked) => handlePermissionChange("deleteProject", checked)}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="flex justify-between sm:justify-between">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Check className="mr-2 h-4 w-4" />
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
