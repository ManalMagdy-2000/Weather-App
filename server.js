const express = require("express");
const bodyParser  = require("body-parser");
const app = express();
const axios = require("axios");
const SSE = require("sse");
const cron = require("node-cron");
const WebSocket = require("ws");
/*
When there is a change in weather conditions for a subscribed location, send a 
notification to the subscribed clients via the SSE endpoint and WebSocket connection
*/
const PORT = 8080 ;
const WEATHER_API_KEY ="2d39a0f72e2a31d915c96fb677ff378f";
const subscribtions ={};





//middleware set up 
app.use(bodyParser.json());


//Routes 
app.post('/register' , (req , res) => {
    const {username  , email , password} = req.body;
    //check if the user fields are provided
    if(!username | !password , !email){
        res.status(400).send("User information required.")
    }
    subscribtions[username] = {email,password};
    res.status(200).send("User registered successfully!")
})

app.post('/subscribe' , (req, res) =>{
    const { username, location } = req.body;
    if(!username || !location){
        res.status(400).send("User information required .")
    }
    if(!subscribtions[username]){
        res.status(404).send("username not found! , please register first")
    }
    // Subscribe the user to the location
    subscribtions[username].location = location;
    res.status(200).send("User subscribed successfully!");
})


app.post('/unsubscribe' , (req , res) => {
    const { username } = req.body; 
    if(!username){
        res.status(404).send("username not found!");
    }
    if(!subscribtions[username]){
        res.status(404).send("User not found , please register first!");
    }
    subscribtions[username].location = undefined;
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






// Start the server
app.listen(PORT, () => {  
    console.log(`Server is running on port ${PORT}`);
  });



