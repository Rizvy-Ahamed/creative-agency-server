const express = require('express')
const bodyParser = require('body-parser');
const cors = require('cors')
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
const MongoClient = require('mongodb').MongoClient;
require('dotenv').config()
const ObjectId = require('mongodb').ObjectId;

const uri = `mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0-shard-00-00.f6mmc.mongodb.net:27017,cluster0-shard-00-01.f6mmc.mongodb.net:27017,cluster0-shard-00-02.f6mmc.mongodb.net:27017/${process.DB_NAME}?ssl=true&replicaSet=atlas-lm8uj6-shard-0&authSource=admin&retryWrites=true&w=majority`;

const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('doctors'));
app.use(fileUpload());

const port = 5000


app.get('/', (req, res) => {
  res.send('Hello World!')
})


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const Products = client.db("Agency").collection("AgencyServices");
  const orderCollection = client.db("Agency").collection("Orders");
  const reviewCollection = client.db("Agency").collection("Reviews");
  const adminCollection = client.db("Agency").collection("Admins");


  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const Description = req.body.Description;
    const email = req.body.email;
    const newImg = file.data;
    const encImg = newImg.toString('base64');

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    };

    Products.insertOne({ name, email, image, Description })
      .then(result => {
        res.send(result.insertedCount > 0);
      })
    })

    app.get('/service', (req, res) => {
      Products.find({})
        .toArray((err, documents) => {
          res.send(documents);
        })
    })

    app.get('/service/item/:_id', (req, res) => {
      Products.find({ _id: ObjectId(req.params._id) })
        .toArray((err, documents) => {
          res.send(documents[0]);
        })
    })


    app.post('/addOrder', (req, res) => {
      const file = req.files.file;
      const name = req.body.name;
      const serviceName = req.body.serviceName;
      const email = req.body.email;
      const description = req.body.description;
      const newImg = file.data;
      const status = req.body.status;
      const encImg = newImg.toString('base64');

      var image = {
          contentType: file.mimetype,
          size: file.size,
          img: Buffer.from(encImg, 'base64')
      };

      orderCollection.insertOne({ name, serviceName, email, description, status, image })
        .then(result => {
            res.send(result.insertedCount > 0);
        })
    })

    app.get('/Orders', (req, res) => {
      orderCollection.find({ email: req.query.email })
          .toArray((err, documents) => {
              res.send(documents);
          })
    });

    app.get('/allServiceList', (req, res) => {
      orderCollection.find({})
        .toArray((err, documents) => {
          res.send(documents);
        })
    });

    
    app.patch('/update/:id', (req, res) => {
      ordersCollection.updateOne({_id: ObjectId(req.params.id)},
      {
          $set: {status: req.body.status}
      })
      .then(result => {
          res.send(result.modifiedCount > 0);
      })
    })



    app.post('/addReview', (req, res) => {
        const reviewInfo = req.body;
        reviewCollection.insertOne(reviewInfo)
          .then(result => {
              res.send(result.insertedCount > 0)
          })
    })

    app.get('/review', (req, res) => {
        reviewCollection.find({})
          .toArray((err, documents) => {
              res.send(documents);
          })
    });

    app.post('/addAdmin', (req, res) => {
        const adminInfo = req.body;
          adminCollection.insertOne(adminInfo)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/admin', (req, res) => {
        adminCollection.find({ email: req.query.email })
          .toArray((err, documents) => {
              res.send(documents);
          })
    });

});

app.listen(process.env.PORT || port)