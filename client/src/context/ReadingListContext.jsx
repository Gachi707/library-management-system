import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react';

export const READING_LIST_KEY = 'readingList';

const ReadingListContext = createContext(null);

// The reducer lists every way the reading list is allowed to change:
// (currentState, action) => newState
export function readingListReducer(state, action) {
  switch (action.type) {
    case 'ADD_BOOK':
      // a book can only be on the list once
      return state.some((b) => b.id === action.payload.id) ? state : [...state, action.payload];
    case 'REMOVE_BOOK':
      return state.filter((b) => b.id !== action.payload);
    case 'CLEAR_LIST':
      return [];
    default:
      return state;
  }
}

// Restore the list saved in localStorage, ignoring anything missing or corrupt
function loadSavedList() {
  try {
    const saved = JSON.parse(localStorage.getItem(READING_LIST_KEY));
    return Array.isArray(saved) ? saved.filter((b) => b && b.id !== undefined) : [];
  } catch {
    return [];
  }
}

// Keep only what the reading list needs to show, not the whole book record
function toListItem(book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    genre: book.genre?.name ?? null,
    coverImage: book.coverImage ?? null,
  };
}

export function ReadingListProvider({ children }) {
  // The third argument runs once on the first render: that is how the saved list is restored on refresh
  const [readingList, dispatch] = useReducer(readingListReducer, [], loadSavedList);

  // Persist: save to localStorage every time the list changes
  useEffect(() => {
    try {
      localStorage.setItem(READING_LIST_KEY, JSON.stringify(readingList));
    } catch {
      // storage full or blocked: the list still works in memory for this visit
    }
  }, [readingList]);

  const addBook = useCallback((book) => dispatch({ type: 'ADD_BOOK', payload: toListItem(book) }), []);
  const removeBook = useCallback((id) => dispatch({ type: 'REMOVE_BOOK', payload: id }), []);
  const clearList = useCallback(() => dispatch({ type: 'CLEAR_LIST' }), []);
  const isInList = useCallback((id) => readingList.some((b) => b.id === id), [readingList]);

  const value = useMemo(
    () => ({ readingList, dispatch, addBook, removeBook, clearList, isInList }),
    [readingList, addBook, removeBook, clearList, isInList],
  );

  return <ReadingListContext.Provider value={value}>{children}</ReadingListContext.Provider>;
}

// Any component inside the provider can read the list with this hook, however deeply nested
export function useReadingList() {
  const ctx = useContext(ReadingListContext);
  if (!ctx) throw new Error('useReadingList must be used inside <ReadingListProvider>');
  return ctx;
}
