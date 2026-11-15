import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { ReadingListProvider, READING_LIST_KEY, readingListReducer, useReadingList } from '../context/ReadingListContext.jsx';
import { BOOKS, mockApi, renderApp } from '../test/helpers.jsx';

const book = (id) => ({ id, title: `Book ${id}`, author: 'A', genre: null, coverImage: null });
const saved = () => JSON.parse(localStorage.getItem(READING_LIST_KEY));

describe('readingListReducer (ADD_BOOK / REMOVE_BOOK / CLEAR_LIST)', () => {
  it('ADD_BOOK adds a book', () => {
    expect(readingListReducer([], { type: 'ADD_BOOK', payload: book(1) })).toEqual([book(1)]);
  });
  it('ADD_BOOK ignores a book that is already on the list', () => {
    const state = [book(1)];
    expect(readingListReducer(state, { type: 'ADD_BOOK', payload: book(1) })).toBe(state);
  });
  it('REMOVE_BOOK removes by id and leaves the others', () => {
    expect(readingListReducer([book(1), book(2), book(3)], { type: 'REMOVE_BOOK', payload: 2 })).toEqual([book(1), book(3)]);
  });
  it('CLEAR_LIST empties the list', () => {
    expect(readingListReducer([book(1), book(2)], { type: 'CLEAR_LIST' })).toEqual([]);
  });
  it('an unknown action leaves the state alone', () => {
    const state = [book(1)];
    expect(readingListReducer(state, { type: 'NOPE' })).toBe(state);
  });
  it('never changes the old state (it returns a new array)', () => {
    const state = [book(1)];
    readingListReducer(state, { type: 'ADD_BOOK', payload: book(2) });
    expect(state).toEqual([book(1)]);
  });
});

function Probe() {
  const { readingList, addBook, removeBook, clearList } = useReadingList();
  return (
    <div>
      <p data-testid="count">{readingList.length}</p>
      <button onClick={() => addBook({ ...BOOKS[0], genre: { name: 'Fiction' } })}>add</button>
      <button onClick={() => removeBook(1)}>remove</button>
      <button onClick={clearList}>clear</button>
    </div>
  );
}
const renderProbe = () => render(<ReadingListProvider><Probe /></ReadingListProvider>);

describe('ReadingListProvider: persisted to and restored from localStorage', () => {
  it('saves every change to localStorage', async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByText('add'));
    expect(saved()).toHaveLength(1);
    expect(saved()[0]).toMatchObject({ id: 1, title: 'Things Fall Apart', genre: 'Fiction' });
    await user.click(screen.getByText('remove'));
    expect(saved()).toEqual([]);
  });

  it('keeps only what the list needs, not the whole book record', async () => {
    const user = userEvent.setup();
    renderProbe();
    await user.click(screen.getByText('add'));
    expect(Object.keys(saved()[0]).sort()).toEqual(['author', 'coverImage', 'genre', 'id', 'title']);
  });

  it('restores the saved list on the first render (a page refresh)', () => {
    localStorage.setItem(READING_LIST_KEY, JSON.stringify([book(1), book(2)]));
    renderProbe();
    expect(screen.getByTestId('count')).toHaveTextContent('2');
  });

  it('survives a refresh: unmount, mount again, the book is still there', async () => {
    const user = userEvent.setup();
    const first = renderProbe();
    await user.click(screen.getByText('add'));
    first.unmount();
    renderProbe();
    expect(screen.getByTestId('count')).toHaveTextContent('1');
  });

  it.each([
    ['corrupt JSON', '{not json'],
    ['a value that is not a list', '{"a":1}'],
    ['null', 'null'],
  ])('starts empty instead of crashing when storage holds %s', (_label, value) => {
    localStorage.setItem(READING_LIST_KEY, value);
    renderProbe();
    expect(screen.getByTestId('count')).toHaveTextContent('0');
  });

  it('CLEAR_LIST empties the saved copy too', async () => {
    const user = userEvent.setup();
    localStorage.setItem(READING_LIST_KEY, JSON.stringify([book(1), book(2)]));
    renderProbe();
    await user.click(screen.getByText('clear'));
    expect(saved()).toEqual([]);
  });

  it('useReadingList outside the provider explains the mistake', () => {
    const quiet = console.error;
    console.error = () => {};
    expect(() => render(<Probe />)).toThrow('inside <ReadingListProvider>');
    console.error = quiet;
  });
});

