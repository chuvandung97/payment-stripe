const express = require("express")
const router = express.Router()

//Define Controller
const paymentController = require("../app/Http/Controllers/PaymentController")
const productController = require("../app/Http/Controllers/ProductController")

//Payment
router.post("/payment-intent", paymentController.storePaymentIntent)
router.post("/subscription", paymentController.storeSubscription)
router.delete("/subscription/cancel", paymentController.cancelSubscription)

//Product
router.post("/product", productController.store)
router.put("/product/:productId", productController.update)
router.delete("/product/:productId", productController.delete)

module.exports = router;
