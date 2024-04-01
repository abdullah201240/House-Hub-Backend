import mongoose from 'mongoose';

const joinHouseSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    required: true
  },
  houseOwnerEmail: {
    type: String,
    required: true
  },
  houseOwnerName: {
    type: String,
    required: true
  },
  houseOwnerAddress: {
    type: String,
    required: true
  },
  housePhoto: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "Pending"
  }
}, { timestamps: true });

const JoinHouse = mongoose.model('JoinHouse', joinHouseSchema);

export default JoinHouse;
