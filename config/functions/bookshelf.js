'use strict';

module.exports = (bookshelf, connection) => {
  bookshelf.plugin(require('bookshelf-uuid'));
};
