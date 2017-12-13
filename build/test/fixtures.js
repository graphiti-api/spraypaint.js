"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var index_1 = require("../src/index");
var ApplicationRecord = /** @class */ (function (_super) {
    __extends(ApplicationRecord, _super);
    function ApplicationRecord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ApplicationRecord.baseUrl = 'http://example.com';
    ApplicationRecord.apiNamespace = '/api';
    return ApplicationRecord;
}(index_1.Model));
exports.ApplicationRecord = ApplicationRecord;
// typescript class
var Person = /** @class */ (function (_super) {
    __extends(Person, _super);
    function Person() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.firstName = index_1.attr();
        _this.lastName = index_1.attr();
        return _this;
    }
    Person.endpoint = '/v1/people';
    Person.jsonapiType = 'people';
    return Person;
}(ApplicationRecord));
exports.Person = Person;
var PersonWithExtraAttr = /** @class */ (function (_super) {
    __extends(PersonWithExtraAttr, _super);
    function PersonWithExtraAttr() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.extraThing = index_1.attr({ persist: false });
        return _this;
    }
    return PersonWithExtraAttr;
}(Person));
exports.PersonWithExtraAttr = PersonWithExtraAttr;
var PersonWithoutCamelizedKeys = /** @class */ (function (_super) {
    __extends(PersonWithoutCamelizedKeys, _super);
    function PersonWithoutCamelizedKeys() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.first_name = index_1.attr();
        return _this;
    }
    PersonWithoutCamelizedKeys.camelizeKeys = false;
    return PersonWithoutCamelizedKeys;
}(Person));
exports.PersonWithoutCamelizedKeys = PersonWithoutCamelizedKeys;
// Ensure setup() can be run multiple times with no problems
// putting this here, otherwise relations wont be available.
index_1.Config.setup();
// plain js class
var Author = Person.extend({
    static: {
        endpoint: '/v1/authors',
        jsonapiType: 'authors'
    },
    nilly: index_1.attr(),
    multiWords: index_1.hasMany('multi_words'),
    specialBooks: index_1.hasMany('books'),
    books: index_1.hasMany(),
    tags: index_1.hasMany(),
    genre: index_1.belongsTo('genres'),
    bio: index_1.hasOne('bios')
});
exports.Author = Author;
var NonFictionAuthor = Author.extend({
    static: {
        endpoint: '/v1/non_fiction_authors',
        jsonapiType: 'non_fiction_authors',
        camelizeKeys: false
    },
    nilly: index_1.attr(),
    multi_words: index_1.hasMany('multi_words'),
    special_books: index_1.hasMany('books'),
    books: index_1.hasMany(),
    tags: index_1.hasMany(),
    genre: index_1.belongsTo('genres'),
    bio: index_1.hasOne('bios')
});
exports.NonFictionAuthor = NonFictionAuthor;
var Book = /** @class */ (function (_super) {
    __extends(Book, _super);
    function Book() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.title = index_1.attr();
        _this.genre = index_1.belongsTo('genres');
        _this.author = index_1.hasOne('authors');
        return _this;
    }
    Book.jsonapiType = 'books';
    return Book;
}(ApplicationRecord));
exports.Book = Book;
var Genre = /** @class */ (function (_super) {
    __extends(Genre, _super);
    function Genre() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.authors = index_1.hasMany('authors');
        _this.name = index_1.attr();
        return _this;
    }
    Genre.jsonapiType = 'genres';
    return Genre;
}(ApplicationRecord));
exports.Genre = Genre;
var Bio = /** @class */ (function (_super) {
    __extends(Bio, _super);
    function Bio() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.description = index_1.attr();
        return _this;
    }
    Bio.jsonapiType = 'bios';
    return Bio;
}(ApplicationRecord));
exports.Bio = Bio;
var Tag = /** @class */ (function (_super) {
    __extends(Tag, _super);
    function Tag() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.name = index_1.attr();
        return _this;
    }
    Tag.jsonapiType = 'tags';
    return Tag;
}(ApplicationRecord));
exports.Tag = Tag;
var MultiWord = /** @class */ (function (_super) {
    __extends(MultiWord, _super);
    function MultiWord() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MultiWord.jsonapiType = 'multi_words';
    return MultiWord;
}(ApplicationRecord));
var TestJWTSubclass = ApplicationRecord.extend({});
exports.TestJWTSubclass = TestJWTSubclass;
var NonJWTOwner = index_1.Model.extend({});
exports.NonJWTOwner = NonJWTOwner;
var configSetup = function (opts) {
    if (opts === void 0) { opts = {}; }
    opts['jwtOwners'] = [ApplicationRecord, TestJWTSubclass];
    index_1.Config.setup(opts);
};
exports.configSetup = configSetup;
configSetup();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZml4dHVyZXMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi90ZXN0L2ZpeHR1cmVzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsc0NBQStFO0FBRS9FO0lBQWdDLHFDQUFLO0lBQXJDOztJQUdBLENBQUM7SUFGUSx5QkFBTyxHQUFHLG9CQUFvQixDQUFDO0lBQy9CLDhCQUFZLEdBQUcsTUFBTSxDQUFDO0lBQy9CLHdCQUFDO0NBQUEsQUFIRCxDQUFnQyxhQUFLLEdBR3BDO0FBd0dDLDhDQUFpQjtBQXRHbkIsbUJBQW1CO0FBQ25CO0lBQXFCLDBCQUFpQjtJQUF0QztRQUFBLHFFQU1DO1FBRkMsZUFBUyxHQUFXLFlBQUksRUFBRSxDQUFDO1FBQzNCLGNBQVEsR0FBVyxZQUFJLEVBQUUsQ0FBQzs7SUFDNUIsQ0FBQztJQUxRLGVBQVEsR0FBRyxZQUFZLENBQUM7SUFDeEIsa0JBQVcsR0FBRyxRQUFRLENBQUM7SUFJaEMsYUFBQztDQUFBLEFBTkQsQ0FBcUIsaUJBQWlCLEdBTXJDO0FBb0dDLHdCQUFNO0FBbEdSO0lBQWtDLHVDQUFNO0lBQXhDO1FBQUEscUVBRUM7UUFEQyxnQkFBVSxHQUFXLFlBQUksQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQyxDQUFDOztJQUNoRCxDQUFDO0lBQUQsMEJBQUM7QUFBRCxDQUFDLEFBRkQsQ0FBa0MsTUFBTSxHQUV2QztBQWlHQyxrREFBbUI7QUEvRnJCO0lBQXlDLDhDQUFNO0lBQS9DO1FBQUEscUVBSUM7UUFEQyxnQkFBVSxHQUFXLFlBQUksRUFBRSxDQUFDOztJQUM5QixDQUFDO0lBSFEsdUNBQVksR0FBRyxLQUFLLENBQUM7SUFHOUIsaUNBQUM7Q0FBQSxBQUpELENBQXlDLE1BQU0sR0FJOUM7QUE0RkMsZ0VBQTBCO0FBMUY1Qiw0REFBNEQ7QUFDNUQsNERBQTREO0FBQzVELGNBQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUVmLGlCQUFpQjtBQUNqQixJQUFJLE1BQU0s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