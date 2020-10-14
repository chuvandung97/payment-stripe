const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../../../.env")});
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class ProductController {
    async store(req, res) //name, description, metadata, amount, currency, interval, interval_count
    {
        var item = req.body
        var product = await stripe.products.create({
            name: item.name,
            description: item.description,
            metadata: item.metadata
        })
        await stripe.prices.create({
            billing_scheme: "per_unit",
            unit_amount: item.amount,
            currency: item.currency,
            product: product.id,
            recurring: {
                interval: item.interval,
                interval_count: item.interval_count,
            },
        })
        return res.status(200).json({ message: "success"})
    }

    async update(req, res)
    {

    }

    async delete(req, res)
    {
        
    }
}

module.exports = new ProductController;
