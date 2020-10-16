const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../../../.env")});
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createCustomer } = require("../../../utils/user")

class PaymentController {
    async storePaymentIntent(req, res) //price_id
    {
        try {
            var item = req.body
            var price = await stripe.prices.retrieve(item.price_id)
            var product = await stripe.products.retrieve(price.product)

            const paymentIntent = await stripe.paymentIntents.create({ 
                amount: price.unit_amount,
                currency: price.currency,
                metadata: product.metadata
            })
            return res.status(200).json({ clientSecret: paymentIntent.client_secret })   
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error })
        }
    }

    async storeSubscription(req, res) //customer_id, payment_method, subscription_id, price_id, customer_detail: {name, email, description, address: {city, country, line1, line2, postal_code, state}}
    {
        try {
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
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error })
        }
    }

    async retryInvoice(req, res) { //payment_method, customer_id, invoice_id
        try {
            var item = req.body
            await stripe.paymentMethods.attach(item.payment_method, {
                customer: item.customer_id
            })
            await stripe.customers.update(item.customer_id, {
                invoice_settings: {
                    default_payment_method: item.payment_method
                }
            })
            var invoice = await stripe.invoices.retrieve(item.invoice_id, {
                expand: ['payment_intent'],
            });
            return res.status(200).send({invoice: invoice})
        } catch (error) {
            return res.status(error.statusCode || 500).json({ error: error })
        }
    }

    async cancelSubscription(req, res)
    {
        await stripe.subscriptions.del(req.body.subscription_id)
        return res.status(200).json({ message: "success"})
    }
}

module.exports = new PaymentController;
