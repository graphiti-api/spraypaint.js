/// <reference path="../../index.d.ts" />

import { sinon } from '../../test/test-helper';
import { Author, Genre } from '../fixtures';

describe('Model relationships', function() {
  it('supports direct assignment of models', function() {
    let author = new Author();
    author.genre = new Genre({ name: 'Horror' });
    expect(author.genre).to.be.instanceof(Genre);
    expect(author.genre.name).to.eq('Horror');
  });

  it('supports direct assignment of objects', function() {
    let author = new Author();
    author.genre = { name: 'Horror' };
    expect(author.genre).to.be.instanceof(Genre);
    expect(author.genre.name).to.eq('Horror');
  });

  it('supports constructor assignment of models', function() {
    let genre = new Genre({ name: 'Horror' });
    let author = new Author({ genre: genre });
    expect(author.genre).to.be.instanceof(Genre);
    expect(author.genre.name).to.eq('Horror');
  });

  it('supports constructor assignment of objects', function() {
    let author = new Author({ genre: { name: 'Horror' }});
    expect(author.genre).to.be.instanceof(Genre);
    expect(author.genre.name).to.eq('Horror');
  });

  it('defaults hasMany to empty collection', function() {
    let genre = new Genre();
    expect(genre.authors.length).to.eql(0);
  });
});
