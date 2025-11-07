'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import AuthPage from './AuthPage';

const AuthPageWithTheme: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthPage />
    </ThemeProvider>
  );
};

export default AuthPageWithTheme;
