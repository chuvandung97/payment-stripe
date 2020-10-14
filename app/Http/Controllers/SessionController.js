const path = require("path");
require("dotenv").config({path: path.join(__dirname, "../../../.env")});
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

class SessionController {
    async store(req, res) //mode, customer_id, email, price_id
    {
        var item = req.body
        var sessionObj = {
            success_url: item.redirect_url,
            cancel_url: item.redirect_url,
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
