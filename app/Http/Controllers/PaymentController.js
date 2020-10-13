const express = require("express");
const app = express();
const stripe = require("stripe")("sk_test_51GzwUxBKlxcCDnEBnrQW4acbisIgr4SwtUWHtNw9FdBxzP8TvDHqGXwcZ7NyebTL80JWNOap4UZdzf96OXneI70200k532wJ9R");
const { createCustomer } = require("../../../utils/user")

class PaymentController {
    async storePaymentIntent(req, res) //price_id
    {
        var item = req.body
        var price = await stripe.prices.retrieve(item.price_id)
        var product = await stripe.products.retrieve(price.product)

        const paymentIntent = await stripe.paymentIntents.create({ 
            amount: price.unit_amount,
            currency: price.currency,
            metadata: product.metadata
        })
        return res.status(200).json({ clientSecret: paymentIntent.client_secret })
    }

    async storeSubscription(req, res) //customer_id, payment_method, subscription_id, price_id, customer_detail: {name, email, description, address: {city, country, line1, line2, postal_code, state}}
    {
        var item = req.body
        var customerId = await createCustomer(item)
        var subscriptionId = item.subscription_id
        if(subscriptionId) {
            let oldSubscription = await stripe.subscriptions.retrieve(subscriptionId);
            var subscription = await stripe.subscriptions.update(oldSubscription.id, {
                cancel_at_period_end: false,
                items: [
                    {
                        id: oldSubscription.items.data[0].id,
                        price: item.price_id
                    }
                ]
            })
        } else {
            var subscription = await stripe.subscriptions.create({
                customer: customerId,
                items: [
                    {
                        price: item.price_id
                    }
                ],
                cancel_at_period_end: false,
                collection_method: 'charge_automatically',
                expand: ['latest_invoice.payment_intent']
            })
        }

        return res.status(200).json({ subscription: subscription })
    }

    async cancelSubscription(req, res)
    {
        await stripe.subscriptions.del(req.body.subscription_id)
        return res.status(200).json({ message: "success"})
    }
}

module.exports = new PaymentController;
