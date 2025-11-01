"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MenuItem {
  label: string;
  href: string;
  icon?: React.ReactNode;
}

interface HamburgerMenuProps {
  menuItems: MenuItem[];
}

export default function HamburgerMenu({ menuItems }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigation = (href: string) => {
    window.location.href = href;
    setIsOpen(false);
  };

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
          className="w-5 h-5"
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

      {/* Mobile Menu Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md w-full max-w-sm mx-4">
          <DialogHeader>
            <DialogTitle>Menu</DialogTitle>
          </DialogHeader>

          <nav className="flex flex-col space-y-2">
            {menuItems.map((item, index) => (
              <Button
                key={index}
                variant="ghost"
                className="justify-start h-12 text-left"
                onClick={() => handleNavigation(item.href)}
              >
                {item.icon && (
                  <span className="mr-3 text-lg">{item.icon}</span>
                )}
                <span>{item.label}</span>
              </Button>
            ))}
          </nav>
        </DialogContent>
      </Dialog>
    </>
  );
}
