import express from 'express';
import { 
  loginUser, 
  registerUser, 
  toggleFavorite, 
  getFavorites, 
  getAddresses, 
  saveAddress, 
  deleteAddress 
} from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

// Favorites endpoints
userRouter.post("/favorites/toggle", authMiddleware, toggleFavorite);
userRouter.get("/favorites", authMiddleware, getFavorites);

// Addresses endpoints
userRouter.get("/addresses", authMiddleware, getAddresses);
userRouter.post("/addresses/save", authMiddleware, saveAddress);
userRouter.post("/addresses/delete", authMiddleware, deleteAddress);

export default userRouter;