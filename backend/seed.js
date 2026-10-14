import mongoose from "mongoose";
import dotenv from "dotenv";
import dns from "node:dns";
import foodModel from "./models/foodModel.js";

dotenv.config();

try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {}

const dummyFoods = [
  {
    name: "Greek Salad",
    image: "food_1.png",
    price: 180,
    description: "Crispy lettuce, cherry tomatoes, kalamata olives, cucumber, and creamy feta cheese drizzled with extra virgin olive oil.",
    category: "Salad"
  },
  {
    name: "Veg Salad",
    image: "food_2.png",
    price: 150,
    description: "A refreshing blend of garden-fresh vegetables, crunchy bell peppers, tossed in a light herb vinaigrette.",
    category: "Salad"
  },
  {
    name: "Clover Salad",
    image: "food_3.png",
    price: 190,
    description: "Baby spinach, clover sprouts, roasted walnuts, and goat cheese with a tangy honey-mustard dressing.",
    category: "Salad"
  },
  {
    name: "Chicken Salad",
    image: "food_4.png",
    price: 240,
    description: "Tender grilled chicken breast strips over crisp romaine lettuce, seasoned croutons, and parmesan shavings.",
    category: "Salad"
  },
  {
    name: "Lasagna Rolls",
    image: "food_5.png",
    price: 220,
    description: "Baked pasta ribbons rolled with seasoned ricotta, mozzarella, and marinara sauce topped with melted parmesan.",
    category: "Rolls"
  },
  {
    name: "Peri Peri Rolls",
    image: "food_6.png",
    price: 160,
    description: "Spicy peri peri marinated paneer and crisp vegetables wrapped in a warm toasted tortilla roll.",
    category: "Rolls"
  },
  {
    name: "Chicken Rolls",
    image: "food_7.png",
    price: 210,
    description: "Succulent tandoori spiced chicken chunks rolled in a flaky paratha with sliced onions and mint chutney.",
    category: "Rolls"
  },
  {
    name: "Veg Rolls",
    image: "food_8.png",
    price: 140,
    description: "Golden crispy vegetable cutlet wrapped with zesty sauces and crunchy slaw in a soft roti.",
    category: "Rolls"
  },
  {
    name: "Ripple Ice Cream",
    image: "food_9.png",
    price: 130,
    description: "Rich double-churned vanilla ice cream swirled with decadent Belgian chocolate ripple sauce.",
    category: "Desserts"
  },
  {
    name: "Fruit Ice Cream",
    image: "food_10.png",
    price: 160,
    description: "Creamy artisanal gelato infused with real berries, mango chunks, and tropical passion fruit.",
    category: "Desserts"
  },
  {
    name: "Jar Ice Cream",
    image: "food_11.png",
    price: 180,
    description: "Layered gourmet dessert jar with crushed cookies, silky chocolate mousse, and vanilla bean cream.",
    category: "Desserts"
  },
  {
    name: "Vanilla Ice Cream",
    image: "food_12.png",
    price: 110,
    description: "Classic Madagascar bourbon vanilla bean ice cream with a velvety smooth texture.",
    category: "Desserts"
  },
  {
    name: "Chicken Sandwich",
    image: "food_13.png",
    price: 190,
    description: "Grilled chicken breast with melted cheddar, crisp lettuce, tomato, and garlic aioli on artisan sourdough.",
    category: "Sandwich"
  },
  {
    name: "Vegan Sandwich",
    image: "food_14.png",
    price: 170,
    description: "Avocado mash, roasted zucchini, bell peppers, and hummus layered in multigrain toasted bread.",
    category: "Sandwich"
  },
  {
    name: "Grilled Sandwich",
    image: "food_15.png",
    price: 150,
    description: "Triple decker sandwich stuffed with gooey melted cheese, sweet corn, jalapenos, and green bell peppers.",
    category: "Sandwich"
  },
  {
    name: "Bread Sandwich",
    image: "food_16.png",
    price: 120,
    description: "Bombay style street sandwich loaded with spiced potato, cucumber, beets, and zesty coriander chutney.",
    category: "Sandwich"
  },
  {
    name: "Cup Cake",
    image: "food_17.png",
    price: 90,
    description: "Fluffy vanilla sponge cupcake topped with a swirl of strawberry buttercream and colorful sprinkles.",
    category: "Cake"
  },
  {
    name: "Vegan Cake",
    image: "food_18.png",
    price: 250,
    description: "Rich dark chocolate sponge cake crafted with organic cocoa and silky dairy-free ganache.",
    category: "Cake"
  },
  {
    name: "Butterscotch Cake",
    image: "food_19.png",
    price: 280,
    description: "Moist caramelized sponge layered with rich butterscotch cream and crunchy butter praline.",
    category: "Cake"
  },
  {
    name: "Sliced Cake",
    image: "food_20.png",
    price: 110,
    description: "Delicate English pound cake infused with lemon zest and sweet almond essence, baked golden brown.",
    category: "Cake"
  },
  {
    name: "Garlic Mushroom",
    image: "food_21.png",
    price: 180,
    description: "Button mushrooms sauteed in golden garlic butter with fresh parsley and freshly cracked black pepper.",
    category: "Pure Veg"
  },
  {
    name: "Fried Cauliflower",
    image: "food_22.png",
    price: 160,
    description: "Crispy golden cauliflower florets tossed in sweet chili garlic glaze with toasted sesame seeds.",
    category: "Pure Veg"
  },
  {
    name: "Mix Veg Pulao",
    image: "food_23.png",
    price: 170,
    description: "Fragrant basmati rice slow-cooked with fresh garden vegetables, whole aromatics, and saffron.",
    category: "Pure Veg"
  },
  {
    name: "Rice Zucchini",
    image: "food_24.png",
    price: 190,
    description: "Delicate arborio rice skillet tossed with caramelized zucchini, garlic, and shaved parmesan cheese.",
    category: "Pure Veg"
  },
  {
    name: "Cheese Pasta",
    image: "food_25.png",
    price: 230,
    description: "Al dente penne smothered in a rich, velvety four-cheese Alfredo sauce with cracked black pepper.",
    category: "Pasta"
  },
  {
    name: "Tomato Pasta",
    image: "food_26.png",
    price: 200,
    description: "Italian fusilli tossed in slow-simmered San Marzano tomato sauce, fresh basil, and extra virgin olive oil.",
    category: "Pasta"
  },
  {
    name: "Creamy Pasta",
    image: "food_27.png",
    price: 240,
    description: "Silky fettuccine with sauteed button mushrooms in a creamy white wine and parmesan reduction.",
    category: "Pasta"
  },
  {
    name: "Chicken Pasta",
    image: "food_28.png",
    price: 270,
    description: "Tender penne pasta tossed with grilled chicken breast and sun-dried tomatoes in a creamy pesto sauce.",
    category: "Pasta"
  },
  {
    name: "Butter Noodles",
    image: "food_29.png",
    price: 160,
    description: "Silky egg noodles tossed in melted European butter, sea salt, cracked pepper, and fresh chives.",
    category: "Noodles"
  },
  {
    name: "Veg Noodles",
    image: "food_30.png",
    price: 150,
    description: "Wok-tossed Hakka noodles with crisp shredded cabbage, carrots, bell peppers, and scallions.",
    category: "Noodles"
  },
  {
    name: "Somen Noodles",
    image: "food_31.png",
    price: 210,
    description: "Light Japanese thin wheat noodles served in a savory dashi broth with sesame seeds and scallions.",
    category: "Noodles"
  },
  {
    name: "Cooked Noodles",
    image: "food_32.png",
    price: 180,
    description: "Classic street-style stir-fried noodles tossed in dark soy sauce, chili crisp, and tender bok choy.",
    category: "Noodles"
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB for seeding...");
    
    // Clear old foods
    await foodModel.deleteMany({});
    console.log("Cleared old food items.");

    // Insert new high quality dummy items
    const inserted = await foodModel.insertMany(dummyFoods);
    console.log(`Successfully seeded ${inserted.length} delicious food items!`);

    await mongoose.disconnect();
    console.log("Database disconnected.");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
