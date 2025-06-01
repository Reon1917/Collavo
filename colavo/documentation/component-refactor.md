# Component Refactoring Plan

## Overview

This document outlines the refactoring plan to break down three massive component files (ProjectView.tsx: 884 lines, SubTaskDetailsDialog.tsx: 707 lines, TasksView.tsx: 936 lines) into maintainable, modular components of ~200 lines each.

## Core Problems Identified

- ❌ Monolithic components with multiple responsibilities
- ❌ Complex conditional rendering mixed with business logic
- ❌ State management scattered throughout components
- ❌ Difficult to test and maintain
- ❌ Poor reusability and code duplication

## Strategic Approach

### Principles
1. **Single Responsibility**: Each component has ONE clear purpose
2. **Separation of Concerns**: UI, business logic, and data fetching are separate
3. **Colocation**: Related code lives together
4. **Discoverability**: Intuitive file organization
5. **Performance**: Optimized rendering with React.memo and hooks

## Detailed File Structure

```
components/
├── project/
│   ├── ProjectView/
│   │   ├── index.tsx                    (40 lines) - Main export
│   │   ├── ProjectView.tsx              (80 lines) - Main orchestrator
│   │   ├── types.ts                     (40 lines) - All interfaces
│   │   ├── hooks.ts                     (60 lines) - Data fetching logic
│   │   └── components/
│   │       ├── Header/
│   │       │   ├── index.tsx           (40 lines) - Export
│   │       │   ├── Header.tsx          (90 lines) - Header component
│   │       │   ├── Stats.tsx           (60 lines) - Stats cards
│   │       │   └── RoleBadge.tsx       (40 lines) - Role display
│   │       ├── Tabs/
│   │       │   ├── index.tsx           (40 lines) - Export
│   │       │   ├── Tabs.tsx            (70 lines) - Tab container
│   │       │   ├── OverviewTab.tsx     (120 lines) - Overview content
│   │       │   ├── TasksTab.tsx        (80 lines) - Tasks wrapper
│   │       │   └── MembersTab.tsx      (100 lines) - Members content
│   │       ├── Management/
│   │       │   ├── index.tsx           (40 lines) - Export
│   │       │   ├── Management.tsx      (90 lines) - Management panel
│   │       │   ├── QuickActions.tsx    (80 lines) - Action buttons
│   │       │   └── Settings.tsx        (70 lines) - Settings section
│   │       └── dialogs/
│   │           ├── EditProject/
│   │           │   ├── index.tsx       (40 lines) - Export
│   │           │   ├── EditDialog.tsx  (120 lines) - Dialog component
│   │           │   ├── EditForm.tsx    (100 lines) - Form logic
│   │           │   └── validation.ts   (30 lines) - Form validation
│   │           └── DeleteProject/
│   │               ├── index.tsx       (40 lines) - Export
│   │               ├── DeleteDialog.tsx (60 lines) - Delete confirmation
│   │               └── useDelete.ts    (40 lines) - Delete logic
│   │
│   ├── TasksView/
│   │   ├── index.tsx                    (40 lines) - Main export
│   │   ├── TasksView.tsx                (100 lines) - Main orchestrator
│   │   ├── types.ts                     (50 lines) - All interfaces
│   │   └── components/
│   │       ├── Header/
│   │       │   ├── index.tsx           (40 lines) - Export
│   │       │   ├── Header.tsx          (70 lines) - Header with title
│   │       │   ├── Filters.tsx         (120 lines) - All filters
│   │       │   └── CreateButton.tsx    (40 lines) - Create button
│   │       ├── TaskCard/
│   │       │   ├── index.tsx           (40 lines) - Export
│   │       │   ├── TaskCard.tsx        (150 lines) - Main task card
│   │       │   ├── Header.tsx          (80 lines) - Card header
│   │       │   ├── Progress.tsx        (60 lines) - Progress bar
│   │       │   ├── Actions.tsx         (70 lines) - Action dropdown
│   │       │   └── SubTasks.tsx        (100 lines) - Subtasks preview
│   │       ├── SubTaskItem/
│   │       │   ├── index.tsx           (40 lines) - Export
│   │       │   ├── SubTaskItem.tsx     (90 lines) - Subtask item
│   │       │   ├── Badge.tsx           (40 lines) - Status badge
│   │       │   └── Meta.tsx            (50 lines) - Metadata display
│   │       ├── TasksList/
│   │       │   ├── index.tsx           (40 lines) - Export
│   │       │   ├── TasksList.tsx       (80 lines) - List container
│   │       │   └── EmptyState.tsx      (60 lines) - No tasks state
│   │       └── dialogs/
│   │           ├── EditTask/
│   │           │   ├── index.tsx       (40 lines) - Export
│   │           │   ├── EditDialog.tsx  (100 lines) - Edit dialog
│   │           │   └── EditForm.tsx    (120 lines) - Form component
│   │           └── DeleteConfirm/
│   │               ├── index.tsx       (40 lines) - Export
│   │               └── DeleteDialog.tsx (60 lines) - Delete confirmation
│   │
│   ├── dialogs/
│   │   └── SubTaskDetails/
│   │       ├── index.tsx                (40 lines) - Main export
│   │       ├── SubTaskDetailsDialog.tsx (80 lines) - Main dialog orchestrator
│   │       ├── types.ts                 (40 lines) - Dialog interfaces
│   │       └── components/
│   │           ├── Header/
│   │           │   ├── index.tsx       (40 lines) - Export
│   │           │   ├── Header.tsx      (60 lines) - Dialog header
│   │           │   └── ModeIndicator.tsx (30 lines) - Mode badge
│   │           ├── ViewMode/
│   │           │   ├── index.tsx       (40 lines) - Export
│   │           │   ├── ViewMode.tsx    (100 lines) - View mode container
│   │           │   ├── Info.tsx        (90 lines) - Info display
│   │           │   ├── Meta.tsx        (70 lines) - Metadata grid
│   │           │   └── Notes.tsx       (60 lines) - Notes display
│   │           ├── EditModes/
│   │           │   ├── index.tsx       (40 lines) - Export
│   │           │   ├── StatusEdit.tsx  (120 lines) - Status form
│   │           │   ├── DetailsEdit.tsx (150 lines) - Details form
│   │           │   └── shared/
│   │           │       ├── FormField.tsx (40 lines) - Reusable field
│   │           │       └── FormActions.tsx (50 lines) - Form buttons
│   │           └── Actions/
│   │               ├── index.tsx       (40 lines) - Export
│   │               ├── ViewActions.tsx (70 lines) - View mode actions
│   │               └── EditActions.tsx (60 lines) - Edit mode actions
│   │
│   └── shared/
│       ├── forms/
│       │   ├── CreateTask/
│       │   │   ├── index.tsx           (40 lines) - Export
│       │   │   ├── CreateTaskForm.tsx  (120 lines) - Create task dialog
│       │   │   ├── TaskForm.tsx        (100 lines) - Form component
│       │   │   └── validation.ts       (40 lines) - Validation rules
│       │   ├── CreateSubTask/
│       │   │   ├── index.tsx           (40 lines) - Export
│       │   │   ├── CreateSubTaskForm.tsx (110 lines) - Create subtask dialog
│       │   │   ├── SubTaskForm.tsx     (90 lines) - Form component
│       │   │   └── validation.ts       (30 lines) - Validation rules
│       │   └── AddMember/
│       │       ├── index.tsx           (40 lines) - Export
│       │       ├── AddMemberForm.tsx   (80 lines) - Add member form
│       │       └── MemberSearch.tsx    (70 lines) - Member search
│       ├── ui/
│       │   ├── ConfirmationDialog/
│       │   │   ├── index.tsx           (40 lines) - Export
│       │   │   └── ConfirmationDialog.tsx (80 lines) - Reusable confirm dialog
│       │   ├── StatusBadge/
│       │   │   ├── index.tsx           (40 lines) - Export
│       │   │   └── StatusBadge.tsx     (50 lines) - Status badge component
│       │   ├── ImportanceBadge/
│       │   │   ├── index.tsx           (40 lines) - Export
│       │   │   └── ImportanceBadge.tsx (40 lines) - Importance badge
│       │   └── ProgressBar/
│       │       ├── index.tsx           (40 lines) - Export
│       │       └── ProgressBar.tsx     (60 lines) - Enhanced progress bar
│       └── utils/
│           ├── permissions.ts          (80 lines) - Permission utilities
│           ├── dateHelpers.ts          (40 lines) - Date formatting
│           ├── taskHelpers.ts          (60 lines) - Task utilities
│           └── validation.ts           (50 lines) - Common validations
│
├── hooks/
│   ├── project/
│   │   ├── useProjectData.ts           (120 lines) - Project data fetching
│   │   ├── useProjectPermissions.ts    (80 lines) - Permission logic
│   │   ├── useProjectActions.ts        (100 lines) - Project CRUD operations
│   │   └── useProjectCache.ts          (60 lines) - Caching logic
│   ├── tasks/
│   │   ├── useTasksData.ts             (150 lines) - Tasks data fetching
│   │   ├── useTaskFilters.ts           (100 lines) - Filter logic
│   │   ├── useTaskActions.ts           (120 lines) - Task CRUD operations
│   │   └── useTaskOptimistic.ts        (80 lines) - Optimistic updates
│   ├── subtasks/
│   │   ├── useSubTaskData.ts           (80 lines) - Subtask data
│   │   ├── useSubTaskForms.ts          (120 lines) - Form state management
│   │   └── useSubTaskActions.ts        (100 lines) - Subtask operations
│   └── shared/
│       ├── useApiCache.ts              (100 lines) - Generic API cache
│       ├── useOptimisticUpdates.ts     (80 lines) - Optimistic update pattern
│       └── useDebounce.ts              (30 lines) - Debounce hook
│
└── types/
    ├── project.ts                      (60 lines) - Project related types
    ├── tasks.ts                        (50 lines) - Task related types
    ├── members.ts                      (30 lines) - Member types
    └── api.ts                          (40 lines) - API response types
```

