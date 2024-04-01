import mongoose from 'mongoose';

const houseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address:{
    type: String,
    required: true

  },
  addressproof:{
    type: String,
    required: true

  },

  phone: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "Pending"
  }
} , {timestamps: true}) ;

const HouseOwner = mongoose.model('HouseOwner', houseSchema);

export default HouseOwner;
