const Event = require("../../models/event");
const User = require("../../models/user");
const { transformEvent } = require("./merge");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      return events.map((event) => {
        return transformEvent(event);
      });
    } catch (error) {
      throw error;
    }
  },
  createEvent: async (args, req) => {
    if (!req.isAuth) {
      throw new Error("Unauthenticated!");
    }
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
      creator:  req.userId,
    });
    let createdEvent;
    try {
      const res = await event.save();

      createdEvent = transformEvent(res);
      const findUser = await User.findById( req.userId);

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
};
