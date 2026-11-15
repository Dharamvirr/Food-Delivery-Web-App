import dns from "node:dns";
try {
  dns.setDefaultResultOrder("ipv4first");
} catch (e) {}

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

import foodModel from "../../models/foodModel.js";
import { geminiEmbeddings } from "./geminiClient.js";
import { ensureCollection, upsertPoints } from "./qdrantService.js";

// Fallback dishes in case MongoDB has no items yet
const fallbackFoods = [
  { name: "Greek Salad", image: "food_1.png", price: 180, description: "Crispy lettuce, cherry tomatoes, kalamata olives, cucumber, and creamy feta cheese drizzled with extra virgin olive oil.", category: "Salad" },
  { name: "Veg Salad", image: "food_2.png", price: 150, description: "A refreshing blend of garden-fresh vegetables, crunchy bell peppers, tossed in a light herb vinaigrette.", category: "Salad" },
  { name: "Clover Salad", image: "food_3.png", price: 190, description: "Baby spinach, clover sprouts, roasted walnuts, and goat cheese with a tangy honey-mustard dressing.", category: "Salad" },
  { name: "Chicken Salad", image: "food_4.png", price: 240, description: "Tender grilled chicken breast strips over crisp romaine lettuce, seasoned croutons, and parmesan shavings.", category: "Salad" },
  { name: "Lasagna Rolls", image: "food_5.png", price: 220, description: "Baked pasta ribbons rolled with seasoned ricotta, mozzarella, and marinara sauce topped with melted parmesan.", category: "Rolls" },
  { name: "Peri Peri Rolls", image: "food_6.png", price: 160, description: "Spicy peri peri marinated paneer and crisp vegetables wrapped in a warm toasted tortilla roll.", category: "Rolls" },
  { name: "Chicken Rolls", image: "food_7.png", price: 210, description: "Succulent tandoori spiced chicken chunks rolled in a flaky paratha with sliced onions and mint chutney.", category: "Rolls" },
  { name: "Veg Rolls", image: "food_8.png", price: 140, description: "Crunchy stir-fried vegetables, shredded cabbage, carrots, and sweet chili sauce in a golden crispy roll.", category: "Rolls" },
  { name: "Ripple Ice Cream", image: "food_9.png", price: 130, description: "Velvety Madagascar vanilla bean ice cream swirled with decadent Belgian chocolate fudge ripples.", category: "Deserts" },
  { name: "Fruit Ice Cream", image: "food_10.png", price: 150, description: "Creamy artisanal gelato bursting with real chunks of sun-ripened strawberries, mango, and kiwi.", category: "Deserts" },
  { name: "Jar Ice Cream", image: "food_11.png", price: 170, description: "Layered gourmet dessert jar featuring crushed biscoff biscuits, rich chocolate ganache, and soft serve.", category: "Deserts" },
  { name: "Vanilla Ice Cream", image: "food_12.png", price: 110, description: "Classic double-churned cream infused with pure bourbon vanilla beans for a velvety smooth finish.", category: "Deserts" },
  { name: "Chicken Sandwich", image: "food_13.png", price: 190, description: "Juicy herb-roasted chicken slices, crisp romaine lettuce, and honey-dijon spread on artisan sourdough.", category: "Sandwich" },
  { name: "Vegan Sandwich", image: "food_14.png", price: 160, description: "Creamy crushed avocado, English cucumber, vine tomatoes, and microgreens on toasted multi-grain bread.", category: "Sandwich" },
  { name: "Grilled Sandwich", image: "food_15.png", price: 150, description: "Triple-decker buttery grilled sandwich stuffed with spiced potatoes, bell peppers, and melted cheese.", category: "Sandwich" },
  { name: "Bread Sandwich", image: "food_16.png", price: 120, description: "Traditional deli sandwich with fresh butter, cucumber rounds, tomato slices, and mint-coriander spread.", category: "Sandwich" },
  { name: "Cup Cake", image: "food_17.png", price: 90, description: "Fluffy golden sponge cupcake crowned with a swirl of rich strawberry buttercream and rainbow sprinkles.", category: "Cake" },
  { name: "Vegan Cake", image: "food_18.png", price: 180, description: "Moist dark chocolate fudge cake crafted with plant-based cocoa, topped with silky coconut cream frosting.", category: "Cake" },
  { name: "Butterscotch Cake", image: "food_19.png", price: 210, description: "Layers of caramelized brown sugar sponge smothered in buttery praline sauce and crunchy cashew nougat.", category: "Cake" },
  { name: "Sliced Cake", image: "food_20.png", price: 140, description: "Artisan European tea cake loaf infused with candied citrus peel, golden raisins, and aromatic spices.", category: "Cake" },
  { name: "Garlic Mushroom", image: "food_21.png", price: 200, description: "Plump button mushrooms pan-seared in rich herb butter, roasted minced garlic, and fresh Italian parsley.", category: "Pure Veg" },
  { name: "Fried Cauliflower", image: "food_22.png", price: 170, description: "Crisp battered cauliflower florets tossed in zesty garlic-soy glaze and garnished with toasted sesame.", category: "Pure Veg" },
  { name: "Mix Veg Pulao", image: "food_23.png", price: 190, description: "Fragrant long-grain basmati rice gently simmered with whole spices, seasonal vegetables, and saffron.", category: "Pure Veg" },
  { name: "Rice Zucchini", image: "food_24.png", price: 180, description: "Char-grilled Mediterranean zucchini ribbons served over aromatic lemon-herb jasmine rice and pine nuts.", category: "Pure Veg" },
  { name: "Cheese Pasta", image: "food_25.png", price: 230, description: "Penne pasta enveloped in a rich, slow-cooked four-cheese Alfredo sauce topped with golden parmesan crust.", category: "Pasta" },
  { name: "Tomato Pasta", image: "food_26.png", price: 200, description: "Al dente penne simmered in a vibrant San Marzano tomato pomodoro sauce with aromatic sweet basil and garlic.", category: "Pasta" },
  { name: "Creamy Pasta", image: "food_27.png", price: 240, description: "Silky fettuccine ribbons smothered in roasted garlic truffle cream with sautéed portobello mushrooms.", category: "Pasta" },
  { name: "Chicken Pasta", image: "food_28.png", price: 260, description: "Tender grilled chicken chunks and penne tossed in a spicy sun-dried tomato and smoky cajun cream sauce.", category: "Pasta" },
  { name: "Butter Noodles", image: "food_29.png", price: 160, description: "Tender egg noodles tossed in browned farmhouse butter, cracked black pepper, and fresh Italian parsley.", category: "Noodles" },
  { name: "Veg Noodles", image: "food_30.png", price: 170, description: "Wok-tossed Hakka noodles with julienned cabbage, crisp carrots, bell peppers, and scallion ginger sauce.", category: "Noodles" },
  { name: "Somen Noodles", image: "food_31.png", price: 190, description: "Delicate Japanese wheat noodles served in a savory kombu dashi broth with toasted sesame and scallions.", category: "Noodles" },
  { name: "Cooked Noodles", image: "food_32.png", price: 210, description: "Spicy street-style Schezwan noodles stir-fried with charred garlic, fiery red chilies, and crunchy sprouts.", category: "Noodles" }
];

