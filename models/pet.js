let mongoose = require("mongoose");

// Pet Schema // Pet can be either Missing or Found
let petSchema = mongoose.Schema({
  Name: {
    type: String,
    required: true,
  },
  Species: {
    type: String,
    required: true,
  },
  Breed: {
    type: String,
    required: true,
  },
  Country: {
    type: String,
    required: true,
  },
  City: {
    type: String,
    required: true,
  },
  Gender: {
    type: String,
    required: true,
  },
  Size: {
    type: String,
    required: true,
  },
  Age: {
    type: Number,
    required: true,
  },
  Color: {
    type: String,
    required: true,
  },
  LastLocationSeen: {
    type: String,
    required: true,
  },
  DateOfMissing: {
    type: Date,
    required: true,
  },
  CurrentStatus: {
    type: String,
    required: true,
  },
  Description: {
    type: String,
    required: true,
  },
  Image: {
    type: String,
  },
  Author: {
    type: String,
    required: true,
  },
});

let Pet = (module.exports = mongoose.model("Pet", petSchema));
