import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Every test starts with a clean browser: no saved token, no saved reading list
afterEach(() => {
  cleanup();
  localStorage.clear();
});