describe('reading list in the whole app', () => {
  it('add from the catalog: the Navbar count updates without any props passed down', async () => {
    const user = userEvent.setup();
    mockApi();
    renderApp('/');
    await screen.findByText('Showing 4 books');
    expect(screen.getByTestId('reading-list-count')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', { name: 'Add to reading list: Clean Code' }));
    expect(screen.getByTestId('reading-list-count')).toHaveTextContent('1');
    // the button now offers to remove it
    expect(screen.getByRole('button', { name: 'Remove from reading list: Clean Code' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add to reading list: Things Fall Apart' }));
    expect(screen.getByTestId('reading-list-count')).toHaveTextContent('2');
  });

  it('clicking the button again removes the book', async () => {
    const user = userEvent.setup();
    mockApi();
    renderApp('/');
    await screen.findByText('Showing 4 books');
    await user.click(screen.getByRole('button', { name: 'Add to reading list: Clean Code' }));
    await user.click(screen.getByRole('button', { name: 'Remove from reading list: Clean Code' }));
    expect(screen.getByTestId('reading-list-count')).toHaveTextContent('0');
  });

  it('the list is still there after a page refresh', async () => {
    const user = userEvent.setup();
    mockApi();
    const first = renderApp('/');
    await screen.findByText('Showing 4 books');
    await user.click(screen.getByRole('button', { name: 'Add to reading list: Clean Code' }));
    first.unmount(); // the "refresh"

    renderApp('/');
    await screen.findByText('Showing 4 books');
    expect(screen.getByTestId('reading-list-count')).toHaveTextContent('1');
    expect(screen.getByRole('button', { name: 'Remove from reading list: Clean Code' })).toBeInTheDocument();
  });

  it('the Reading list page shows the saved books, with Remove and Clear', async () => {
    const user = userEvent.setup();
    mockApi();
    renderApp('/');
    await screen.findByText('Showing 4 books');
    await user.click(screen.getByRole('button', { name: 'Add to reading list: Clean Code' }));
    await user.click(screen.getByRole('button', { name: 'Add to reading list: Things Fall Apart' }));

    await user.click(screen.getByRole('link', { name: /Reading list/ }));
    expect(await screen.findByRole('heading', { name: 'Your reading list' })).toBeInTheDocument();
    expect(screen.getByText('2 books, saved in this browser')).toBeInTheDocument();
    const list = screen.getByRole('list');
    expect(within(list).getByRole('link', { name: 'Clean Code' })).toBeInTheDocument();
    expect(within(list).getByText(/Robert C. Martin/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Remove Clean Code from reading list' }));
    expect(screen.getByTestId('reading-list-count')).toHaveTextContent('1');
    expect(within(screen.getByRole('list')).queryByText('Clean Code')).not.toBeInTheDocument();

    // clearing asks for confirmation first
    await user.click(screen.getByRole('button', { name: 'Clear list' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByTestId('reading-list-count')).toHaveTextContent('1');
    await user.click(screen.getByRole('button', { name: 'Clear list' }));
    await user.click(screen.getByRole('button', { name: 'Yes, clear it' }));
    expect(screen.getByTestId('reading-list-count')).toHaveTextContent('0');
    expect(screen.getByRole('heading', { name: 'Your reading list is empty' })).toBeInTheDocument();
    expect(saved()).toEqual([]);
  });

  it('works for guests: no login needed for the reading list', async () => {
    renderApp('/reading-list');
    expect(await screen.findByRole('heading', { name: 'Your reading list is empty' })).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('the detail page has the button too, and it shares the same list', async () => {
    const user = userEvent.setup();
    mockApi();
    renderApp('/books/3');
    await screen.findByRole('heading', { name: 'Clean Code', level: 1 });
    await user.click(screen.getByRole('button', { name: 'Add to reading list: Clean Code' }));
    expect(screen.getByTestId('reading-list-count')).toHaveTextContent('1');
    expect(saved()[0]).toMatchObject({ id: 3, title: 'Clean Code', genre: 'Technology' });
  });
});
