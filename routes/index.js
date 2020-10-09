const express = require("express")
const router = express.Router()

//Define Controller
const indexController = require("../app/Http/Controllers/Controller")
const paymentController = require("../app/Http/Controllers/PaymentController")

//Index
router.get("/", indexController.checkServerRunning)
router.post("/checkout", indexController.checkoutPage)

//Payment
router.post("/payment-intent", paymentController.storePaymentIntent)
router.post("/subscription", paymentController.storeSubscription)
router.delete("/subscription/cancel", paymentController.cancelSubscription)

module.exports = router;
