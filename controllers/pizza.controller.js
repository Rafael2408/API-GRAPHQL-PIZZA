const { db } = require('../config/connection')

const pizzaResolver = {
    Query: {
        pizzas(root, {id}){
            if ( id == undefined) {
                return db.any('SELECT * FROM pizzas')
            } else {
                return db.any('SELECT * FROM pizzas WHERE piz_id = $1', [id])
            }
        }
    },
    Mutation:{
        async createPizza(root, {pizza}){
            try {
                if (pizza == undefined) {
                    return null
                } else {
                    const newPizza = await db.one(`
                        INSERT INTO pizzas (piz_name, piz_origin, piz_state)
                        VALUES ($1, $2, true) returning *;
                    `, [pizza.piz_name, pizza.piz_origin])
                    if(pizza.ingredientsPizza.length > 0){
                        pizza.ingredientsPizza.forEach(async (element) => {
                            console.log(newPizza.piz_id, element.ing_id, element.pi_portion)

                                await db.none(`
                                INSERT INTO pizzas_ingredients (piz_id, ing_id, pi_portion)
                                VALUES ($1, $2, $3);
                            `, [newPizza.piz_id, element.ing_id, element.pi_portion])
                        });
                    }
                    return newPizza
                }
            } catch (error) {
                console.log({error: error.message})
            }
        },
        async updatePizza(root, {pizza}){
            try {
                if (pizza == undefined) {
                    return null
                } else {
                    const newPizzza = await db.one(`
                        UPDATE pizzas SET piz_name = $2, piz_origin = $3, piz_state = $4
                        WHERE piz_id = $1 returning *;
                    `, [pizza.piz_id, pizza.piz_name, pizza.piz_origin, pizza.piz_state])

                    if(pizza.ingredientsPizza.length > 0){
                        db.none(`DELETE FROM pizzas_ingredients WHERE piz_id = $1`, [newPizzza.piz_id])
                        pizza.ingredientsPizza.forEach(async (element) => {
                            console.log(newPizzza.piz_id, element.ing_id, element.pi_portion)
 
                                await db.none(`
                                UPDATE pizzas_ingredients SET pi_portion = $1
                                WHERE piz_id = $2 AND ing_id = $3;
                            `, [element.pi_portion, newPizzza.piz_id, element.ing_id])
                        });
                    }
                }
            } catch (error) {
                console.log(error.message)
            }
        }
    }, 
    pizzas: {
        ingredients(pizza) {
            return db.any(`
                SELECT i.*, pi.pi_portion
                FROM pizzas p, ingredients i, pizzas_ingredients pi
                WHERE p.piz_id = pi.piz_id 
                AND i.ing_id = pi.ing_id
                AND p.piz_id = $1
            `, [pizza.piz_id])
        },
        async total_calories(pizza) {
            const res = await db.one(`
                SELECT SUM(i.ing_calories * pi.pi_portion) AS total_calories
                FROM pizzas p, ingredients i, pizzas_ingredients pi
                WHERE p.piz_id = pi.piz_id 
                AND i.ing_id = pi.ing_id
                AND p.piz_id = $1
            `, [pizza.piz_id])

            if (res.total_calories == null) res.total_calories = 0;

            return res.total_calories
        }


    }

}

module.exports = pizzaResolver