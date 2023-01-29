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

    app.post("/airLines/filtering", async (req, res) => {
      const filter = req.body;
      console.log(filter);
      const minPrice = filter.price.split(",")[0];
      const maxPrice = filter.price.split(",")[1];

      const startingValue = filter.time.split(" ")[0];
      const endingValue = filter.time.split(" ")[2];

      const airLine = await flightListCollection
        .find({
          $and: [
            {
              Onwards: {
                $elemMatch: { OperatingCarrierName: filter.name },
              },
            },
            { TotalPrice: { $gte: minPrice, $lte:maxPrice } },

            // {DepartureTime:{$gte: startingValue, $lte: endingValue}},
          ],
        })
        .toArray();
      console.log(airLine);
      res.send(airLine);
    });

    // // //Depart time
    // app.get("/departTimes/:time", async (req, res) => {
    //   const time = req.params.time;
    //   console.log(time);

    //   const result = await flightListCollection.find({}).toArray();

    //   const startingValue = time.split(" ")[0];
    //   const endingValue = time.split(" ")[2];
    //   const departFlights = result.filter(
    //     (flight) =>
    //       flight.Onwards[0].DepartureTime.slice(11, 16) >= startingValue &&
    //       flight.Onwards[0].DepartureTime.slice(11, 16) <= endingValue
    //   );

    //   res.send(departFlights);
    // });



    // price filter
    // app.get("/priceFilter/:price", async (req, res) => {
    //   const price = req.params.price;
    //   const result = await flightListCollection.find({}).toArray();
    //   const minPrice = price.split(",")[0];
    //   const maxPrice = price.split(",")[1];
    //   const priceFilterFlights = result.filter(
    //     (flight) =>
    //       flight.TotalPrice >= minPrice && flight.TotalPrice <= maxPrice
    //   );
    //   res.send(priceFilterFlights);
    // });
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
