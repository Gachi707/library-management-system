import { useState } from 'react';
import BookGrid from '../components/BookGrid.jsx';
import SearchBar from '../components/SearchBar.jsx';
import GenreFilter from '../components/GenreFilter.jsx';

function HomePage() {
  // The shared filter state lives here, in the lowest common parent of every
  // component that needs it. Children read it through props and report changes
  // upward through callback props ("lifting state up").
  const [search, setSearch] = useState('');
  const [genreId, setGenreId] = useState('');
  const [sortBy, setSortBy] = useState('title');

  return (
    <div>
      <h1 className="text-2xl font-bold">Book catalog</h1>
      <p className="mt-1 text-slate-600">Search by title or author, or filter by genre.</p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <SearchBar onSearch={setSearch} />
        <GenreFilter value={genreId} onChange={setGenreId} />
        <div>
          <label htmlFor="sort-by" className="sr-only">
            Sort books
          </label>
          <select
            id="sort-by"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="title">Sort by title</option>
            <option value="author">Sort by author</option>
          </select>
        </div>
      </div>

      <div className="mt-6">
        <BookGrid genreId={genreId} search={search} sortBy={sortBy} />
      </div>
    </div>
  );
}

export default HomePage;
