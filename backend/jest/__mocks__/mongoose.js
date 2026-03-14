const mongoose = jest.requireActual('mongoose');

// Mock Mongoose connection
mongoose.connect = jest.fn().mockResolvedValue({
  connection: {
    db: {
      listCollections: jest.fn().mockResolvedValue({
        toArray: jest.fn().mockResolvedValue([]),
      }),
      dropCollection: jest.fn().mockResolvedValue(undefined),
    },
    close: jest.fn().mockResolvedValue(undefined),
  },
});

mongoose.disconnect = jest.fn().mockResolvedValue(undefined);

module.exports = mongoose;
