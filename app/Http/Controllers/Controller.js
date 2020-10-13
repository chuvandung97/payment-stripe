class Controller {
    checkServerRunning(req, res) 
    {
        res.send("Server run");
    }

    checkoutPage(req, res) 
    {
        res.render('index')
    }

    successPage(req, res)
    {
        res.render('success')
    }

    errorPage(req, res) 
    {
        res.render('error')
    }
}

module.exports = new Controller;
