import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';
import { vi } from 'vitest';
import App from '../App.jsx';

export const GENRES = [
  { id: 1, name: 'Fiction', slug: 'fiction' },
  { id: 2, name: 'Technology', slug: 'technology' },
];

export const BOOKS = [
  { id: 1, title: 'Things Fall Apart', author: 'Chinua Achebe', isbn: '9780385474542', description: 'A story of Igbo life and colonial rule.', coverImage: null, totalCopies: 3, availableCopies: 3, genreId: 1, genre: GENRES[0] },
  { id: 2, title: 'Petals of Blood', author: 'Ngugi wa Thiongo', isbn: '9780143026358', description: 'Land and struggle in Kenya.', coverImage: null, totalCopies: 2, availableCopies: 0, genreId: 1, genre: GENRES[0] },
  { id: 3, title: 'Clean Code', author: 'Robert C. Martin', isbn: '9780132350884', description: 'Writing readable code.', coverImage: null, totalCopies: 3, availableCopies: 3, genreId: 2, genre: GENRES[1] },
  { id: 4, title: 'The Pragmatic Programmer', author: 'Andrew Hunt', isbn: '9780135957059', description: 'Practical advice.', coverImage: null, totalCopies: 2, availableCopies: 2, genreId: 2, genre: GENRES[1] },
];

const b64url = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

// Builds a token shaped like the API's JWT: header.payload.signature
export function fakeToken({ sub = 7, role = 'PATRON', exp = Math.floor(Date.now() / 1000) + 3600 } = {}) {
  return `${b64url({ alg: 'HS256', typ: 'JWT' })}.${b64url({ sub, role, exp })}.signature`;
}

// Pretends to be the Nest API for GET requests
export function mockApi({ books = BOOKS, genres = GENRES } = {}) {
  return vi.spyOn(axios, 'get').mockImplementation((url, config = {}) => {
    const path = url.replace(/^https?:\/\/[^/]+/, '');
    if (path === '/genres') return Promise.resolve({ data: genres });
    if (path === '/books') {
      const { genreId, search } = config.params ?? {};
      let list = books;
      if (genreId) list = list.filter((b) => String(b.genreId) === String(genreId));
      if (search) list = list.filter((b) => `${b.title} ${b.author}`.toLowerCase().includes(search.toLowerCase()));
      return Promise.resolve({ data: list });
    }
    const one = path.match(/^\/books\/(.+)$/);
    if (one) {
      const book = books.find((b) => String(b.id) === one[1]);
      return book
        ? Promise.resolve({ data: book })
        : Promise.reject(Object.assign(new Error('Not Found'), { response: { status: 404, data: {} } }));
    }
    return Promise.reject(new Error(`unexpected GET ${url}`));
  });
}

export const apiError = (status, message) =>
  Object.assign(new Error(`HTTP ${status}`), { response: { status, data: { message } } });
export const networkError = () => Object.assign(new Error('Network Error'), { isAxiosError: true });

// Renders the whole app at a URL, like a browser opening that page
export function renderApp(path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>,
  );
}
