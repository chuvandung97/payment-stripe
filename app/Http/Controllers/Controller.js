class Controller {
    checkServerRunning(req, res) 
    {
        res.send("Server run");
    }

    checkoutPage(req, res) 
    {
        res.render('index')
    }
}

module.exports = new Controller;
