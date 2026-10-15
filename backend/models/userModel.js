import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    cartData: { type: Object, default: {} },
    favorites: { type: [String], default: [] },
    addresses: [
      {
        firstName: { type: String, default: "" },
        lastName: { type: String, default: "" },
        email: { type: String, default: "" },
        street: { type: String, default: "" },
        city: { type: String, default: "" },
        state: { type: String, default: "" },
        zipcode: { type: String, default: "" },
        country: { type: String, default: "India" },
        phone: { type: String, default: "" },
        label: { type: String, default: "Home" }
      }
    ]
}, { minimize: false })

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
export default userModel;