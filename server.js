const express = require("express");
//const usersRoute = require("./routes");
const bodyParser  = require("body-parser");
const app = express();
const expressWs = require("express-ws");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecretKey = "#Manal#123#";
const db = require("./db")

const PORT = 6060 ;
const WEATHER_API_KEY ="2d39a0f72e2a31d915c96fb677ff378f";
const subscriptions ={};

expressWs(app); 


app.use(bodyParser.json());

// Create a new user
app.post('/users', async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const queryText = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *';
      const values = [username, email, password];
      const result = await db.query(queryText, values);
      res.status(201).json(result.rows[0]);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).send('Internal Server Error');
    }
  });

  
  // Get all users
  app.get('/users', async (req, res) => {
    try {
      const queryText = 'SELECT * FROM users';
      const result = await db.query(queryText);
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // Get a single user by ID
  app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const queryText = 'SELECT * FROM users WHERE id = $1';
      const values = [id];
      const result = await db.query(queryText, values);
      if (result.rows.length === 0) {
        res.status(404).send('User not found');
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // Update a user by ID
  app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email, password } = req.body;
    try {
      const queryText = 'UPDATE users SET username = $1, email = $2, password = $3 WHERE id = $4 RETURNING *';
      const values = [username, email, password, id];
      const result = await db.query(queryText, values);
      if (result.rows.length === 0) {
        res.status(404).send('User not found');
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  
  // Delete a user by ID
  app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const queryText = 'DELETE FROM users WHERE id = $1 RETURNING *';
      const values = [id];
      const result = await db.query(queryText, values);
      if (result.rows.length === 0) {
        res.status(404).send('User not found');
      } else {
        res.json(result.rows[0]);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).send('Internal Server Error');
    }
  });
  




  app.post('/login', async (req, res) => {
    const {username , password} = req.body ;
    try {
        const queryText = 'SELECT * FROM users WHERE username = $1 AND password = $2';
        const result = await db.query(queryText, [username , password]);
    
        if (result.rows.length === 0) {
          res.status(404).send("User not found! Please register first.");
          return;
        }
        const user = result.rows[0];

    /*
        bcrypt.compare(password, user.password, (err, result) => {
          if (err) {
            res.status(500).send("Error while authenticating user.");
            return;
          }
    
          if (!result) {
            res.status(401).send("Invalid credentials.");
            return;
          }
    
          const token = jwt.sign({ username }, jwtSecretKey);
          res.status(200).json({ token });
        });      
*/
        const token = jwt.sign({ username }, jwtSecretKey);
        res.status(200).json({ token });

      } catch (error) {
        console.error('Error during login:', error);
        res.status(500).send('Internal Server Error');
      }
  });
  



  app.post('/subscribe' , (req, res) =>{
    const { username, location } = req.body;
    if(!username || !location){
        res.status(400).send("User information required .")
    }
    if(!subscriptions[username]){
        res.status(404).send("username not found! , please register first")
    }
    subscriptions[username].location = location;
    res.status(200).send("User subscribed successfully!");
})


app.post('/unsubscribe' , (req , res) => {
    const { username } = req.body; 
    if(!username){
        res.status(404).send("username not found!");
    }
    if(!subscriptions[username]){
        res.status(404).send("User not found , please register first!");
    }
    subscriptions[username].location = undefined;
    res.status(200).send("User unsubscribed successfully.");
})



  app.get("/weather/:location" ,  async(req , res) =>{
    const {location}  = req.params;
    try{
        const weatherData = await getWeatherData(location);
        res.status(200).send(weatherData);
    }catch(error){
        res.status(500).send({error : "Error fetching the weather data!!" })
    }
});

async function getWeatherData(location) {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${WEATHER_API_KEY}`;
    const res = await axios.get(apiUrl);
    return res.data;
  }



  app.ws("/notifications" , (ws , req) => {
    ws.on('message' , msg => {
        const username = msg.trim();
        if(!subscriptions[username]){
            ws.send(JSON.stringify({ error: "username  not found. Please register first!" }));
            return;
        }
        subscriptions[username].ws = ws;
        ws.send(JSON.stringify({ message: "Welcome! You will receive real-time weather updates." }));
});
    })



async function sendWeatherUpdate(username, weatherData) {
    if (subscriptions[username]?.ws) {
      try {
        subscriptions[username].ws.send(JSON.stringify(weatherData));
      } catch (error) {
        console.error(`Error sending update to ${username}:`, error);
      }
    }
  }
  async function fetchWeatherUpdates() {
    for (const username in subscriptions) {
      const location = subscriptions[username].location;
      if (location) {
        try {
          const weatherData = await getWeatherData(location);
          sendWeatherUpdate(username, weatherData);
        } catch (error) {
          console.error(`Error fetching weather data for ${username}:`, error);
        }
      }
    }
    setTimeout(fetchWeatherUpdates, 60000); 
  }
  



function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }



/*
module.exports = {
    getUsers ,
}

app.use("/api/v1/users" , usersRoute);

*/
// Start the server
app.listen(PORT, () => {  
    console.log(`Server is running on port ${PORT}`);
    fetchWeatherUpdates();
  });



