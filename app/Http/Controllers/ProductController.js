const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../../../.env")});
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class ProductController {
    async store(req, res) //name, description, metadata, amount, interval (day,week,month,year), interval_count (int), type (one_time, recurring)
    {
        var item = req.body
        var product = await stripe.products.create({
            name: item.name,
            description: item.description,
            metadata: item.metadata
        })
        var priceObj = {
            billing_scheme: "per_unit",
            unit_amount: item.amount,
            currency: 'usd',
            product: product.id,
        }
        if(item.type == "recurring") {
            priceObj.recurring = {
                interval: item.interval,
                interval_count: item.interval_count
            }
        }
        await stripe.prices.create(priceObj)
        return res.status(200).json({ message: "success"})
    }

    async update(req, res)
    {
        /* var item = req.body
        var product = await stripe.products.update(req.params.productId, {
            name: item.name,
            description: item.description,
            metadata: item.metadata
        })
        var priceObj = {
            billing_scheme: "per_unit",
            unit_amount: item.amount,
            currency: item.currency,
        }
        if(item.type == "recurring") {
            priceObj.recurring = {
                interval: item.interval,
                interval_count: item.interval_count
            }
        }
        await stripe.prices.update(product.id, priceObj) */
    }

    async delete(req, res)
    {
        
    }
}

module.exports = new ProductController;
