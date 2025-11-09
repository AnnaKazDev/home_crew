'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XIcon, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuItem {
  label?: string | React.ReactNode;
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  separator?: boolean;
}

interface HamburgerMenuProps {
  menuItems: MenuItem[];
}

export default function HamburgerMenu({ menuItems }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleItemClick = (item: MenuItem) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      window.location.href = item.href;
    }
    setIsOpen(false);
  };

  // Mark component as mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (!mounted) return;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, mounted]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        className="p-0 w-8 h-8 bg-transparent border-none cursor-pointer flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
        onClick={() => setIsOpen(true)}
        title="Menu"
      >
        <svg
          width="32"
          height="32"
          className="text-black dark:text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* Portal the overlay and menu to document body to escape stacking contexts */}
      {mounted &&
        createPortal(
          <>
            {/* Side Menu Overlay */}
            {isOpen && (
              <div
                className="fixed inset-0 z-[2147483646] bg-black/20 backdrop-blur-md"
                onClick={() => setIsOpen(false)}
              />
            )}

            {/* Side Menu */}
            <div
              className={`fixed top-0 left-0 z-[2147483647] h-full w-80 bg-gray-50/95 dark:bg-gray-800/95 backdrop-blur-xl transform transition-transform duration-300 ease-in-out ${
                isOpen ? 'translate-x-0' : '-translate-x-full'
              }`}
              style={{ top: '0' }} // Start from top to include header area
            >
              <div className="flex flex-col h-full p-6">
                {/* Logo */}
                <div className="flex mb-6">
                  <img src="/logotype.png" alt="Logo" className="h-12 w-auto" />
                </div>

                {/* Close Button - same styling as modal close buttons */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="ring-offset-background focus:ring-ring text-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 p-1.5"
                  title="Close menu"
                >
                  <XIcon />
                  <span className="sr-only">Close menu</span>
                </Button>

                {/* Navigation - takes up available space */}
                <nav className="flex flex-col space-y-3 pt-12 flex-1">
                  {menuItems
                    .filter(
                      (item) => !(typeof item.label === 'string' && item.label === 'Sign out')
                    )
                    .map((item, index) =>
                      item.separator ? (
                        <div key={index} className="border-t border-border my-2"></div>
                      ) : (
                        <button
                          key={index}
                          className="flex items-center gap-3 text-base font-medium text-foreground hover:text-primary transition-colors duration-200 px-4 py-2 rounded-md hover:bg-primary/5 text-left w-full"
                          onClick={() => handleItemClick(item)}
                        >
                          {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                          <span className="flex-1">{item.label}</span>
                        </button>
                      )
                    )}
                </nav>

                {/* Sign out button above the image */}
                {menuItems.find(
                  (item) => typeof item.label === 'string' && item.label === 'Sign out'
                ) && (
                  <div className="mt-4">
                    <button
                      className="flex items-center gap-3 text-base font-medium text-foreground hover:text-primary transition-colors duration-200 px-4 py-2 rounded-md hover:bg-primary/5 text-left w-full"
                      onClick={() =>
                        handleItemClick(
                          menuItems.find(
                            (item) => typeof item.label === 'string' && item.label === 'Sign out'
                          )!
                        )
                      }
                    >
                      <LogOut className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1">Sign out</span>
                    </button>
                  </div>
                )}

                {/* Bottom Image - stays at bottom */}
                <div className="mt-8">
                  <img
                    src="/lets_make_it_together.png"
                    alt="Let's make it together"
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
}
