const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const port = process.env.PORT || 5000

// middleware
const corsOptions = {
    origin: [ 'http://localhost:5175'],
    credentials: true,
    optionSuccessStatus: 200,
  }
  app.use(cors(corsOptions))
  
  app.use(express.json())
//   app.use(cookieParser())
  



  const { MongoClient, ServerApiVersion, ObjectId, Timestamp } = require('mongodb');
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
     const reviewCollection = client.db("realEstatePlatform").collection("reviews")
     const userCollection = client.db("realEstatePlatform").collection("users")
     const wishlistCollection = client.db("realEstatePlatform").collection("wishlist")
// 
// wishlist collection
app.post("/wishlist",async (req,res)=>{
  const property = req.body;
  const result = await wishlistCollection.insertOne(property)
  res.send(result)
})
    //  get user info by email
    app.get("/user/:email",async (req,res) => {
      const email=req.params.email
      const result = await userCollection.findOne({email})
      res.send(result)
    })
    //  save user data in db
app.put('/user',async (req,res) => {
    const user = req.body;
    const query = {email:user?.email}
    const isExist =  await userCollection.findOne(query);
    if (isExist) {
      if (user.status === 'Requested') {
        // if existing user try to change his role
        const result = await userCollection.updateOne(query, {
          $set: { status: user?.status },
        })
        return res.send(result)
      } else {
        // if existing user login again
        return res.send(isExist)
      }
    }
    // save user 1st time
    const option = {upsert:true}
    
    const updateDoc = {
        $set:{
            ...user,
            Timestamp:Date.now(),
        },
    }
    const result = await userCollection.updateOne(query, updateDoc,option)
})

 // get all users data from db
 app.get('/users', async (req, res) => {
    const result = await userCollection.find().toArray()
    res.send(result)
  })


    //update a user role
    app.patch('/users/update/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const query = { email }
      const updateDoc = {
        $set: { ...user, timestamp: Date.now() },
      }
      const result = await userCollection.updateOne(query, updateDoc)
      res.send(result)
    })
    // delte admin can 
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid ID format" });
      }
      const query = { _id: new ObjectId(id) };
      const result = await userCollection.deleteOne(query);
      if (result.deletedCount === 0) {
        return res.status(404).send({ error: "User not found" });
      }
      res.send(result);
    });
// get all house
     app.get("/house", async (req, res) => {
        const result = await houseCollection.find().toArray();
        res.send(result);
      });
    //   get for email
    app.get("/myaddedhouse/:email",async (req, res) => {
        const email = req.params.email;
        let query = {'agent.email': email}

        const result = await houseCollection.find(query).toArray();
        res.send(result);
    })

    // delete add properties
    app.delete("/myaddedhouse/:id", async (req, res) => {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: "Invalid ID format" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await houseCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "User not found" });
        }
        res.send(result);
      });
    //   post property
    app.post("/house",async (req,res)=>{
        const property = req.body;
        const result = await houseCollection.insertOne(property)
        res.send(result)
    })
    
    //   details for house
     app.get("/house/:id", async (req, res) => {
        const  id  = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await houseCollection.findOne(query);
        res.send(result);
      });
      // reviews post 
      app.post("/reviews",async (req,res)=>{
        const property = req.body;
        const result = await reviewCollection.insertOne(property)
        res.send(result)
    })

    //   reviews get
    app.get("/reviews", async (req, res) => {
        const result = await reviewCollection.find().toArray();
        res.send(result);
      });
    //   reviews get last 3
    app.get("/review", async (req, res) => {
      try {
          const result = await reviewCollection.find().sort({ _id: -1 }).limit(3).toArray();
          res.send(result);
      } catch (error) {
          console.error("Failed to retrieve reviews:", error);
          res.status(500).send("Internal Server Error");
      }
  });

      // reviews delte from admin
      app.delete("/reviews/:id", async (req, res) => {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ error: "Invalid ID format" });
        }
        const query = { _id: new ObjectId(id) };
        const result = await reviewCollection.deleteOne(query);
        if (result.deletedCount === 0) {
          return res.status(404).send({ error: "User not found" });
        }
        res.send(result);
      });


      // get reviews which user add
      app.get("/reviews/:email",async (req, res) => {
        const email = req.params.email;
        let query = {'reviewerEmail': email}

        const result = await reviewCollection.find(query).toArray();
        res.send(result);
    })
     // delete add review 
     app.delete("/review/:id", async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: "Invalid ID format" });
      }
      const query = { _id: new ObjectId(id) };
      const result = await reviewCollection.deleteOne(query);
      if (result.deletedCount === 0) {
        return res.status(404).send({ error: "User not found" });
      }
      res.send(result);
    });
    
    //   await client.db("admin").command({ ping: 1 });
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