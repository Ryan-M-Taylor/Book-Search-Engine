// import user model
const { User, Book } = require('../models');
// import sign token function from auth
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    async me(_, __, { user }) {
      if (!user) {
        return null;
      }

      const userData = await User.findOne({ _id: user._id })
        .select('-__v -password')
        .populate('savedBooks');

      return userData;
    },
    async getAllBooks() {
      const books = await Book.find();
      return books;
    },
    async getBookById(_, { bookId }) {
      const book = await Book.findOne({ _id: bookId });
      return book;
    },
  },
  Mutation: {
    async addUser(_, { userInput }) {
      const user = await User.create(userInput);

      if (!user) {
        return { message: 'Something is wrong!' };
      }
      const token = signToken(user);
      return { token, user };
    },
    async login(_, { username, password }) {
      const user = await User.findOne({ username });

      if (!user) {
        return { message: "Can't find this user" };
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        return { message: 'Wrong password!' };
      }

      const token = signToken(user);
      return { token, user };
    },
    async saveBook(_, { bookInput }, { user }) {
      try {
        const updatedUser = await User.findOneAndUpdate(
          { _id: user._id },
          { $addToSet: { savedBooks: bookInput } },
          { new: true, runValidators: true }
        ).populate('savedBooks');
        return updatedUser;
      } catch (err) {
        console.log(err);
        return err;
      }
    },
    async deleteBook(_, { bookId }, { user }) {
      const updatedUser = await User.findOneAndUpdate(
        { _id: user._id },
        { $pull: { savedBooks: { bookId } } },
        { new: true }
      ).populate('savedBooks');
      if (!updatedUser) {
        return { message: "Couldn't find user with this id!" };
      }
      return updatedUser;
    },
    async addBook(_, { bookInput }) {
      const book = await Book.create(bookInput);
      return book;
    },
    async updateBook(_, { bookId, bookInput }) {
      const updatedBook = await Book.findOneAndUpdate(
        { _id: bookId },
        { $set: bookInput },
        { new: true }
      );
      return updatedBook;
    },
    async deleteBookById(_, { bookId }) {
      const deletedBook = await Book.findOneAndDelete({ _id: bookId });
      return deletedBook;
    },
  },
};

module.exports = resolvers;
