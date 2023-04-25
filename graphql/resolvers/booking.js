const Event = require("../../models/event");
const Booking = require("../../models/booking");
const { transformEvent,transformBooking } = require("./merge");

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      return bookings.map((booking) => {
        return transformBooking(booking);
      });
    } catch (error) {
      throw error;
    }
  },
  bookEvent: async (args) => {
    const fetchedEvent = await Event.findOne({ _id: args.eventId });

    const booking = new Booking({
      user: "6447872cbfbbf0f5d5236f3a",
      event: fetchedEvent,
    });

    const res = await booking.save();
    return transformBooking(res);
  },
  cancelBooking: async (args) => {
    try {
      const booking = await Booking.findById(args.bookingId).populate("event");
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });

      return event;
    } catch (error) {
      throw error;
    }
  },
};
