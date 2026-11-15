import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import SearchBar from '../components/SearchBar.jsx';
import { apiError, mockApi, networkError, renderApp } from '../test/helpers.jsx';

afterEach(() => vi.restoreAllMocks());

describe('Week 3 catalog still works (regression)', () => {
  it('shows a loading skeleton, then the books', async () => {
    mockApi();
    renderApp('/');
    expect(screen.getByRole('status')).toHaveTextContent('Loading books...');
    expect(await screen.findByText('Showing 4 books')).toBeInTheDocument();
  });

  it('live search, with the genre filter, refetches with query params', async () => {
    const user = userEvent.setup();
    const spy = mockApi();
    renderApp('/');
    await screen.findByText('Showing 4 books');
    await user.type(screen.getByRole('searchbox'), 'clean');
    expect(await screen.findByText('Showing 1 book', {}, { timeout: 3000 })).toBeInTheDocument();
    await user.clear(screen.getByRole('searchbox'));
    await screen.findByText('Showing 4 books', {}, { timeout: 3000 });
    await user.selectOptions(screen.getByLabelText('Filter by genre'), 'Technology');
    expect(await screen.findByText('Showing 2 books')).toBeInTheDocument();
    const calls = spy.mock.calls.filter((c) => c[0].endsWith('/books')).map((c) => c[1].params);
    expect(calls.some((p) => p.search === 'clean')).toBe(true);
    expect(calls.some((p) => String(p.genreId) === '2')).toBe(true);
  });

  it('empty and error states, and Try again', async () => {
    const user = userEvent.setup();
    mockApi();
    renderApp('/');
    await screen.findByText('Showing 4 books');
    await user.type(screen.getByRole('searchbox'), 'zzzzzz');
    expect(await screen.findByText('No books found', {}, { timeout: 3000 })).toBeInTheDocument();
  });

  it('error state when the API is unreachable, and Try again recovers', async () => {
    const user = userEvent.setup();
    const real = mockApi();
    let failures = 1;
    const impl = real.getMockImplementation();
    real.mockImplementation((url, cfg) => (url.endsWith('/books') && failures-- > 0 ? Promise.reject(networkError()) : impl(url, cfg)));
    renderApp('/');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the library server');
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(await screen.findByText('Showing 4 books')).toBeInTheDocument();
  });

  it('book detail page, and Book not found', async () => {
    mockApi();
    const first = renderApp('/books/3');
    expect(await screen.findByRole('heading', { name: 'Clean Code', level: 1 })).toBeInTheDocument();
    expect(screen.getByText('9780132350884')).toBeInTheDocument();
    first.unmount();
    renderApp('/books/999');
    expect(await screen.findByRole('alert')).toHaveTextContent('Book not found');
  });

  it('a card is one link to the detail page, and a book with no copies left says so', async () => {
    mockApi();
    const { container } = renderApp('/');
    await screen.findByText('Showing 4 books');
    expect(container.querySelectorAll('a[href^="/books/"]')).toHaveLength(4);
    expect(screen.getByText('All copies borrowed')).toBeInTheDocument();
  });
});

describe('SearchBar debounce (fake timers)', () => {
  it('calls onSearch once, 400ms after the LAST keystroke', () => {
    vi.useFakeTimers();
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const input = screen.getByRole('searchbox');
    'hobbit'.split('').reduce((typed, ch) => {
      const next = typed + ch;
      fireEvent.change(input, { target: { value: next } });
      act(() => vi.advanceTimersByTime(100));
      return next;
    }, '');
    expect(onSearch).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(299));
    expect(onSearch).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(1));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(onSearch).toHaveBeenCalledWith('hobbit');
    vi.useRealTimers();
  });

  it('typing a word fires ONE search request, not one per letter', async () => {
    const user = userEvent.setup();
    const spy = mockApi();
    renderApp('/');
    await screen.findByText('Showing 4 books');
    spy.mockClear();
    await user.type(screen.getByRole('searchbox'), 'clean');
    await screen.findByText('Showing 1 book', {}, { timeout: 3000 });
    const searches = spy.mock.calls.filter((c) => c[0].endsWith('/books')).map((c) => c[1].params.search);
    expect(searches).toEqual(['clean']);
  });
});

describe('apiError helper', () => {
  it('joins the API validation messages', async () => {
    const { getErrorMessage } = await import('../utils/apiError.js');
    expect(getErrorMessage(apiError(400, ['a must be x', 'b must be y']))).toBe('a must be x. b must be y.');
    expect(getErrorMessage(apiError(409, 'dup'), { 409: 'custom' })).toBe('custom');
    expect(getErrorMessage(apiError(500))).toBe('Something went wrong. Please try again.');
    expect(getErrorMessage(networkError())).toMatch(/Could not reach the library server/);
  });
});
