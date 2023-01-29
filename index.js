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

    //common airlines
    app.get("/airLines", async (req, res) => {
      const airLines = [];
      const option = await flightListCollection.find({}).toArray();
      const results = option.map((opt) => opt.Onwards[0].OperatingCarrierName);
      results.forEach((result) => {
        if (!airLines.includes(result)) {
          airLines.push(result);
        }
      });
      res.send(airLines);
    });

    //filtering

    app.post("/airLines/filtering", async (req, res) => {
      const filter = req.body;

      console.log(filter);
      filter.price = filter.price == "" ? "1000,5000" : filter.price;
      filter.time = filter.time == "" ? "00:00 to 23:00" : filter.time;

      const minPrice = parseInt(filter.price.split(",")[0]);
      const maxPrice = parseInt(filter.price.split(",")[1]);

      const startingValue = filter.time.split(" ")[0];
      const endingValue = filter.time.split(" ")[2];

      const airLine = await flightListCollection
        .find({
          $and: [
            {
              Onwards: {
                $elemMatch: {
                  OperatingCarrierName: filter.name,
                  DepartureTime: { $gte: startingValue, $lte: endingValue },
                },
              },
            },
            { TotalPrice: { $gte: minPrice, $lte: maxPrice } },
          ],
        })
        .toArray();

      res.send(airLine);
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
