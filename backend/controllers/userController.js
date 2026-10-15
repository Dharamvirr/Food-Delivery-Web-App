import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";
import userModel from "../models/userModel.js";

// Helper to create JWT token
const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET);
};

// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User does not exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Login error:", error);
    res.json({ success: false, message: "Error during login" });
  }
};

// Register user
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    // Check if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User already exists" });
    }

    // Validating email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" });
    }
    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password (min 8 characters)" });
    }

    // Hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({ name, email, password: hashedPassword });
    const user = await newUser.save();
    const token = createToken(user._id);
    res.json({ success: true, token });
  } catch (error) {
    console.error("Register error:", error);
    res.json({ success: false, message: "Error during registration" });
  }
};

// Toggle food item in user's favorites
const toggleFavorite = async (req, res) => {
  const userId = req.userId || req.body.userId;
  const { foodId } = req.body;
  if (!foodId) {
    return res.json({ success: false, message: "Food ID is required" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    const favorites = user.favorites || [];
    const index = favorites.indexOf(String(foodId));
    let isFavorite = false;
    if (index > -1) {
      favorites.splice(index, 1);
      isFavorite = false;
    } else {
      favorites.push(String(foodId));
      isFavorite = true;
    }
    user.favorites = favorites;
    await user.save();
    res.json({ success: true, favorites: user.favorites, isFavorite, message: isFavorite ? "Added to favorites ❤️" : "Removed from favorites" });
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.json({ success: false, message: "Error updating favorites" });
  }
};

// Get user's favorites
const getFavorites = async (req, res) => {
  const userId = req.userId || req.body.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, favorites: user.favorites || [] });
  } catch (error) {
    console.error("Get favorites error:", error);
    res.json({ success: false, message: "Error fetching favorites" });
  }
};

// Get user's saved addresses
const getAddresses = async (req, res) => {
  const userId = req.userId || req.body.userId;
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    res.json({ success: true, addresses: user.addresses || [] });
  } catch (error) {
    console.error("Get addresses error:", error);
    res.json({ success: false, message: "Error fetching addresses" });
  }
};

// Save new address or update existing
const saveAddress = async (req, res) => {
  const userId = req.userId || req.body.userId;
  const addressData = req.body.address;
  if (!addressData || !addressData.street || !addressData.city || !addressData.phone) {
    return res.json({ success: false, message: "Please fill all required address fields" });
  }
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    user.addresses = user.addresses || [];

    const existingIndex = user.addresses.findIndex(
      (a) => (addressData._id && String(a._id) === String(addressData._id)) ||
             (a.street === addressData.street && a.zipcode === addressData.zipcode)
    );

    if (existingIndex > -1) {
      const current = user.addresses[existingIndex].toObject ? user.addresses[existingIndex].toObject() : user.addresses[existingIndex];
      user.addresses[existingIndex] = { ...current, ...addressData };
    } else {
      user.addresses.push(addressData);
    }

    await user.save();
    res.json({ success: true, message: "Address saved successfully! 🏠", addresses: user.addresses });
  } catch (error) {
    console.error("Save address error:", error);
    res.json({ success: false, message: "Error saving address" });
  }
};

// Delete address
const deleteAddress = async (req, res) => {
  const userId = req.userId || req.body.userId;
  const { addressId } = req.body;
  try {
    const user = await userModel.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }
    user.addresses = (user.addresses || []).filter((a) => String(a._id) !== String(addressId));
    await user.save();
    res.json({ success: true, message: "Address deleted", addresses: user.addresses });
  } catch (error) {
    console.error("Delete address error:", error);
    res.json({ success: false, message: "Error deleting address" });
  }
};

export { loginUser, registerUser, toggleFavorite, getFavorites, getAddresses, saveAddress, deleteAddress };