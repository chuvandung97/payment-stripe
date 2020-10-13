const stripe = require("stripe")("sk_test_51GzwUxBKlxcCDnEBnrQW4acbisIgr4SwtUWHtNw9FdBxzP8TvDHqGXwcZ7NyebTL80JWNOap4UZdzf96OXneI70200k532wJ9R");

class Controller {
    checkServerRunning(req, res) 
    {
        return res.send("Server run");
    }

    async checkoutPage(req, res) 
    {
        var session = await stripe.checkout.sessions.retrieve(req.query.sessionId, {
            expand: ['customer', 'line_items']
        })
        return res.render('checkout', {
            mode: session.mode,
            name: session.customer ? session.customer.name : null,
            email: session.customer ? session.customer.email : null,
            address: session.customer ? session.customer.address : null,
            subscription_id: session.customer ? (session.customer.subscriptions.data.length > 0 ? session.customer.subscriptions.data[0].id : null) : null,
            product_name: session.line_items.data[0].description,
            product_currency: session.line_items.data[0].currency,
            product_amount: session.line_items.data[0].amount_total / 100
        })
    }

    successPage(req, res)
    {
        return res.render('success')
    }

    errorPage(req, res) 
    {
        return res.render('error')
    }
}

module.exports = new Controller;
