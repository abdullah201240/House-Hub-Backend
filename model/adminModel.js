import mongoose from 'mongoose';

const adminSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address:{
    type: String,
    required: true

  },
  photo:{
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
  username: {
    type: String,
    required: true
  }
} , {timestamps: true}) ;

const Admin = mongoose.model('Admin', adminSchema);

export default Admin;
