import fs from 'node:fs/promises';

import bodyParser from 'body-parser';
import express from 'express';
import { MEALS_DATA } from './data/available-meals';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
//   next();
// });

app.get('/',(req,res)=>{
  res.send('Connected to the server')
})

app.get('/about',(req,res)=>{
  res.send('<h1>This is an about page</h1>')
})

app.get('/allMeals',async(req,res)=>{
  try {
    const meals = await fs.readFile(__dirname +'/data/available-meals.json', 'utf8');
    res.send(JSON.parse(meals))
  } catch (error) {
    res.send({message:error.message})
  }
})

app.get('/allJsonMeals',(req,res)=>{
  res.json(MEALS_DATA)
})

app.get('/meals', async (req, res) => {
  const meals = await fs.readFile('./data/available-meals.json', 'utf8');
  res.json(JSON.parse(meals));
});

app.get('/orders', async (req, res) => {
  const orders = await fs.readFile('./data/orders.json', 'utf8');
  res.json(JSON.parse(orders));
});

app.post('/orders', async (req, res) => {
  const orderData = req.body.order;

  if (orderData === null || orderData.items === null || orderData.items.length === 0) {
    return res
      .status(400)
      .json({ message: 'Missing data.' });
  }

  if (
    orderData.customer.email === null ||
    !orderData.customer.email.includes('@') ||
    orderData.customer.name === null ||
    orderData.customer.name.trim() === '' ||
    orderData.customer.street === null ||
    orderData.customer.street.trim() === '' ||
    orderData.customer['postal-code'] === null ||
    orderData.customer['postal-code'].trim() === '' ||
    orderData.customer.city === null ||
    orderData.customer.city.trim() === ''
  ) {
    return res.status(400).json({
      message:
        'Missing data: Email, name, street, postal code or city is missing.',
    });
  }

  const newOrder = {
    ...orderData,
    id: (Math.random() * 1000).toString(),
  };
  const orders = await fs.readFile('./data/orders.json', 'utf8');
  const allOrders = JSON.parse(orders);
  allOrders.push(newOrder);
  await fs.writeFile('./data/orders.json', JSON.stringify(allOrders));
  res.status(201).json({ message: 'Order created!' });
});

// app.use((req, res) => {
//   if (req.method === 'OPTIONS') {
//     return res.sendStatus(200);
//   }

//   res.status(404).json({ message: 'Not found' });
// });

app.listen(3000);
