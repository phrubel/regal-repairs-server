const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const fileUpload = require('express-fileupload')
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs-extra')
var cors = require('cors')
require('dotenv').config()





const app = express()
app.use(cors())
app.use(express.json())
app.use(express.static('doctors'));
app.use(fileUpload())
const port = process.env.PORT || 5000



app.get('/', (req, res) => {
    res.send('Hello World!')
})






// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yo3qi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
console.log(process.env.DB_USER,process.env.DB_PASS,process.env.DB_NAME)

const uri = "mongodb+srv://serviceAdmin:newPass24@cluster0.klyaj.mongodb.net/regalRepairs?retryWrites=true&w=majority";
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.klyaj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    console.log('database connct success',err)
    const repairCollection = client.db("regalRepairs").collection("repair");
    const serviceCollection = client.db("regalRepairs").collection("service");
    const adminCollection = client.db("regalRepairs").collection("admin");
    const testimonial = client.db("regalRepairs").collection("testimonial");
    const orderCollection = client.db("regalRepairs").collection("order");



    //add a new service in database by admin
    app.post('/addAService', (req, res) => {
        const file = req.files.file;
        console.log(file)
        const serviceName = req.body.name;
        const serviceDescription = req.body.serviceDescription;
        const servicePrice = req.body.servicePrice;
        const newImg = file.data
        const encImg = newImg.toString('base64')

        let image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64')
        };
        serviceCollection.insertOne({ serviceName, serviceDescription, servicePrice, image })
            .then(result => {
                res.send(result.insertedCount > 0)
            })

    })

    // get service
    app.get('/allService', (req, res) => {
        serviceCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)

            })
    })

    // get allService for managed by admin
    app.get('/manageService', (req, res) => {
        serviceCollection.find({})
            .toArray((err, service) => {
                res.send(service)
            })
    })


    // make a admin
    app.post('/makeAAdmin', (req, res) => {
        adminCollection.insertOne(req.body)
        console.log('admin suucess')
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // get admin
    app.get('/admin', (req, res) => {
        const email = req.query.email
        adminCollection.find({ email })
            .toArray((err, admin) => {
                res.send(admin.length > 0)
            })
    })


    // added testimonial by customer
    app.post('/addTestimonial', (req, res) => {
        testimonial.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    // get testimonial 
    app.get('/testimonial', (req, res) => {
        testimonial.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })

    // Add order by customer
    app.post('/addOrder', (req, res) => {
        const orderDetails=req.body
        console.log(orderDetails)
        orderCollection.insertOne(orderDetails)
            .then(result => {
                res.send(result.insertedCount > 0)
            })

    })

    // get order 
    app.get('/order/:id', (req, res) => {
        serviceCollection.find({ _id: ObjectId(req.params.id) })
            .toArray((err, documents) => {
                res.send(documents[0])
            })
    })

    // get specific order
    app.get('/userOrder', (req, res) => {
        orderCollection.find({ email: req.query.email })
            .toArray((error, documents) => {
                res.send(documents)
            })
    })

    // get all order for admin
    app.get('/allOrder', (req, res) => {
        orderCollection.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })




    //   manage service by admin
    // delete service
    app.delete('/service/:id', (req, res) => {
        const id = ObjectId(req.params.id)
        serviceCollection.findOneAndDelete({ _id: id })
            .then(result => {
                res.send({ success: !!result.value })
            })
    })

});



process.env.PORT || port
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
  })