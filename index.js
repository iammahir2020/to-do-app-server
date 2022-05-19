const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());

function varifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send([{ message: "Unauthorized Access" }]);
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send([{ message: "Forbidden Access" }]);
    }
    console.log(decoded);
    req.decoded = decoded;
    next();
  });
  //   next();
}

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

    app.post("/token", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, {
        expiresIn: "1d",
      });

      res.send({ token });
    });

    app.get("/task", varifyJWT, async (req, res) => {
      const decodedEmail = req.decoded.email;
      const email = req.query.email;
      if (decodedEmail === email) {
        const query = {
          email: email,
        };
        const tasks = await taskCollection.find(query).toArray();
        res.send(tasks);
      } else {
        return res.status(403).send([{ message: "Forbidden Access" }]);
      }
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
