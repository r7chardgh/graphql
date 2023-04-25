const Event = require("../../models/event");
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

      createdEvent = transformEvent(res);
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
};
