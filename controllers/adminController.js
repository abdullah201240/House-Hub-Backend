import Admin from '../model/adminModel.js';
import bcrypt from 'bcrypt';
import HouseOwner from '../model/houseOwner.js';
import User from '../model/userModel.js';
import {createTransport} from 'nodemailer'
import {user,pass} from '../config.js'

const HTTP_STATUS_OK = 200;
const HTTP_STATUS_CREATED = 201;
const HTTP_STATUS_BAD_REQUEST = 400;
const HTTP_STATUS_UNAUTHORIZED = 401;
const HTTP_STATUS_INTERNAL_SERVER_ERROR = 500;

const generateRandomNumber = () => {
  return Math.floor(Math.random() * 1000);
};

const AdminSignup = async (req, res) => {
  try {
    const { name, address, phone, email, password } = req.body;

    if (!name || !address || !phone || !email || !password) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({ error: 'Missing required fields' });
    }

    const photo = req.file && req.file.path;

    const existingUser = await Admin.findOne({ email });
    if (existingUser) {
      return res.status(HTTP_STATUS_BAD_REQUEST).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password || '', 10);
    const randomNumber = generateRandomNumber();
    const generatedUsername = `${req.body.name.replace(/\s+/g, '')}${randomNumber}`;

    const newadmin = new Admin({
      name,
      address,
      photo,
      phone,
      email,
      password: hashedPassword,
      username: generatedUsername,
    });

    await newadmin.save();

    return res.status(HTTP_STATUS_CREATED).json({ message: 'Admin created successfully' });
  } catch (error) {
    console.error('Error in Admin:', error);
    return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};

const AdminLogin = async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(HTTP_STATUS_BAD_REQUEST).json({ error: 'Missing username or password' });
      }

      const admin = await Admin.findOne({ email });  

      if (!admin) {
          return res.status(HTTP_STATUS_UNAUTHORIZED).json({ error: 'Invalid credentials' });
      }

      const passwordMatch = await bcrypt.compare(password, admin.password);

      if (!passwordMatch) {
          return res.status(HTTP_STATUS_UNAUTHORIZED).json({ error: 'Invalid credentials' });
      }

      const { username: adminUsername, photo, name,address,phone } = admin;

      
      

      return res.status(HTTP_STATUS_OK).json({
        message: 'Login successful',
        data: {
            username: adminUsername,
            email,
            address,
            phone,
            photo,
            name,
        },
    });
  } catch (error) {
      console.error('Error in adminLogin:', error);
      return res.status(HTTP_STATUS_INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' });
  }
};


const HousePandingList = async (req, res) => {
  try {
    const houseOwners = await HouseOwner.find({ status: 'Pending' });
    res.json(houseOwners);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
const UpdateHouseOwnerStatus = async (req, res) => {
  try {
    const { email } = req.params;
    const { newStatus } = req.body;

    const updatedOwner = await HouseOwner.findOneAndUpdate({ email }, { status: newStatus }, { new: true });

    const transporter = createTransport({
      host: "smtp-relay.sendinblue.com",
      port: 587,
      auth: {
        user: user,
        pass:pass,
      }
    });
    const mailOptions = {
      from: 'househub@gmail.com',
      to: email, 
      subject: `Your House Approval Request has been Accepted by HouseHub!`,
      html: `Great news! Your house approval request has been accepted by HouseHub!<br> 
             Congratulations on meeting our standards. You're now a valued member of our community!<br>
             Best,<br>
             HouseHub Team`
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

const HouseList = async (req, res) => {
  try {
    const houseOwners = await HouseOwner.find({ status: 'Accepted' });
    res.json(houseOwners);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
const UserList = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users); 
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}

const AdminList = async (req, res) => {
  try {
    const admin = await Admin.find();
    res.json(admin); 
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}


export { AdminSignup, AdminLogin, HousePandingList, UpdateHouseOwnerStatus,HouseList,UserList,AdminList};
  


