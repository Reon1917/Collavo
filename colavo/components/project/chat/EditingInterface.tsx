'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';

interface EditingInterfaceProps {
  editContent: string;
  onContentChange: (content: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  isSubmitting: boolean;
  disabled?: boolean;
}

export function EditingInterface({
  editContent,
  onContentChange,
  onSubmit,
  onCancel,
  onKeyDown,
  isSubmitting,
  disabled = false
}: EditingInterfaceProps) {
  return (
    <div className="space-y-2 mb-1">
      <Input
        value={editContent}
        onChange={(e) => onContentChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Edit message..."
        disabled={isSubmitting || disabled}
        className="text-sm bg-background text-foreground border-border"
      />
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={onSubmit}
          disabled={isSubmitting || editContent.trim() === '' || disabled}
          className="h-7 px-3 text-xs bg-background text-foreground hover:bg-background/80 border border-border"
        >
          <Check className="h-3 w-3 mr-1" />
          Save
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting || disabled}
          className="h-7 px-3 text-xs bg-background text-foreground hover:bg-background/80 border border-border"
        >
          <X className="h-3 w-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}