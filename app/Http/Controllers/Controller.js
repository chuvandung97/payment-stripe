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
            email: session.customer ? session.customer.email : session.customer_email,
            address: session.customer ? session.customer.address : null,
            product_name: session.line_items.data[0].description,
            product_currency: session.line_items.data[0].currency,
            product_amount: session.line_items.data[0].amount_total / 100,
            subscription_id: session.customer ? (session.customer.subscriptions.data.length > 0 ? session.customer.subscriptions.data[0].id : null) : null,
            price_id: session.line_items.data[0].price.id,
            customer_id: session.customer ? session.customer.id : null,
            redirect_url: session.success_url
        })
    }

    successPage(req, res)
    {
        return res.render('success', {
            redirect_url: req.query.redirect
        })
    }

    errorPage(req, res) 
    {
        return res.render('error', {
            redirect_url: req.query.redirect
        })
    }
}

module.exports = new Controller;
