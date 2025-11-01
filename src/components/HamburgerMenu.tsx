"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Button } from "@/components/ui/button";

interface MenuItem {
  label: string;
  href: string;
}

interface HamburgerMenuProps {
  menuItems: MenuItem[];
}

export default function HamburgerMenu({ menuItems }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleNavigation = (href: string) => {
    window.location.href = href;
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
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        title="Menu"
      >
        <svg
          className="w-5 h-5 text-black dark:text-white"
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
      </Button>

      {/* Portal the overlay and menu to document body to escape stacking contexts */}
      {mounted && createPortal(
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
            style={{ top: '3.5rem' }} // Account for fixed header
          >
            <div className="p-6">
       

              <nav className="flex flex-col space-y-3">
                {menuItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    className="text-base font-medium text-foreground hover:text-primary transition-colors duration-200 px-4 py-2 rounded-md hover:bg-primary/5"
                    onClick={(e) => {
                      e.preventDefault();
                      handleNavigation(item.href);
                    }}
                  >
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