## Implementation Phases

### Phase 1: Foundation Setup (Week 1)

#### Setup Tasks
- [ ] Create complete folder structure as outlined above
- [ ] Create all index.tsx files with proper exports
- [ ] Set up barrel exports at each level
- [ ] Update tsconfig.json paths if needed
- [ ] Create types directory with base interfaces

#### File Structure Tasks
- [ ] Create `components/project/ProjectView/` directory
- [ ] Create `components/project/TasksView/` directory  
- [ ] Create `components/project/dialogs/SubTaskDetails/` directory
- [ ] Create `components/project/shared/` directory
- [ ] Create `hooks/` directory with subdirectories
- [ ] Create `types/` directory

#### Export Setup
- [ ] Setup `components/project/index.tsx` barrel export
- [ ] Setup `components/index.tsx` main barrel export
- [ ] Setup `hooks/index.tsx` barrel export
- [ ] Setup `types/index.tsx` barrel export

### Phase 2: Extract Custom Hooks (Week 2)

#### Project Hooks
- [ ] Extract `useProjectData.ts` from ProjectView.tsx
  - [ ] Move project fetching logic
  - [ ] Move project state management
  - [ ] Add error handling and loading states
  - [ ] Add TypeScript interfaces

- [ ] Extract `useProjectPermissions.ts` from ProjectView.tsx  
  - [ ] Move permission checking logic
  - [ ] Move role-based access control
  - [ ] Add permission utility functions

