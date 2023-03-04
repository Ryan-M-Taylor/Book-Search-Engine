const jwt = require('jsonwebtoken');

// set token secret and expiration date
const secret = 'mysecretsshhhhh';
const expiration = '2h';

module.exports = {
  // function for our authenticated routes
  authMiddleware: function ({ req, res, next }) {
    // allows token to be sent via headers
    const token = req.headers.authorization ? req.headers.authorization.split(' ')[1] : '';

    if (!token) {
      return res.status(401).json({ message: 'You must be logged in to do that!' });
    }

    // verify token and get user data out of it
    try {
      const { data } = jwt.verify(token, secret, { maxAge: expiration });
      req.user = data;
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
    }

    // send to next endpoint
    return next();
  },
  
  signToken: function ({ username, email, _id }) {
    const payload = { username, email, _id };

    return jwt.sign({ data: payload }, secret, { expiresIn: expiration });
  },
};

