/*

const express = require("express");
//const usersRoute = require("./routes");
const bodyParser  = require("body-parser");
const app = express();
const expressWs = require("express-ws");
const axios = require("axios");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecretKey = "#Manal#123#";

const PORT = 6060 ;
const WEATHER_API_KEY ="2d39a0f72e2a31d915c96fb677ff378f";
const subscriptions ={};

expressWs(app); 


app.use(bodyParser.json());

app.post('/register' , (req , res) => {
    const {username  , email , password} = req.body;
    if(!username | !password , !email){
        res.status(400).send("User information required.")
    }
    if (!isValidEmail(email)) {
        res.status(400).send("Invalid email format.");
        return;
      }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          res.status(500).send("Error while registering user.");
          return;
        }
        subscriptions[username] = { email, password: hashedPassword };
        res.status(200).send("User registered successfully!");
      });
})

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
  app.get("/users" , (req, res) =>{
    const allUsers = Object.keys(subscriptions).map((username) => {
        return {
            username , ...subscriptions[username]
        };
    })
    if(allUsers.length == 0){
        res.status(504).send("No users registered yet!");
    }
    res.status(200).json(allUsers);
  })

  app.delete("/users" , (req, res) =>{
    Object.keys(subscriptions).forEach((username) => {
        delete subscriptions[username];
    });
    res.status(200).send("All users deleted sucessfully.")
  })

 

  app.delete("/:username" , (req , res) => {
    const { username } = req.params;
    if(!subscriptions[username]){
        res.status(404).send("user not found!");
        return;
    }
    delete subscriptions[username];
    res.status(200).send(`User "$username" seleted successfully.`)
  })




  app.post('/login', (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      res.status(400).send("Username and password are required.");
      return;
    }
  
    const user = subscriptions[username];
    if (!user) {
      res.status(404).send("Username not found! Please register first.");
      return;
    }
  
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
  });
  



function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }



/*
module.exports = {
    getUsers ,
}

app.use("/api/v1/users" , usersRoute);


// Start the server
app.listen(PORT, () => {  
    console.log(`Server is running on port ${PORT}`);
    fetchWeatherUpdates();
  });


*/