const { requirements } = require('./reqs-data');

// MongoDB credentials setup
const MongoClient = require('mongodb').MongoClient;
const { password } = require('../password');
const uri = `mongodb+srv://admin:${password}@course-plan-t2nrj.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

function addRequirement() {
    client.connect((err, db) => {
        if (err) throw err;

        const dbo = db.db('course-plan');
        dbo.collection('requirements').insertOne(requirements.as, (err, res) => {
            if (err) throw err;
            return db.close();
        })
    })
}

addRequirement();