import { useEffect, useState } from 'react';

function SearchBar({ onSearch, delay = 400 }) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    // Debounce: schedule the search after a pause in typing...
    const timer = setTimeout(() => onSearch(query.trim()), delay);
    // ...and cancel the previous timer on every new keystroke (the cleanup runs first)
    return () => clearTimeout(timer);
  }, [query, delay, onSearch]);

  return (
    <div className="flex-1">
      <label htmlFor="book-search" className="sr-only">
        Search books by title or author
      </label>
      <input
        id="book-search"
        type="search"
        placeholder="Search by title or author..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
      />
    </div>
  );
}

export default SearchBar;
