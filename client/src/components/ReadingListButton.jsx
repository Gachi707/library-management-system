import { useReadingList } from '../context/ReadingListContext.jsx';

// Adds a book to the reading list, or removes it if it is already there
function ReadingListButton({ book }) {
  const { addBook, removeBook, isInList } = useReadingList();
  const saved = isInList(book.id);

  return (
    <button
      type="button"
      onClick={() => (saved ? removeBook(book.id) : addBook(book))}
      aria-label={`${saved ? 'Remove from reading list' : 'Add to reading list'}: ${book.title}`}
      className={`w-full rounded-lg border px-3 py-2 text-sm font-medium transition ${
        saved
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          : 'border-slate-300 bg-white text-slate-700 hover:border-indigo-400 hover:text-indigo-700'
      }`}
    >
      {saved ? 'Remove from reading list' : 'Add to reading list'}
    </button>
  );
}

export default ReadingListButton;
