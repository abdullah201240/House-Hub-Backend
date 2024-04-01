import { Signup, Login ,Search,Join,HouseInfo} from '../controllers/userController.js';
import { HouseOwnerLogin, HouseOwnerSignup,HouseOwnerRequest,Housemember } from '../controllers/houseOwnerController.js';
import upload from '../middleware/upload.js'; 
import cors from 'cors';
import express from 'express';
import {AdminSignup,AdminLogin,HousePandingList,UpdateHouseOwnerStatus,HouseList,UserList,AdminList} from "../controllers/adminController.js"

const router = express.Router();
router.use(cors());

router.post("/signup", Signup);
router.post('/login', Login);
router.post('/HouseOwnerLogin', HouseOwnerLogin);
router.post('/HouseOwnerSignup', upload.single('addressproof'), HouseOwnerSignup);
router.post('/AdminSignup', upload.single('photo'), AdminSignup);
router.post('/AdminLogin',AdminLogin);
router.get('/housePandingList',HousePandingList);
router.put('/AdminUpdateHouseOwnerStatus/:email/updateStatus',UpdateHouseOwnerStatus);

router.get('/HouseList',HouseList);
router.get('/UserList',UserList);
router.get('/AdminList',AdminList);

router.get('/Search',Search);


router.post('/Join',Join);
router.post('/HouseInfo',HouseInfo);
router.get('/HouseOwnerRequest',HouseOwnerRequest);

router.get('/Housemember',Housemember);





export default router;
