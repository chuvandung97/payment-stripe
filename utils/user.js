const stripe = require("stripe")("sk_test_51GzwUxBKlxcCDnEBnrQW4acbisIgr4SwtUWHtNw9FdBxzP8TvDHqGXwcZ7NyebTL80JWNOap4UZdzf96OXneI70200k532wJ9R");

module.exports = {
    async createCustomer(item) 
    {
        var customerId = item.customer_id
        if(!customerId) {
            let user = await stripe.customers.create({
                email: item.customer_detail.email,
                address: item.customer_detail.address,
                payment_method: item.payment_method,
                invoice_settings: {
                    default_payment_method: item.payment_method
                },
                description: item.description
            })
            customerId = user.id
        }
        return customerId
    }
}