class Controller {
    checkServerRunning(req, res) 
    {
        /* res.send("Server run"); */
        res.render('index')
    }

    checkoutPage(req, res) 
    {

    }
}

module.exports = new Controller;
