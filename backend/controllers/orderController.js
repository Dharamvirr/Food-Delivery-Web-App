import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const currency = "inr";
const deliveryCharge = 50;
const frontend_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Placing User Order using Stripe
const placeOrder = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    const line_items = req.body.items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charge",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${frontend_URL}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${frontend_URL}/verify?success=false&orderId=${newOrder._id}`,
      line_items: line_items,
      mode: "payment",
    });

    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.error("Stripe order error:", error);
    res.json({ success: false, message: "Error placing Stripe order" });
  }
};

// Placing User Order for COD
const placeOrderCod = async (req, res) => {
  try {
    const newOrder = new orderModel({
      userId: req.body.userId,
      items: req.body.items,
      amount: req.body.amount,
      address: req.body.address,
      payment: true,
    });
    await newOrder.save();
    await userModel.findByIdAndUpdate(req.body.userId, { cartData: {} });

    // Real-time notification for admin & user
    const io = req.app.get("io");
    if (io) {
      io.emit("new_order", { order: newOrder });
    }

    res.json({ success: true, message: "Order Placed Successfully (Cash on Delivery)", orderId: newOrder._id });
  } catch (error) {
    console.error("COD order error:", error);
    res.json({ success: false, message: "Error placing COD order" });
  }
};

// User Orders for Frontend
const userOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({ userId: req.body.userId });
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("User orders error:", error);
    res.json({ success: false, message: "Error fetching user orders" });
  }
};

// Verify Stripe Order
const verifyOrder = async (req, res) => {
  const { orderId, success } = req.body;
  try {
    if (success === "true") {
      const verifiedOrder = await orderModel.findByIdAndUpdate(orderId, { payment: true }, { new: true });
      const io = req.app.get("io");
      if (io) {
        io.emit("new_order", { order: verifiedOrder });
      }
      res.json({ success: true, message: "Paid" });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false, message: "Not Paid" });
    }
  } catch (error) {
    console.error("Verify order error:", error);
    res.json({ success: false, message: "Not Verified" });
  }
};

// Listing Orders for Admin panel
const listOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("List orders error:", error);
    res.json({ success: false, message: "Error listing orders" });
  }
};

// Update order status with real-time WebSocket broadcast
const updateStatus = async (req, res) => {
  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      req.body.orderId, 
      { status: req.body.status },
      { new: true }
    );

    // Broadcast real-time event to connected clients via Socket.IO
    const io = req.app.get("io");
    if (io) {
      io.emit("order_status_updated", {
        orderId: req.body.orderId,
        status: req.body.status,
        userId: updatedOrder ? updatedOrder.userId : null,
        order: updatedOrder
      });
    }

    res.json({ success: true, message: "Status Updated", order: updatedOrder });
  } catch (error) {
    console.error("Update status error:", error);
    res.json({ success: false, message: "Error updating status" });
  }
};

export { placeOrder, placeOrderCod, verifyOrder, userOrders, listOrders, updateStatus };