- [ ] Extract `useProjectActions.ts` from ProjectView.tsx
  - [ ] Move edit project functionality
  - [ ] Move delete project functionality
  - [ ] Add optimistic updates

#### Task Hooks
- [ ] Extract `useTasksData.ts` from TasksView.tsx
  - [ ] Move task fetching logic
  - [ ] Move cache management
  - [ ] Add request deduplication
  - [ ] Add error handling

- [ ] Extract `useTaskFilters.ts` from TasksView.tsx
  - [ ] Move search functionality
  - [ ] Move filter logic
  - [ ] Move sorting logic
  - [ ] Add debounced search

- [ ] Extract `useTaskActions.ts` from TasksView.tsx
  - [ ] Move task CRUD operations
  - [ ] Add optimistic updates
  - [ ] Add error recovery

#### SubTask Hooks
- [ ] Extract `useSubTaskForms.ts` from SubTaskDetailsDialog.tsx
  - [ ] Move form state management
  - [ ] Move validation logic
  - [ ] Add form reset functionality

- [ ] Extract `useSubTaskActions.ts` from SubTaskDetailsDialog.tsx
  - [ ] Move subtask CRUD operations
  - [ ] Add optimistic updates
  - [ ] Add error handling

#### Shared Hooks
- [ ] Create `useApiCache.ts`
  - [ ] Implement generic caching logic
  - [ ] Add cache invalidation
  - [ ] Add TTL support

