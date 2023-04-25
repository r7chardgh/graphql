const bcrypt = require("bcryptjs");

const Event = require("../../models/event");
const User = require("../../models/user");

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return {
        ...event._doc,
        _id: event.id,
        creator: user.bind(this, event._doc.creator),
      };
    });
  } catch (error) {
    throw error;
  }
};

const user = async (userId) => {
  try {
    const user = await User.findById(userId);
    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createdEvents),
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map((event) => {
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator),
        };
      });
    } catch (error) {
      throw error;
    }
  },
  createEvent: async (args) => {
    // const event = {
    //     _id: Math.random().toString(),
    //     title: args.eventInput.title,
    //     description: args.eventInput.description,
    //     price: +args.eventInput.price,
    //     date: args.eventInput.date
    // }
    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "6447872cbfbbf0f5d5236f3a",
    });
    let createdEvent;
    try {
      const res = await event.save();

      createdEvent = {
        ...res._doc,
        _id: res._doc._id.toString(),
        creator: user.bind(this, res._doc.creator),
      };
      const findUser = await User.findById("6447872cbfbbf0f5d5236f3a");

      if (!findUser) {
        throw new Error("User not found.");
      }
      findUser.createdEvents.push(event);
      await findUser.save();

      return createdEvent;
    } catch (error) {
      throw error;
    }
  },
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
