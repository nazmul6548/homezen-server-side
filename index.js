const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5176'],
    credentials: true,
    optionSuccessStatus: 200,
  }
  app.use(cors(corsOptions))
  
  app.use(express.json())
//   app.use(cookieParser())
  



  const { MongoClient, ServerApiVersion } = require('mongodb');
  const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ce00xrg.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
  
  // Create a MongoClient with a MongoClientOptions object to set the Stable API version
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });
  
  async function run() {
    try {
     const houseCollection = client.db("realEstatePlatform").collection("house")
// get all house
     app.get("/house", async (req, res) => {
        const result = await houseCollection.find().toArray();
        res.send(result);
      });
      await client.db("admin").command({ ping: 1 });
      console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
      
    }
  }
  run().catch(console.dir);
  



  app.get('/', (req, res) => {
    res.send('Hello from platform Server..')
  })
  
  app.listen(port, () => {
    console.log(`platform is running on port ${port}`)
  })