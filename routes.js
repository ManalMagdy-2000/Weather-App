const { Router } = require ("express");
const Controller = require("./controller")
const router = Router() ;



router.get('/' , Controller.getUsers);

module.exports = router ;

/*
// Login user
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      res.status(400).send("Username and password are required.");
      return;
    }
  

  });

  */