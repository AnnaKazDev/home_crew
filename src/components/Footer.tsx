import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-background dark:bg-black border-t border-border py-2 px-4">
      <div className="container mx-auto text-center">
        <p className="text-sm text-muted-foreground">
          Home Crew App, {currentYear} • Made with ❤️
        </p>
      </div>
    </footer>
  );
}