export async function ingestMenuToQdrant() {
  console.log("🚀 Starting Menu Ingestion to Qdrant...");
  await ensureCollection(true);

  let foods = [];
  try {
    foods = await foodModel.find({});
  } catch (err) {
    console.warn("Could not fetch foods from MongoDB directly, using fallback seed catalog.", err.message);
  }

  if (!foods || foods.length === 0) {
    console.log("No foods found in MongoDB, using 32 fallback catalog items...");
    foods = fallbackFoods;
  } else {
    console.log(`Found ${foods.length} dishes in MongoDB.`);
  }

  const points = [];
  for (let i = 0; i < foods.length; i++) {
    const item = foods[i];
    const dishId = item._id ? item._id.toString() : `food_${i + 1}`;

    // Rich text for embedding
    const embedText = `Dish: ${item.name}. Category: ${item.category}. Price: ₹${item.price}. Description: ${item.description}. Dietary info: ${
      item.category === "Pure Veg" || item.category === "Salad" ? "Vegetarian" : "Non-Veg or Standard"
    }`;

    console.log(`[${i + 1}/${foods.length}] Generating embedding for: ${item.name}...`);
    try {
      const vector = await geminiEmbeddings.embedQuery(embedText);
      points.push({
        id: i + 1, // Integer ID for Qdrant
        vector: vector,
        payload: {
          dishId: dishId,
          name: item.name,
          category: item.category,
          price: item.price,
          image: item.image,
          description: item.description,
          embedText: embedText,
        },
      });
    } catch (e) {
      console.error(`Failed to embed ${item.name}:`, e.message);
    }
  }

  if (points.length > 0) {
    console.log(`Upserting ${points.length} points to Qdrant...`);
    await upsertPoints(points);
    console.log("✅ Menu Ingestion to Qdrant completed successfully!");
  }

  return { success: true, count: points.length };
}

// Allow CLI execution: node backend/services/ai/ingestMenu.js
if (process.argv[1]?.includes("ingestMenu.js")) {
  ingestMenuToQdrant()
    .then((res) => {
      console.log("Result:", res);
      process.exit(0);
    })
    .catch((err) => {
      console.error("Ingestion failed:", err);
      process.exit(1);
    });
}
