const express = require('express')
const cors = require('cors')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')

const app = express()
const port = process.env.PORT || 5000

// middlewares
app.use(cors())
app.use(express.json())

// Database Connection
const uri = process.env.DB_URI

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
})

async function run() {
  try {
    const homesCollection = client.db('puranbazar').collection('category')

    console.log('Database Connected...')
  } finally {
  }
}

run().catch(err => console.error(err))

app.get("/", async (req, res) => {
  res.send("Puran bazar server  is running ....");
});

app.listen(port, () => console.log(`Doctors portal running on ${port}`));
