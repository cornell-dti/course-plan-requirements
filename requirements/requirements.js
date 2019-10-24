// MongoDB credentials setup
const MongoClient = require('mongodb').MongoClient;
const { password } = require('./password');
const uri = `mongodb+srv://admin:${password}@course-plan-t2nrj.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

function addRequirement() {
    client.connect((err) => {
        const collection = client.db('course-plan').collection('requirements');
        
    })
}