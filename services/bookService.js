const { Book } = require("../models/Book/Book");

const updateBook = async (dataToBeUpdated, whereQuery) => {
  try {
    let updatedBook = await Book.update(dataToBeUpdated, whereQuery);

    return updatedBook;
  } catch (err) {
    throw err;
  }
};

module.exports = { updateBook };