- [ ] Create `useOptimisticUpdates.ts`
  - [ ] Implement optimistic update pattern
  - [ ] Add rollback functionality
  - [ ] Add conflict resolution

### Phase 3: Extract Types (Week 2)

#### Type Definition Tasks
- [ ] Extract project types to `types/project.ts`
- [ ] Extract task types to `types/tasks.ts`
- [ ] Extract member types to `types/members.ts`
- [ ] Extract API types to `types/api.ts`
- [ ] Update all component imports to use centralized types

### Phase 4: Extract Pure UI Components (Week 3)

#### ProjectView Components
- [ ] Extract `ProjectHeader` component
  - [ ] Move header rendering logic
  - [ ] Extract `ProjectStats` sub-component
  - [ ] Extract `RoleBadge` sub-component
  - [ ] Add proper TypeScript props

- [ ] Extract `ProjectTabs` component
  - [ ] Move tab container logic
  - [ ] Extract `OverviewTab` component
  - [ ] Extract `TasksTab` component  
  - [ ] Extract `MembersTab` component

- [ ] Extract `ProjectManagement` component
  - [ ] Move management panel logic
  - [ ] Extract `QuickActions` component
  - [ ] Extract `Settings` component

#### TasksView Components
- [ ] Extract `TasksHeader` component
  - [ ] Move header rendering logic
  - [ ] Extract `TasksFilters` component
  - [ ] Extract `CreateButton` component

- [ ] Extract `TaskCard` component
  - [ ] Move task card logic
  - [ ] Extract `TaskHeader` sub-component
  - [ ] Extract `TaskProgress` sub-component
  - [ ] Extract `TaskActions` sub-component
  - [ ] Extract `TaskSubTasks` sub-component

- [ ] Extract `SubTaskItem` component
  - [ ] Move subtask item logic
  - [ ] Extract `SubTaskBadge` component
  - [ ] Extract `SubTaskMeta` component

- [ ] Extract `TasksList` component
  - [ ] Move list container logic
  - [ ] Extract `EmptyState` component

#### Shared UI Components
- [ ] Extract `StatusBadge` component
- [ ] Extract `ImportanceBadge` component
- [ ] Extract `ProgressBar` component
- [ ] Extract `ConfirmationDialog` component

### Phase 5: Extract Dialog Components (Week 4)

#### SubTaskDetailsDialog Components
- [ ] Extract `SubTaskDialogHeader` component
  - [ ] Move header rendering logic
  - [ ] Extract `ModeIndicator` component

- [ ] Extract `SubTaskViewMode` component
  - [ ] Move view mode logic
  - [ ] Extract `SubTaskInfo` component
  - [ ] Extract `SubTaskMeta` component
  - [ ] Extract `SubTaskNotes` component

- [ ] Extract `SubTaskEditModes` components
  - [ ] Extract `StatusEditMode` component
  - [ ] Extract `DetailsEditMode` component
  - [ ] Extract shared form components

- [ ] Extract `SubTaskActions` component
  - [ ] Extract `ViewActions` component
  - [ ] Extract `EditActions` component

#### Other Dialog Components
- [ ] Extract `EditProjectDialog` component
  - [ ] Extract `EditProjectForm` component
  - [ ] Add form validation

- [ ] Extract `DeleteProjectDialog` component
- [ ] Extract `EditTaskDialog` component
- [ ] Extract `DeleteConfirmDialog` component

### Phase 6: Extract Form Components (Week 4)

#### Form Component Tasks
- [ ] Extract `CreateTaskForm` component
  - [ ] Extract `TaskForm` component
  - [ ] Add validation logic

- [ ] Extract `CreateSubTaskForm` component
  - [ ] Extract `SubTaskForm` component
  - [ ] Add validation logic

- [ ] Extract `AddMemberForm` component
  - [ ] Extract `MemberSearch` component

### Phase 7: Extract Utility Functions (Week 5)

#### Utility Tasks
- [ ] Create `permissions.ts` utility
  - [ ] Move permission checking functions
  - [ ] Add role-based utilities

- [ ] Create `dateHelpers.ts` utility
  - [ ] Move date formatting functions
  - [ ] Add date validation

