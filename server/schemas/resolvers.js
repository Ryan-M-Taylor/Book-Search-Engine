// import user model
const { User } = require('../models');
// import sign token function from auth
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    // get a single user by either their id or their username
    async me(_, __, { user }) {
      if (!user) {
        return null;
      }

      const userData = await User.findOne({ _id: user._id })
        .select('-__v -password')
        .populate('savedBooks');

      return userData;
    },
  },
  Mutation: {
    // create a user, sign a token, and send it back (to client/src/components/SignUpForm.js)
    async addUser(_, userInput ) {
      const user = await User.create(userInput);

      if (!user) {
        return { message: 'Something is wrong!' };
      }
      const token = signToken(user);
      return { token, user };
    },
    // login a user, sign a token, and send it back (to client/src/components/LoginForm.js)
    async login(_, { email, password }) {

      const user = await User.findOne({ email });

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
    // save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
    // user comes from `req.user` created in the auth middleware function
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
    // remove a book from `savedBooks`
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
  },
};

module.exports = resolvers;