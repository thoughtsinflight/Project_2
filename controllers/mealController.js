const router = require("express").Router();
const db = require("../models/index");
const path = require("path");

const Meal = db.sequelize.import(path.resolve(__dirname, "../models/meal.js"));
const Ingredient = db.sequelize.import(path.resolve(__dirname, "../models/ingredient.js"));
const Day = db.sequelize.import(path.resolve(__dirname, "../models/day.js"));
const User = db.sequelize.import(path.resolve(__dirname, "../models/user.js"));

//create
router.post("/", async (req, res) => {
    //need to get user id from session here.
    const userId = req.user.id;
    const {dayId, name, ingredients} = req.body.data;
    //Find Day
    const day = await Day.findByPk(dayId);
    //Find User
    const user = await User.findByPk(userId);
    //Find or Create meal
    const [meal] = await Meal.findOrCreate({
        where: { name: name }
    });

    await meal.addDay(day);
    await meal.addUser(user);

    ingredients.forEach(async (ingredient) => {
        const [focIngredient] = await Ingredient.findOrCreate({ where: ingredient });
        await meal.addIngredient(focIngredient);
    });

    const currentIngredients = await meal.getIngredients();
    res.send({ data: { day, meal, currentIngredients } });
});

//get all meals sans ingredients
router.get("/", (req, res) => {
    Meal.findAll().then(meals => (res.send(meals)));
});

//get meal individually by id
router.get("/:id", (req, res) => {
    Meal.findByPk(req.params.id).then(meal => (res.send(meal)));
});

//get meal by id and its associated ingredients
router.get("/:id/ingredients", async (req, res) => {
    const meal = await Meal.findOne({
        where: { id: req.params.id },
        include: [
            {
                model: Ingredient,
                as: "Ingredients"
            }
        ]
    });

    res.json({ meal });
});


module.exports = router;