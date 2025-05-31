"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, Loader2, PlusCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface CreateProjectFormData {
  name: string;
  description: string;
  deadline: Date | undefined;
}

export function CreateProjectForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateProjectFormData>({
    name: '',
    description: '',
    deadline: undefined
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          deadline: formData.deadline ? formData.deadline.toISOString() : null
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      const project = await response.json();
      toast.success('Project created successfully!');
      router.push(`/project/${project.id}`);
    } catch {
      toast.error('Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof CreateProjectFormData, value: string | Date | undefined) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white dark:bg-gray-900 border border-gray-200/60 dark:border-gray-700 shadow-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <PlusCircle className="h-6 w-6 text-[#008080]" />
          Create New Project
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          Start a new project and begin collaborating with your team.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project Name */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Project Name *
            </Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter project name..."
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] transition-colors"
              maxLength={255}
              required
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formData.name.length}/255 characters
            </p>
          </div>

          {/* Project Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe your project goals, scope, and objectives..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 focus:bg-white dark:focus:bg-gray-900 focus:border-[#008080] dark:focus:border-[#00FFFF] transition-colors min-h-[100px] resize-none"
              disabled={isLoading}
            />
          </div>

          {/* Project Deadline */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Deadline (Optional)
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-[#f9f8f0] dark:bg-gray-800 border-[#e5e4dd] dark:border-gray-700 hover:bg-white dark:hover:bg-gray-900 hover:border-[#008080] dark:hover:border-[#00FFFF]",
                    !formData.deadline && "text-gray-500 dark:text-gray-400"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.deadline ? format(formData.deadline, "PPP") : "Select deadline"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <Calendar
                  mode="single"
                  selected={formData.deadline}
                  onSelect={(date) => handleInputChange('deadline', date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
              className="flex-1 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 bg-[#008080] hover:bg-[#006666] dark:bg-[#008080] dark:hover:bg-[#006666] text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Create Project
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 