- [ ] Create `taskHelpers.ts` utility
  - [ ] Move task utility functions
  - [ ] Add progress calculations

- [ ] Create `validation.ts` utility
  - [ ] Move common validation functions
  - [ ] Add form validation helpers

### Phase 8: Update Main Components (Week 5)

#### Main Component Updates
- [ ] Update `ProjectView.tsx` to use extracted components
  - [ ] Replace inline logic with hooks
  - [ ] Update imports
  - [ ] Verify functionality

- [ ] Update `TasksView.tsx` to use extracted components  
  - [ ] Replace inline logic with hooks
  - [ ] Update imports
  - [ ] Verify functionality

- [ ] Update `SubTaskDetailsDialog.tsx` to use extracted components
  - [ ] Replace inline logic with hooks
  - [ ] Update imports
  - [ ] Verify functionality

### Phase 9: Performance Optimization (Week 6)

#### Performance Tasks
- [ ] Add React.memo to pure components
- [ ] Add useMemo for expensive calculations
- [ ] Add useCallback for stable references
- [ ] Implement lazy loading for dialogs
- [ ] Add virtual scrolling for large lists

#### Testing Tasks
- [ ] Verify all components render correctly
- [ ] Test all user interactions
- [ ] Verify API calls still work
- [ ] Check performance metrics
- [ ] Test error handling

## Success Metrics

### Code Quality Metrics
- [ ] No component file over 200 lines
- [ ] No business logic in UI components
- [ ] All API calls moved to hooks
- [ ] All types centralized
- [ ] 100% of conditional rendering moved to appropriate components

### Performance Metrics
- [ ] Page load time unchanged or improved
- [ ] Component re-render count reduced
- [ ] Bundle size unchanged or reduced
- [ ] Memory usage stable

### Developer Experience Metrics
- [ ] Faster component navigation
- [ ] Easier to find specific functionality
- [ ] Simpler component testing
- [ ] Better code reusability

## File Organization Rules

### Naming Conventions
- **Components**: PascalCase (e.g., `ProjectView.tsx`)
- **Hooks**: camelCase starting with "use" (e.g., `useProjectData.ts`)
- **Types**: PascalCase for interfaces (e.g., `ProjectData`)
- **Utilities**: camelCase (e.g., `formatDate`)

### Import/Export Patterns
- **Index files**: Always use for component folders
- **Barrel exports**: Use at each directory level
- **Default exports**: Only for main components
- **Named exports**: For utilities and hooks

### Component Structure
```tsx
// Component file structure
import React from 'react';
import { ComponentProps } from './types';
import { useComponentHook } from './hooks';

export function ComponentName({ prop1, prop2 }: ComponentProps) {
  const { data, loading } = useComponentHook();
  
  if (loading) return <LoadingState />;
  
  return (
    <div>
      <ComponentHeader {...headerProps} />
      <ComponentBody {...bodyProps} />
    </div>
  );
}
```

## Risk Mitigation

### Potential Issues
- **Breaking changes**: Incremental refactoring reduces risk
- **Performance regression**: Benchmark before/after
- **Import hell**: Barrel exports prevent this
- **Over-abstraction**: Keep components focused on single responsibility

### Mitigation Strategies
- **Feature branch**: All work done in separate branch
- **Incremental testing**: Test each phase completion
- **Rollback plan**: Keep original files until refactor complete
- **Documentation**: Update component docs as you go

## Progress Tracking

### Weekly Goals
- **Week 1**: Foundation setup complete
- **Week 2**: All hooks extracted
- **Week 3**: All pure UI components extracted
- **Week 4**: All dialog components extracted
- **Week 5**: All utilities and main components updated
- **Week 6**: Performance optimization and testing

### Daily Checklist
- [ ] Work on assigned phase tasks
- [ ] Update progress checkboxes
- [ ] Test extracted components
- [ ] Update documentation
- [ ] Verify TypeScript compilation

## Completion Criteria

The refactoring is complete when:
- [ ] All original files are under 200 lines
- [ ] All checkboxes in this document are completed
- [ ] All tests pass
- [ ] Performance metrics are maintained or improved
- [ ] Code review is approved
- [ ] Documentation is updated

---

*Last updated: [DATE]*
*Progress: [X]% complete*
