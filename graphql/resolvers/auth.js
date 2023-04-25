const bcrypt = require("bcryptjs");
const User = require("../../models/user");

module.exports = {
  createUser: async (args) => {
    try {
      const findUser = await User.findOne({ email: args.userInput.email });

      if (findUser) {
        throw new Error("User exists already.");
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword,
      });
      const res = await user.save();

      return { ...res._doc, password: null, _id: res.id };
    } catch (error) {
      throw error;
    }
  },
};
