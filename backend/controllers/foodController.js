import foodModel from "../models/foodModel.js";
import fs from 'fs'


// all food list with optional pagination & filtering
const listFood = async (req, res) => {
    try {
        const page = parseInt(req.query.page);
        const limit = parseInt(req.query.limit);
        const category = req.query.category;

        const filter = {};
        if (category && category !== 'All') {
            filter.category = category;
        }

        const total = await foodModel.countDocuments(filter);

        if (page && limit) {
            const skip = (page - 1) * limit;
            const foods = await foodModel.find(filter).skip(skip).limit(limit);
            return res.json({ 
                success: true, 
                data: foods, 
                total, 
                page, 
                limit, 
                hasMore: skip + foods.length < total 
            });
        }

        const foods = await foodModel.find(filter);
        res.json({ success: true, data: foods, total, hasMore: false });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error fetching foods" });
    }
}


// add food    
const addFood = async (req, res) => {

    try {
        let image_filename = `${req.file.filename}`

        const food = new foodModel({
            name: req.body.name,
            description: req.body.description,
            price: req.body.price,
            category:req.body.category,
            image: image_filename,
        })

        await food.save();
        res.json({ success: true, message: "Food Added" })
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }
}
 

// delete food
const removeFood = async (req, res) => {
    try {

        const food = await foodModel.findById(req.body.id);
        fs.unlink(`uploads/${food.image}`, () => { })

        await foodModel.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: "Food Removed" })

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Error" })
    }

}

export { addFood ,listFood, removeFood };