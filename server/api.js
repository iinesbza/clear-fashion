const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const { MongoClient,ObjectId } = require('mongodb');

const MONGODB_URI = 'mongodb+srv://ibaazia:DA3DWV3GxZ8jW4v3@clearfashion.efr0okk.mongodb.net/?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'clearfashion';

const PORT = 8092;
const app = express();
module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());
app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

async function SearchProducts(filters,limite) {
  const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true });
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection('products');
  const result = await collection.find(filters).sort({"price":1}).limit(limite).toArray();
  await client.close();
  return result;
}


app.get('/products/search', async (req, res) => {
  const brand = req.query.brand || undefined;
  const limite = req.query.limit || 12;
  const price = req.query.price || undefined;
  let filters = {}

  // filter by brand 
  if(brand!== undefined){
    filters.brand=brand; 
  }

  //filter by price 
  if (price!== undefined){
    filters.price = {$lte : parseInt(price)}; 
  }

  const products_search = await SearchProducts(filters,parseInt(limite));
  //res.json(products_search);
  res.send(products_search);
});



// Fetch a specific product given his ID
async function findProductById(IdProduct) {
  const client = await MongoClient.connect(MONGODB_URI, { useNewUrlParser: true });
  const db = client.db(MONGODB_DB_NAME);
  const collection = db.collection('products');
  const result = await collection.find({"_id":ObjectId(IdProduct)}).toArray();
  await client.close();
  return result;
}

// Executes a request to get a product

app.get('/products/:id', async (req, res) => {
  const IdProduct = req.params.id;
  const product_id = await findProductById(IdProduct);
  res.send(product_id);
});

app.listen(PORT);
console.log(`📡 Running on port ${PORT}`);