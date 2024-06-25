require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const cors = require("cors");

const PORT = process.env.PORT || 3000;

const app = express();
app.use(express.json());
app.use(cors());

app.use("/", (req, res) => {
  res.send("This Server is running");
});

const uri = process.env.DB_URL;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const run = async () => {
  try {
    await client.connect();

    // all collections

    // my own collection
    const touristSpotCollection = client
      .db("touristspotDB")
      .collection("touristspots");

    // users added collection
    const allTouristSpots = client
      .db("touristspotDB")
      .collection("alltouristspots");

    // coutries collection
    const countryNames = client.db("touristspotDB").collection("countrynames");

    // all collections

    // my own   tourist spots
    app.get("/touristspot", async (req, res) => {
      try {
        const touristsSpots = await touristSpotCollection.find().toArray();
        res.status(200).json(touristsSpots);
      } catch (error) {
        res.status(500).json({
          error: "An error occurred while get  the my own tourist spots.",
        });
      }
    });

    // my own tourist spot single data
    app.get("/touristspot/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const touristspot = await touristSpotCollection.findOne({
          _id: new ObjectId(id),
        });

        touristspot
          ? res.status(200).json(touristspot)
          : res.status(404).json({ error: "Tourist Spost Not Found" });
      } catch (error) {
        res.status(500).json({
          error: "An error occurred while getting the tourist spot.",
        });
      }
    });

    // Get all spot from  users added tourist spots
    app.get("/alltouristspots", async (req, res) => {
      try {
        const allSpots = await allTouristSpots.find().toArray();
        res.status(200).json(allSpots);
      } catch (error) {
        res.status(500).json({
          error: "An error occurred while fetching all tourist spots.",
        });
      }
    });

    // get spot details spot from users added tourist spots
    app.get("/alltouristspots/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const spotDeatils = await allTouristSpots.findOne({
          _id: new ObjectId(id),
        });

        spotDeatils
          ? res.status(200).json(spotDeatils)
          : res.status(404).json({ error: "Tourist Spost Not Found" });
      } catch (error) {
        res.status(500).json({
          error: "An error occurred while fetching all tourist spots.",
        });
      }
    });

    // my list data filter by user email
    app.get("/alltouristspotss/:email", async (req, res) => {
      try {
        const email = { userEmail: req.params.email };
        const filteredSpot = await allTouristSpots.find(email).toArray();

        filteredSpot
          ? res.status(200).json(filteredSpot)
          : res.status(404).json({ error: "Not Avilable your added Data" });
      } catch (error) {
        res.status(500).json({
          error: "An error occurred while fetching all tourist spots by email.",
        });
      }
    });

    // get coutries information
    app.get("/countrynames", async (req, res) => {
      try {
        const countries = await countryNames.find().toArray();
        res.status(200).json(countries);
      } catch (error) {
        res.status(500).json({
          error: "An error occurred while fetching coutry names .",
        });
      }
    });

    // get data by countryname
    app.get("/countryname/:country", async (req, res) => {
      try {
        const matchName = { countryName: req.params.country.toLowerCase() };

        console.log("matchName:", matchName);
        const matchedCountries = await allTouristSpots
          .find(matchName)
          .toArray();
        console.log("matchedCountries:", matchedCountries);

        matchedCountries.length > 0
          ? res.status(200).json(matchedCountries)
          : res.status(404).json({ error: "Not Found" });
      } catch (error) {
        res.status(500).json({
          error: "An error occurred while fetching country names.",
        });
      }
    });

    // tourist sposts post method
    app.post("/touristspot", async (req, res) => {
      try {
        const touristspots = req.body;
        console.log("touristspots:", touristspots);
        if (!Array.isArray(touristspots)) {
          return res
            .status(400)
            .json({ error: "Request body must be an array" });
        }
        const result = await touristSpotCollection.insertMany(touristspots);
        res.status(201).json(result);
      } catch (error) {
        res
          .status(500)
          .json({ error: "An error occurred while adding the tourist spots." });
      }
    });

    // post users tourist spots
    app.post("/alltouristspots", async (req, res) => {
      try {
        const newSpot = req.body;
        console.log("newSpot:", newSpot);
        const result = await allTouristSpots.insertOne(newSpot);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({
          error: "An error occurred while user adding the tourist spots.",
        });
      }
    });

    // post country names
    app.post("/countrynames", async (req, res) => {
      try {
        const names = req.body;

        if (!Array.isArray(names)) {
          res.status(400).json({ error: "Request body must be an array" });
        }

        const result = await countryNames.insertMany(names);
        res.status(201).json(result);
      } catch (error) {
        res.status(500).json({
          error: "An error occurred while user adding the tourist spots.",
        });
      }
    });

    // update users added tourist spot
    app.put("/updatespot/:id", async (req, res) => {
      try {
        const id = req.params.id;

        const {
          imageUrl,
          touristSpotName,
          countryName,
          location,
          shortDescription,
          averageCost,
          seasonality,
          travelTime,
          totalVisitorsPerYear,
        } = req.body;

        const updatedSpot = {
          $set: {
            imageUrl,
            touristSpotName,
            countryName,
            location,
            shortDescription,
            averageCost,
            seasonality,
            travelTime,
            totalVisitorsPerYear,
          },
        };

        const result = await allTouristSpots.findOneAndUpdate(
          { _id: new ObjectId(id) },
          updatedSpot,
          { returnOriginal: false }
        );
        if (result) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ error: "Tourist spot not found." });
        }
      } catch (error) {
        res.status(500).json({
          error:
            "An error occurred while user adding the alltouristspots spots.",
        });
      }
    });

    // delete spot from mylist
    app.delete("/alltouristspot/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const deleteSpot = await allTouristSpots.deleteOne({
          _id: new ObjectId(id),
        });

        deleteSpot.deletedCount === 1
          ? res.json({ meassage: "Successfully deleted one document." })
          : res.json({ meassage: "No documents matched the id." });
      } catch (error) {
        console.log("error:", error);
      }
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
};
run().catch(console.dir);

app.listen(PORT, () => {
  console.log(`Server running at this port http://localhost:${PORT}`);
});
