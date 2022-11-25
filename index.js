const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middlewares
app.use(cors());
app.use(express.json());

// Database Connection
const uri = process.env.DB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    /**=======================================
                     mongodb start 
      ======================================*/
    const categoryCollection = client.db("puranbazar").collection("category");
    /**=======================================
                       mongodb End 
      ======================================*/
    //-------------------------------------------------------------------------------------
    /**=======================================
                get api categories
      =======================================*/
    app.get("/categories", async (req, res) => {
      const query = {};
      const cursor = categoryCollection.find(query);
      const categories = await cursor.toArray();
      res.send(categories);
    });

    app.get("/categories/:slug", async (req, res) => {
      const slug = req.params.slug;
      console.log(slug);
      const query = { slug: slug };
      const categorie = await categoryCollection.findOne(query);
      res.send(categorie);
    });
    /**=======================================
                  Post service
      =======================================*/
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", async (req, res) => {
  res.send("Puran bazar server  is running ....");
});

app.listen(port, () => console.log(`Doctors portal running on ${port}`));
