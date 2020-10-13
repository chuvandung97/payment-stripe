const express = require("express")
const router = express.Router()

//Define Controller
const indexController = require("../app/Http/Controllers/Controller")

//Index
router.get("/", indexController.checkServerRunning)
router.get("/checkout", indexController.checkoutPage)
router.get("/success", indexController.successPage)
router.get("/error", indexController.errorPage)

module.exports = router;
