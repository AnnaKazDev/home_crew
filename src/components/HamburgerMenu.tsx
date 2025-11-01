"use client";

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

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
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
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
      </SheetTrigger>

      <SheetContent side="left" className="w-80">
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>

        <nav className="flex flex-col space-y-2 mt-6">
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
      </SheetContent>
    </Sheet>
  );
}
