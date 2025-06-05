"use client";
import { cn } from "@/lib/utils";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "motion/react";
import { IconMenu2, IconX } from "@tabler/icons-react";

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
          "h-screen px-4 py-4 hidden md:flex md:flex-col bg-white dark:bg-gray-900 w-[300px] shrink-0 border-r border-gray-200 dark:border-gray-700 fixed top-0 left-0 z-40",
          className
        )}
        animate={{
          width: animate ? (open ? "300px" : "60px") : "300px",
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
              {children}
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
  return (
    <a
      href={link.href}
      className={cn(
        "flex items-center justify-start gap-2 group/sidebar py-3 px-2 rounded-lg text-gray-700 dark:text-gray-300 hover:text-[#008080] dark:hover:text-[#00FFFF] hover:bg-[#008080]/10 dark:hover:bg-[#00FFFF]/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#008080]/20 dark:focus:ring-[#00FFFF]/20",
        className
      )}
      {...props}
    >
      <div className="text-gray-500 dark:text-gray-400 group-hover/sidebar:text-[#008080] dark:group-hover/sidebar:text-[#00FFFF] transition-colors duration-200">
        {link.icon}
      </div>

      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="font-medium group-hover/sidebar:translate-x-1 transition duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        <span>{link.label}</span>
      </motion.span>
    </a>
  );
};
