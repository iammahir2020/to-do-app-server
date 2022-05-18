const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lim1g.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const taskCollection = client.db("toToApp").collection("tasks");

    app.get("/task", async (req, res) => {
      const email = req.query.email;
      const query = {
        email: email,
      };
      const tasks = await taskCollection.find(query).toArray();
      res.send(tasks);
    });

    app.post("/task", async (req, res) => {
      const task = req.body;
      console.log(task);
      const result = await taskCollection.insertOne(task);
      res.send(result);
    });

    app.delete("/task", async (req, res) => {
      const id = req.query.id;
      const query = {
        _id: ObjectId(id),
      };
      const result = await taskCollection.deleteOne(query);
      res.send(result);
    });

    app.put("/task", async (req, res) => {
      const id = req.query.id;
      const data = req.body;
      const filter = {
        _id: ObjectId(id),
      };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          complete: data.complete,
        },
      };
      const result = await taskCollection.updateOne(filter, updateDoc, options);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("To Do App server is runing");
});

app.listen(port, () => {
  console.log("Listening to port", port);
});
