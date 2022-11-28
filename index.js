const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
var jwt = require("jsonwebtoken");

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

/**=======================================
                     verifyJWT
  =====================================*/

function verifyJWT(req, res, next) {
  console.log("varifay", req.headers.authorization);
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send("unauthorized access");
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(
    token,
    "6ad8939f3e9b1f5d806482d70462ce4e8031b59bd793ef0fcef0b1f8c11154303580bf43437b9",
    function (err, decoded) {
      if (err) {
        return res.status(403).send({ message: "forbidden access" });
      }
      req.decoded = decoded;
      next();
    }
  );
}

async function run() {
  try {
    /**=======================================
                     mongodb start 
      ======================================*/
    const categoryCollection = client.db("puranbazar").collection("category");
    const usersCollection = client.db("puranbazar").collection("users");
    const bookingsCollection = client.db("puranbazar").collection("bookings");
    const productsCollection = client.db("puranbazar").collection("products");
    /**=======================================
                       mongodb End 
      ======================================*/

    //-------------------------------------------------------------------------------------
    /**=======================================
                Put USERS api 
      =======================================*/
    app.put("/user/:email", async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      console.log("result ", result);
      const token = jwt.sign(
        user,
        "6ad8939f3e9b1f5d806482d70462ce4e8031b59bd793ef0fcef0b1f8c11154303580bf43437b9",
        {
          expiresIn: "1d",
        }
      );
      // console.log("token ", token, user);
      res.send({ result, token });
    });
    /**=======================================
                get api categories
      =======================================*/
    app.get("/categories", async (req, res) => {
      const query = {};
      const tocken = req.headers.authorization;
      console.log("varifay tokcen get", tocken);
      const cursor = categoryCollection.find(query);
      const categories = await cursor.toArray();
      res.send(categories);
    });

    app.get("/categories/:slug", verifyJWT, async (req, res) => {
      const slug = req.params.slug;
      const query = { slug: slug };
      const categorie = await categoryCollection.findOne(query);
      res.send(categorie);
    });

    /**=======================================
                  get ptodats api 
      =======================================*/
    app.get("/products/:name", verifyJWT, async (req, res) => {
      const category = req.params.name;
      const query = { product_category_id: category };
      console.log(category, query);
      // const tocken = req.headers.authorization;
      const products = await productsCollection.find(query).toArray();
      // console.log("varifay tokcen get", products);
      res.send(products);
    });

    /**=======================================
                  POST ptodats api 
      =======================================*/

    app.post("/products", verifyJWT, async (req, res) => {
      const addProduct = req.body;
      const result = await productsCollection.insertOne(addProduct);
      res.send(result);
    });

    /**=======================================
                  get ptodats api 
      =======================================*/

    app.post("/bookings", async (req, res) => {
      const booking = req.body;
      const query = {
        bookingDate: booking.bookingDate,
        email: booking.email,
        title: booking.title,
      };

      console.log(query);
      const alreadyBooked = await bookingsCollection.find(query).toArray();

      if (alreadyBooked.length) {
        const message = `You have already booked ${booking.title}`;
        return res.send({ acknowledged: false, message });
      }
      const result = await bookingsCollection.insertOne(booking);
      res.send(result);
    });

    /**=======================================
              Admin and Sellar ptodats api 
      =======================================*/

    app.get("/users/account-type/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      res.send({ isSeller: user?.accountType === "seller" });
    });
  } finally {
  }
}

run().catch((err) => console.error(err));

app.get("/", async (req, res) => {
  res.send("Puran bazar server  is running ....");
});

app.listen(port, () => console.log(`Puran bazar running on ${port}`));
