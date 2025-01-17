
const express = require("express")
const mongoose = require("mongoose")
const {Schema, model} = require("mongoose")
const app = express()
app.use(express.json())
const port = 10000
const mongoUrl = "mongodb+srv://aarishansari08:NiiBJDnVJz30Lqhp@cluster0.v3plw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


const connection = async () =>{
    try {
        console.log("DB conected");
        const conn= await mongoose.connect(mongoUrl)
        console.log("DB conected");
        }
    catch(error)
    {
        console.error(error.message);
    }
}

connection();


/*
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://aarishansari08:NiiBJDnVJz30Lqhp@cluster0.v3plw.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
*/




//schma and model
const userSchema = new Schema({
    name:{
        type: String,
        required: true
    },
    task:{
        type: String,
        required: true
    }
})

const User = model("User", userSchema)

//DB and connection


//CRUD operations

//create
app.post('/', async(req,res)=>{
    try{
        const {name, task} = req.body;
        newuser = await User.create({name, task});
        await newuser.save();
        res.status(201).json({
            message: "User created successfully",
            user: newuser
        });
        }
    catch(error){
        res.status(500).json({message: error.message});
    }
})

//read
app.get('/', async(req,res)=>{
    try{
        user = await User.find();
        res.status(200).json({
            message: "data fetched successfully",
            data: user
        });
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
})


//update
app.put('/:id', async(req, res)=>{
    try{
        const {id} = req.params;
        const {name, task} = req.body;
        const user = await User.findByIdAndUpdate(id, {name, task}, {new: true});
        res.status(200).json({
            message: "User updated successfully",
            user: user
        })}
    catch(error){
        res.status(500).json({message: error.message});
    }
})

//delete
app.delete('/:id', async(req, res)=>{
    try{
        const {id} = req.params;
        const user = await User.findByIdAndDelete(id);
        res.status(200).json({
            message: "User deleted successfully",
            user: user
            })
    }
    catch(error){
        res.status(500).json({message: error.message});
    }
})


app.listen(port, ()=>{
    console.log(`Server is running on port ${port}`)
})


