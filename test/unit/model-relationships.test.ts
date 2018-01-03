import { expect, sinon } from '../test-helper';
import { Author, Genre } from '../fixtures';

describe('Model relationships', () => {
  it('supports direct assignment of models', () => {
    let author = new Author();
    author.genre = new Genre({ name: 'Horror' });
    expect(author.genre).to.be.instanceof(Genre);
    expect(author.genre.name).to.eq('Horror');
  });

  it('supports direct assignment of objects', () => {
    let author = new Author();
    author.genre = { name: 'Horror' } as any;
    expect(author.genre).to.be.instanceof(Genre);
    expect(author.genre.name).to.eq('Horror');
  });

  it('supports constructor assignment of models', () => {
    let genre = new Genre({ name: 'Horror' });
    let author = new Author({ genre: genre });
    expect(author.genre).to.be.instanceof(Genre);
    expect(author.genre.name).to.eq('Horror');
  });

  it('supports constructor assignment of objects', () => {
    let author = new Author({ genre: { name: 'Horror' }});
    expect(author.genre).to.be.instanceof(Genre);
    expect(author.genre.name).to.eq('Horror');
  });

  it('defaults hasMany to empty collection', () => {
    let genre = new Genre();
    expect(genre.authors.length).to.eql(0);
  });

  it('has enumerable properties', () => {
    let genre = new Genre({ name: 'Horror' });
    let author = new Author({ genre: genre });
    let keys = Object.keys(author);

    expect(keys).to.include('genre');
  });
});
