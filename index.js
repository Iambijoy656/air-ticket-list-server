const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5001;
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();

//midleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.iyuahvh.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    const flightListCollection = client
      .db("bimanBangladesh")
      .collection("flightList");

    app.get("/flightList", async (req, res) => {
      const query = {};
      const option = await flightListCollection.find(query).toArray();
      res.send(option);
    });
  } finally {
  }
}
run().catch(console.log);

app.get("/", (req, res) => {
  res.send("flight ticket server is running");
});

app.listen(port, () => {
  console.log(`flight ticket server is running on ${port}`);
});
