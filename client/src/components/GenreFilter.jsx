import { useEffect, useState } from 'react';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

function GenreFilter({ value, onChange }) {
  const [genres, setGenres] = useState([]);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    axios
      .get(`${API}/genres`, { signal: controller.signal })
      .then((res) => setGenres(res.data))
      .catch((err) => {
        if (!axios.isCancel(err)) setFailed(true);
      });
    return () => controller.abort();
  }, []);

  return (
    <div>
      <label htmlFor="genre-filter" className="sr-only">
        Filter by genre
      </label>
      <select
        id="genre-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
      >
        <option value="">All genres</option>
        {genres.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </select>
      {failed && <p className="mt-1 text-xs text-rose-700">Genres could not be loaded.</p>}
    </div>
  );
}

export default GenreFilter;
