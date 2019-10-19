const password = require('./password').password;
// Import express for creating REST APIs
const express = require('express');
const app = express();

// Import MongoDB client package
const MongoClient = require('mongodb').MongoClient;
const uri = `mongodb+srv://admin:${password}@course-plan-t2nrj.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Load all files in /public folder
app.use(express.static(__dirname + '/public'));

app.get("/get-data", (req, res) => {
    client.connect(err => {
        const collection = client.db("course-plan").collection("requirements");
        collection.find().toArray((err, doc) => {
            res.send(doc);
            client.close();
        });
    })
})

const PORT = 3000;
app.listen(PORT, () => {
    console.log("Listening on port "+PORT);
});