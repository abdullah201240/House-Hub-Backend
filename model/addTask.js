import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  taskName: {
    type: String,
    required: true
  },
  taskDescription:{
    type: String,
    required: true

  },
  taskDate:{
    type: String,
    required: true

  },

  taskStatus: {
    type: String,
    required: true
  },
  taskAllocatorName: {
    type: String,
    required: true
  },
  taskAllocatorPhone: {
    type: String,
    required: true
  },
  taskAllocatorEmail: {
    type: String,
    required: true
  },
  houseOwnerName: {
    type: String,
    required: true
  },
  houseOwnerEmail: {
    type: String,
    required: true
  },
  houseOwnerPhone: {
    type: String,
    required: true
  }
  
} , {timestamps: true}) ;

const Task = mongoose.model('Task', taskSchema);

export default Task;
