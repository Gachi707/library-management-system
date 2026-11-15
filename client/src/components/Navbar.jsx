import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useReadingList } from '../context/ReadingListContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const linkClass = ({ isActive }) =>
  `rounded-md px-3 py-2 text-sm font-medium ${
    isActive ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-indigo-700'
  }`;

function Navbar() {
  // Read the shared reading list straight from the context: no props passed down
  const { readingList } = useReadingList();
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const count = readingList.length;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3"
      >
        <Link to="/" className="text-xl font-bold text-indigo-700">
          Library Catalog
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={linkClass}>
            Catalog
          </NavLink>

          <NavLink to="/reading-list" className={linkClass}>
            Reading list
            <span
              data-testid="reading-list-count"
              className={`ml-2 inline-flex min-w-6 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-semibold ${
                count > 0 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}
            >
              {count}
            </span>
          </NavLink>

          <NavLink to="/book-space" className={linkClass}>
            Book a space
          </NavLink>

          {isAuthenticated ? (
            <>
              <span className="px-2 text-xs text-slate-500">
                {user?.role === 'LIBRARIAN' ? 'Librarian' : 'Signed in'}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md px-3 py-2 text-sm font-medium text-slate-600 hover:text-rose-700"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Log in
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Sign up
              </NavLink>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Navbar;
