import { vi } from 'vitest';

// Happy-dom obsługuje większość API DOM natywnie, więc potrzebujemy mniej mocków

// Mock tylko specyficznych API jeśli potrzebne
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Import jest-dom matchers
import '@testing-library/jest-dom/vitest';
