import User from '../model/userModel.js';
import bcrypt from 'bcrypt';
import HouseOwner from '../model/houseOwner.js';
import JoinHouse from '../model/joinHouseModel.js';
import Task from '../model/addTask.js';
const Signup = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, phone, email, password: hashedPassword });
    await newUser.save();

    return res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error('Error in signup:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};
const Login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const { name, address, phone } = user;
    return res.status(200).json({
      message: 'Login successful',
      data: {
        email,
        address,
        phone,
        name,
      },
    });
  } catch (error) {
    console.error('Error in login:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

const Search = async (req, res) => {
  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ error: 'No search query provided' });
}
try {
  const results = await HouseOwner.find({ email: { $regex: query, $options: 'i' } });

  res.json({ results }); 
} catch (err) {
  console.error('Error searching:', err);
  res.status(500).json({ error: 'Internal server error' });
}

}
const Join = async (req, res) => {
  try {
    const { houseOwner, userInfo } = req.body;

    const email = userInfo.email;
    const username = userInfo.name;
    const userphone = userInfo.phone;
    const houseOwneremail = houseOwner.email;
    const houseOwnername = houseOwner.name;
    const houseOwneraddress = houseOwner.address;
    const housephoto = houseOwner.addressproof;

    const existingUser = await JoinHouse.findOne({ userEmail: email });

    if (existingUser) {
      return res.status(400).json({ message: 'User already has a house, not allowed to join' });
    }
  
    const newUser = new JoinHouse({
      userName: username,
      userEmail: email, 
      userPhone: userphone, 
      houseOwnerEmail: houseOwneremail, 
      houseOwnerName: houseOwnername, 
      houseOwnerAddress: houseOwneraddress, 
      housePhoto: housephoto 
    });
    await newUser.save();

    return res.status(201).json({ message: 'User joined the house successfully' });
  } catch (error) {
    console.error('Error joining house:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
const HouseInfo = async (req, res) => {
  try {
    const { userEmail } = req.body;

    if (!userEmail) {
      return res.status(400).json({ error: 'User email is required' });
    }

    const houseInfo = await JoinHouse.find({ userEmail });

    if (!houseInfo || houseInfo.length === 0) {
      return res.status(404).json({ error: 'House information not found for the given user' });
    }

    return res.json(houseInfo);
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
const UserTask = async (req, res) => {
  const email = req.query.email;
  try {

    const owners = await Task.find({ taskAllocatorEmail: email }).sort({ taskDate: 1 }); 

    owners.forEach(owner => {
      console.log(owner.taskDate);
    });

    res.json(owners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
const UserUpdateTask = async (req, res) => {
  try {
    const id = req.params.id;
    

    const updatedTask = await Task.findByIdAndUpdate(id, { taskStatus: "completed" }, { new: true });

    if (!updatedTask) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(updatedTask);
  } catch (error) {
    console.error('Error updating task status:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
const Profile = async (req, res) => {
  const email = req.query.email;

  const user = await User.find({ email: email }); 
  res.status(200).json({user});
}
const UpdateProfile = async (req, res) => {
  const { name, phone, email } = req.body;
  console.log('Name:', name);
  console.log('Phone:', phone);
  console.log('Email:', email);

  try {
    let updatedUserData = { name: name, phone: phone };
    if (req.file) {
      console.log('File uploaded:', req.file);
      updatedUserData.photo = req.file.path; 
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: email }, 
      updatedUserData, 
      { new: true } 
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}






export { Signup, Login,Search ,Join,HouseInfo,UserTask,UserUpdateTask,Profile,UpdateProfile};



