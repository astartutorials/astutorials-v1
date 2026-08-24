/**
 * @jest-environment jsdom
 */
import '@testing-library/jest-dom';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider, THEME_STORAGE_KEY } from '@/components/shared/ThemeProvider';
import ThemeToggle from '@/components/shared/ThemeToggle';

/** jsdom has no matchMedia; this stands in for the OS preference. */
function mockSystemPrefersDark(prefersDark: boolean) {
  const listeners = new Set<() => void>();
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    configurable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: query.includes('dark') ? prefersDark : false,
      media: query,
      addEventListener: (_: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
      dispatchEvent: () => false,
    })),
  });
  return listeners;
}

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.classList.remove('dark');
  document.documentElement.style.colorScheme = '';
});

describe('theme preference', () => {
  it('defaults to light even when the OS prefers dark', () => {
    mockSystemPrefersDark(true);
    renderToggle();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(document.documentElement.style.colorScheme).toBe('light');
  });

  it('defaults to light when the OS prefers light', () => {
    mockSystemPrefersDark(false);
    renderToggle();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('honours a stored dark preference over the light default', () => {
    mockSystemPrefersDark(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    renderToggle();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('follows the OS only once system is explicitly chosen', () => {
    mockSystemPrefersDark(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'system');
    renderToggle();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('lets a stored preference override the OS', () => {
    mockSystemPrefersDark(true);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    renderToggle();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('cycles light -> dark -> system and persists each step', () => {
    mockSystemPrefersDark(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    renderToggle();

    fireEvent.click(screen.getByRole('button'));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    fireEvent.click(screen.getByRole('button'));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('system');
    // 'system' resolves through the mocked OS preference, which is light here.
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    fireEvent.click(screen.getByRole('button'));
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('follows the OS live while the preference is system', () => {
    const listeners = mockSystemPrefersDark(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'system');
    renderToggle();
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // The OS flips to dark while the tab is open.
    mockSystemPrefersDark(true);
    act(() => {
      listeners.forEach((cb) => cb());
    });
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('falls back to the light default when storage throws', () => {
    mockSystemPrefersDark(true);
    const getItem = jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    expect(() => renderToggle()).not.toThrow();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    getItem.mockRestore();
  });

  it('exposes the current and next theme to screen readers', () => {
    mockSystemPrefersDark(false);
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    renderToggle();
    expect(screen.getByRole('button')).toHaveAccessibleName(
      'Theme: Light. Switch to Dark.',
    );
  });
});
