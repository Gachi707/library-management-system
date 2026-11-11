// Shows the book's cover image, or a coloured placeholder when it has none
function BookCover({ book, className = 'h-40' }) {
  if (book.coverImage) {
    return (
      <img
        src={book.coverImage}
        alt={`Cover of ${book.title}`}
        className={`${className} w-full object-cover`}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      className={`${className} flex w-full items-center justify-center bg-gradient-to-br from-indigo-500 to-violet-600 text-5xl font-bold text-white`}
    >
      {book.title.charAt(0).toUpperCase()}
    </div>
  );
}

export default BookCover;
