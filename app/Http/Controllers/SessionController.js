const express = require("express");
const app = express();
const stripe = require("stripe")("sk_test_51GzwUxBKlxcCDnEBnrQW4acbisIgr4SwtUWHtNw9FdBxzP8TvDHqGXwcZ7NyebTL80JWNOap4UZdzf96OXneI70200k532wJ9R");

class SessionController {
    async index(req, res)
    {
        var session = await stripe.checkout.sessions.retrieve(req.params.sessionId, {
            expand: ['customer', 'line_items']
        })
        return res.status(200).json({
            mode: session.mode,
            name: session.customer ? session.customer.name : null,
            email: session.customer ? session.customer.email : null,
            subscription_id: session.customer ? (session.customer.subscriptions.data.length > 0 ? session.customer.subscriptions.data[0].id : null) : null,
            product_name: session.line_items.data[0].description,
            product_currency: session.line_items.data[0].currency,
            product_amount: session.line_items.data[0].amount_total / 100
        })
    }

    async store(req, res) //mode, customer_id, email, price_id
    {
        var item = req.body
        var sessionObj = {
            success_url: "http://localhost:3000/success",
            cancel_url: "http://localhost:3000/error",
            mode: item.mode,
            payment_method_types: ["card"],
            line_items: [
                {
                    price: item.price_id,
                    quantity: 1
                }
            ],
        }
        if(item.customer_id) {
            sessionObj.customer = item.customer_id
        } else {
            sessionObj.customer_email = item.email
        }
        var session = await stripe.checkout.sessions.create(sessionObj)
        return res.status(200).json({ sessionId: session.id})
    }
}

module.exports = new SessionController;
