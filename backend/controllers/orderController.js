import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js"
import Stripe from "stripe";

const stripe = new Stripe('sk_test_1234567890abcdef');

// Placing User Order for Frontend using stripe

const placeOrder = async (req, res) => {

      

}

export {placeOrder}