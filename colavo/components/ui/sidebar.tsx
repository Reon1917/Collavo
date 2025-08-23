"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useNavigationStore } from "@/lib/stores/navigation-store";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const sidebarProps: {
    children: React.ReactNode;
    open?: boolean;
    setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
    animate?: boolean;
  } = { children };
  
  if (open !== undefined) sidebarProps.open = open;
  if (setOpen !== undefined) sidebarProps.setOpen = setOpen;
  if (animate !== undefined) sidebarProps.animate = animate;

  return <SidebarProvider {...sidebarProps} />;
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...props} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <>
      <motion.div
        className={cn(
          "h-screen px-2 py-6 hidden md:flex md:flex-col bg-white dark:bg-gray-900 w-[300px] shrink-0 border-r border-gray-200 dark:border-gray-700 fixed top-0 left-0 z-40",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "72px") : "300px",
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        {...props}
      >
        {children}
      </motion.div>
    </>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-10 px-4 py-4 flex flex-row md:hidden items-center justify-between bg-white dark:bg-gray-900 w-full border-b border-gray-200 dark:border-gray-700"
        )}
      >
        <div className="flex justify-end z-20 w-full">
          <IconMenu2
            className="text-gray-800 dark:text-gray-200 hover:text-[#008080] dark:hover:text-[#00FFFF]"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-white dark:bg-gray-900 p-10 z-[100] flex flex-col justify-between",
                className
              )}
              {...props}
            >
              <div
                className="absolute right-10 top-10 z-50 text-gray-800 dark:text-gray-200 hover:text-[#008080] dark:hover:text-[#00FFFF] cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <IconX />
              </div>
              {children as React.ReactNode}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setActiveRoute } = useNavigationStore();
  
  // Custom active state logic that handles query parameters
  const isActive = React.useMemo(() => {
    // Handle "Back to Dashboard" - only active if we're exactly on dashboard
    if (link.href === '/dashboard') {
      return pathname === '/dashboard';
    }
    
    // Handle project routes with query parameters
    if (link.href.includes('/project/')) {
      try {
        const url = new URL(link.href, 'http://localhost');
        const linkPathname = url.pathname;
        const linkSearchParams = url.searchParams;
        
        // Check if pathname matches
        if (pathname !== linkPathname) {
          return false;
        }
        
        const currentTab = searchParams.get('tab') || 'overview';
        
        // If link has tab parameter, check current tab
        const linkTab = linkSearchParams.get('tab');
        if (linkTab) {
          return currentTab === linkTab;
        }
        
        // If link has no tab parameter, it's the overview link - active when tab is overview or null
        return currentTab === 'overview';
      } catch {
        return false;
      }
    }
    
    return pathname === link.href;
  }, [link.href, pathname, searchParams]);
  
  useEffect(() => {
    if (isActive) {
      setActiveRoute(link.href);
    }
  }, [isActive, link.href, setActiveRoute]);

  // Force re-render when URL changes to update active states
  useEffect(() => {
    // This effect ensures the component re-renders when navigation happens
    const handleNavigation = () => {
      // Component will re-render due to useSearchParams and usePathname hooks
    };
    
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, []);

  return (
    <Link
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-3 px-4 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20 relative overflow-hidden",
        isActive 
          ? "text-primary bg-primary/10 border border-primary/20 shadow-sm" 
          : "text-sidebar-foreground hover:text-sidebar-hover-foreground hover:bg-sidebar-hover",
        className
      )}
      {...props}
    >
      <div className={cn(
        "flex items-center justify-center w-10 h-10 transition-all duration-300",
        isActive 
          ? "text-primary" 
          : "text-muted-foreground group-hover/sidebar:text-sidebar-hover-foreground"
      )}>
        {link.icon}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
          x: animate ? (open ? 0 : -10) : 0,
        }}
        transition={{ duration: 0.2 }}
        className={cn(
          "font-medium whitespace-pre inline-block !p-0 !m-0 transition-all duration-300",
          isActive ? "text-primary" : ""
        )}
      >
        <span>{link.label}</span>
      </motion.span>

      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 pointer-events-none" />
      )}
    </Link>
  );
};
