import HouseOwner from '../model/houseOwner.js';
import bcrypt from 'bcrypt';
import JoinHouse from '../model/joinHouseModel.js';
import Task from '../model/addTask.js';
import User from '../model/userModel.js';
import {createTransport} from 'nodemailer'
import {user,pass} from '../config.js'

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

const houseOwnerSignup = async (req, res) => {
  try {
    const { name, address, phone, email, password } = req.body;

    if (!name || !address || !phone || !email || !password) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({ error: 'Missing required fields' });
    }

    const addressproof = req.file ? req.file.path : null;

    const existingUser = await HouseOwner.findOne({ email });
    if (existingUser) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || '', 10);

    const newHouseOwner = new HouseOwner({
      name,
      address,
      addressproof,
      phone,
      email,
      password: hashedPassword,
    });

    await newHouseOwner.save();

    return res.status(HTTP_STATUS_CREATED).json({ message: 'House owner created successfully' });
  } catch (error) {
    console.error('Error in houseOwnerSignup:', error);
    return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};

const houseOwnerLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({ error: 'Missing email or password' });
    }

    const houseOwner = await HouseOwner.findOne({ email });

    if (!houseOwner) {
      return res.status(HTTP_STATUS_UNAUTHORIZED).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, houseOwner.password);

    if (!passwordMatch) {
      return res.status(HTTP_STATUS_UNAUTHORIZED).json({ error: 'Invalid credentials' });
    }

    if (houseOwner.status !== 'Accepted') {
      return res.status(HTTP_STATUS_UNAUTHORIZED).json({ error: 'Your account is not yet accepted' });
    }

    const { name, address, phone,addressproof } = houseOwner;
    return res.status(200).json({
      message: 'Login successful',
      data: {
        email,
        address,
        phone,
        name,
        addressproof,
      },
    });

  } catch (error) {
    console.error('Error in houseOwnerLogin:', error);
    return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};

const HouseOwnerRequest = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ error: 'Email parameter is missing.' });
    }

    const pendingInfo = await JoinHouse.find({ houseOwnerEmail: query }).exec();
    
    if (!pendingInfo || pendingInfo.length === 0) {
      return res.status(404).json({ message: 'No pending info found for the provided email.' });
    }

    return res.json({ pending_info: pendingInfo });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
const Housemember = async (req, res) => {
  const email = req.query.email;
  try {
    const owners = await JoinHouse.find({ houseOwnerEmail: email  });
    res.json(owners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }

}
const UpdateUserStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const { newStatus } = req.body;

    const updatedOwner = await JoinHouse.findOneAndUpdate({ userEmail: email }, { status: newStatus }, { new: true });

    let subject, message;
    if (newStatus === "Accepted") {
      subject = `Your House Approval Request has been Accepted by HouseHub!`;
      message = `Great news! Your house approval request has been accepted by HouseHub!<br> Congratulations on meeting our standards. You're now a valued member of our community!<br> Best,<br> HouseHub Team`;
    } else if (newStatus === "Rejected") {
      subject = `Your House Approval Request has been Rejected by HouseHub`;
      message = `We're sorry to inform you that your house approval request has been rejected by HouseHub.<br> If you have any questions or concerns, please feel free to contact us.<br> Best,<br> HouseHub Team`;
    } else {
      return res.status(400).json({ error: "Invalid status" });
    }

    const transporter = createTransport({
      host: "smtp-relay.sendinblue.com",
      port: 587,
      auth: {
        user: user,
        pass: pass,
      }
    });

    const mailOptions = {
      from: 'househub@gmail.com',
      to: email,
      subject: subject,
      html: message
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });

    if (!updatedOwner) {
      return res.status(404).json({ error: 'House owner not found' });
    }

    res.json(updatedOwner);
  } catch (error) {
    console.error('Error updating house owner status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const HouseOwnerAddTask = async (req, res) => {
  try {
    const { taskName, taskDescription, taskDate, houseOwnerName, houseOwnerEmail, houseOwnerPhone, allocatorEmail } = req.body;

    const allocatorDetails = await User.findOne({ email: allocatorEmail });

    if (!allocatorDetails) {
      return res.status(404).json({ message: "Allocator not found." });
    }

    const { name: taskAllocatorName, phone: taskAllocatorPhone } = allocatorDetails;

    const newTask = new Task({
      taskName,
      taskDescription,
      taskDate,
      taskStatus: "pending",
      taskAllocatorName,
      taskAllocatorPhone,
      taskAllocatorEmail: allocatorEmail,
      houseOwnerName,
      houseOwnerEmail,
      houseOwnerPhone
    });

    await newTask.save();

    res.status(201).json({ message: 'Task created successfully.', task: newTask });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }

}
const HouseOwnerTask = async (req, res) => {
  const email = req.query.email;
  try {

    const owners = await Task.find({ houseOwnerEmail: email }).sort({ taskDate: 1 }); 

    owners.forEach(owner => {
      console.log(owner.taskDate);
    });

    res.json(owners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
const HouseOwnerTaskDelete = async (req, res) => {
  try {
    const id = req.params.id;
    const task = await Task.findByIdAndDelete(id);
    if (task) {
      return res.status(200).json({ message: 'Task deleted successfully' });
    } else {
      return res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
const HouseOwnerProfile = async (req, res) => {
  const email = req.query.email;

  const owners = await HouseOwner.find({ email: email }); 
  res.status(200).json({owners});
}



const HouseOwnerUpdateProfile = async (req, res) => {
  try {
    const { email } = req.params;
    const { phone } = req.body;
    const updatedHouseOwner = await HouseOwner.findOneAndUpdate({ email }, { phone }, { new: true });
    if (!updatedHouseOwner) {
      return res.status(404).json({ error: 'House owner not found' });
    }
    res.json({ message: 'Phone number updated successfully', updatedHouseOwner });


  } catch (error) {
    console.error('Error updating phone number:', error);
    res.status(500).json({ error: 'Internal server error' });  }
};



export { houseOwnerSignup as HouseOwnerSignup, houseOwnerLogin as HouseOwnerLogin ,HouseOwnerRequest,Housemember,UpdateUserStatus,HouseOwnerAddTask,HouseOwnerTask,HouseOwnerTaskDelete,HouseOwnerProfile,HouseOwnerUpdateProfile};
