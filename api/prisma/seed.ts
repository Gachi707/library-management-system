import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const catalog = [
  {
    name: 'Fiction',
    slug: 'fiction',
    books: [
      {
        title: 'Things Fall Apart',
        author: 'Chinua Achebe',
        isbn: '9780385474542',
        copies: 3,
        description: "Okonkwo's story and the collision between Igbo tradition and colonial rule in Nigeria.",
      },
      {
        title: 'Half of a Yellow Sun',
        author: 'Chimamanda Ngozi Adichie',
        isbn: '9781400095209',
        copies: 2,
        description: 'A novel of three lives caught up in the Nigerian-Biafran War.',
      },
      {
        title: 'Petals of Blood',
        author: 'Ngũgĩ wa Thiong’o',
        isbn: '9780143026358',
        copies: 2,
        description: 'Corruption, land and struggle in post-independence Kenya.',
      },
      {
        title: 'The Alchemist',
        author: 'Paulo Coelho',
        isbn: '9780062315007',
        copies: 4,
        description: "A shepherd boy's journey in search of treasure and his personal legend.",
      },
    ],
  },
  {
    name: 'Science',
    slug: 'science',
    books: [
      {
        title: 'A Brief History of Time',
        author: 'Stephen Hawking',
        isbn: '9780553380163',
        copies: 3,
        description: 'The Big Bang, black holes and the nature of time, explained for general readers.',
      },
      {
        title: 'The Selfish Gene',
        author: 'Richard Dawkins',
        isbn: '9780198788607',
        copies: 2,
        description: 'Evolution seen from the point of view of the gene.',
      },
      {
        title: 'Cosmos',
        author: 'Carl Sagan',
        isbn: '9780345539434',
        copies: 2,
        description: "A tour of the universe and humanity's place in it.",
      },
      {
        title: 'Silent Spring',
        author: 'Rachel Carson',
        isbn: '9780618249060',
        copies: 1,
        description: 'The 1962 warning about pesticides and the damage they do to nature.',
      },
    ],
  },
  {
    name: 'History',
    slug: 'history',
    books: [
      {
        title: 'Long Walk to Freedom',
        author: 'Nelson Mandela',
        isbn: '9780316548182',
        copies: 3,
        description: "Mandela's autobiography, from a rural childhood to the presidency of South Africa.",
      },
      {
        title: 'Sapiens',
        author: 'Yuval Noah Harari',
        isbn: '9780062316110',
        copies: 4,
        description: 'A brief history of humankind from the Stone Age to the present.',
      },
      {
        title: 'Guns, Germs, and Steel',
        author: 'Jared Diamond',
        isbn: '9780393317558',
        copies: 2,
        description: 'Why human societies developed so differently across the continents.',
      },
      {
        title: 'How Europe Underdeveloped Africa',
        author: 'Walter Rodney',
        isbn: '9781788731218',
        copies: 2,
        description: "An analysis of how colonial exploitation shaped Africa's economic position.",
      },
    ],
  },
  {
    name: 'Technology',
    slug: 'technology',
    books: [
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        isbn: '9780132350884',
        copies: 3,
        description: 'A handbook of writing readable, maintainable code.',
      },
      {
        title: 'The Pragmatic Programmer',
        author: 'Andrew Hunt and David Thomas',
        isbn: '9780135957059',
        copies: 2,
        description: 'Practical advice on the craft and habits of working programmers.',
      },
      {
        title: 'Eloquent JavaScript',
        author: 'Marijn Haverbeke',
        isbn: '9781593279509',
        copies: 2,
        description: 'A modern introduction to JavaScript and programming.',
      },
      {
        title: 'Designing Data-Intensive Applications',
        author: 'Martin Kleppmann',
        isbn: '9781449373320',
        copies: 1,
        description: 'The principles behind reliable, scalable and maintainable data systems.',
      },
    ],
  },
];

async function main() {
  for (const g of catalog) {
    // Genres first, because every book needs a genreId that already exists
    const genre = await prisma.genre.upsert({
      where: { slug: g.slug },
      update: {},
      create: { name: g.name, slug: g.slug },
    });

    for (const b of g.books) {
      await prisma.book.upsert({
        where: { isbn: b.isbn },
        update: {},
        create: {
          title: b.title,
          author: b.author,
          isbn: b.isbn,
          description: b.description,
          totalCopies: b.copies,
          availableCopies: b.copies,
          genreId: genre.id,
        },
      });
    }
  }
  console.log('Seeding complete: 4 genres, 16 books');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
