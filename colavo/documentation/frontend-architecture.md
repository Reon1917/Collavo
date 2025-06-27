# Frontend Architecture & Components

This document provides an overview of the frontend architecture, component structure, and design patterns used in the Collavo application.

## 1. Core Technologies

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **UI Library**: React 19
- **Styling**: TailwindCSS with `shadcn/ui` for component primitives.
- **State Management**: React hooks (`useState`, `useContext`), custom hooks, and a simple store for global navigation state.
- **Data Fetching**: Custom hooks wrapping `fetch` calls, with a pattern similar to `SWR` or `React Query` for handling loading, data, and error states.

## 2. Directory Structure

The frontend codebase is organized to separate concerns and promote reusability.

- **`app/`**: Contains all routes and pages as per the Next.js App Router convention.
  - `layout.tsx`: The root layout, wrapping all pages with global providers like `ThemeProvider` and `AuthProvider`.
  - `page.tsx`: The public-facing landing page.
  - `(protected)/`: A route group for pages that require authentication.
  - `project/[id]/`: Dynamic routes for individual project views.

- **`components/`**: The core of the UI.
  - `ui/`: Reusable, unstyled, and accessible component primitives from `shadcn/ui` (e.g., `Button`, `Dialog`, `Card`). These are the building blocks of the application's design system.
  - `project/`: Components that are specific to the project context, often composed of smaller `ui` components. Examples include `TasksView`, `MembersView`, `CreateProjectForm`.
  - `shared/`: Components that can be used across different features but are more complex than basic `ui` elements, like `Navbar` or `Sidebar`.

- **`hooks/`**: Contains all custom React hooks.
  - `useProjectData.ts`: Fetches and manages the state for a single project.
  - `useProjectPermissions.ts`: A client-side hook to easily access the current user's permissions for a project.
  - `useNavigationLoading.ts`: Manages the visual loading indicator for page transitions.

- **`lib/`**: Shared utility functions, client-side libraries, and configuration.
  - `utils.ts`: General utility functions (e.g., `cn` for merging Tailwind classes).
  - `auth-client.ts`: Client-side helpers for interacting with the authentication service.
  - `stores/`: Simple client-side stores (e.g., Zustand for navigation state).

- **`providers/`**: Global context providers for themes, authentication state, etc.

## 3. Component Design Patterns

### a) Container/Presentational Pattern

We strive to separate data-fetching and logic (containers) from pure rendering (presentational components).

- **Container Components**: Found within feature directories (e.g., `components/project/TasksView/TasksView.tsx`). They are responsible for:
  - Fetching data using custom hooks.
  - Handling user interactions and state changes.
  - Passing data and callbacks down to presentational components.

- **Presentational Components**: Often found in sub-directories (e.g., `components/tasks/task-item.tsx`). They are responsible for:
  - Rendering the UI based on the props they receive.
  - Emitting events to the parent container via callbacks (`onClick`, `onSubmit`).
  - Having minimal to no internal state.

**Example**: `TasksView.tsx` (container) fetches the list of tasks and passes it to `TaskItem.tsx` (presentational) for rendering each individual task card.

### b) Compound Components

For complex but related UI elements, we use the compound component pattern to provide a clean and expressive API. This is heavily utilized by `shadcn/ui`.

**Example**: The `Dialog` component.

```tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

<Dialog>
  <DialogTrigger asChild>
    <Button>Open Dialog</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Dialog Title</DialogTitle>
    </DialogHeader>
    <p>This is the dialog content.</p>
  </DialogContent>
</Dialog>
```

This pattern allows for flexibility and keeps the relationship between the components clear.

## 4. State Management

- **Local State**: For component-specific state, we use `useState` and `useReducer`.
- **Shared/Global State**: For state that needs to be shared across the application, we use a combination of:
  - **React Context**: For passing down data like the current theme or authentication status (`ThemeProvider`, `AuthProvider`).
  - **Custom Hooks**: For managing the state of fetched data (e.g., `useProjectData`). This encapsulates the logic for fetching, caching, and updating data.
  - **Zustand (`lib/stores/`)**: For a small set of global client-side states, such as the state of the sidebar (open/closed), to avoid prop drilling without the boilerplate of Context.

## 5. Data Fetching

- **Strategy**: Data fetching is primarily handled by custom hooks.
- **Hook Design**: A typical data-fetching hook (`useProjectData`) will return an object with the following shape:
  ```ts
  {
    data: T | null,       // The fetched data
    isLoading: boolean,   // True while the request is in flight
    error: Error | null,  // Any error that occurred
    mutate: () => void    // A function to re-fetch the data
  }
  ```
- **Loading States**: Components use the `isLoading` flag to render skeleton loaders (`ContentLoading` or component-specific skeletons) for a better user experience.
- **Error Handling**: The `error` object is used to display error messages to the user, often using an `ErrorBoundary` component.

## 6. Performance Optimizations

- **Route-Level Code Splitting**: Handled automatically by the Next.js App Router. Each page is its own JavaScript bundle.
- **Component-Level Lazy Loading**: Heavy components or those not needed for the initial render are loaded lazily using `next/dynamic`.
  - **Example**: The different views within a project (Tasks, Members, Events) are loaded dynamically when the user clicks on the corresponding tab.
- **Skeleton Loaders**: Skeletons are used extensively to prevent layout shifts and provide immediate feedback to the user while data is being fetched.
- **Image Optimization**: `next/image` is used for all images to ensure they are properly sized, optimized (e.g., converted to WebP), and lazy-loaded by default.
