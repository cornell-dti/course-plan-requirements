// MongoDB credentials setup
const { MongoClient } = require('mongodb');

const { password } = require('../password');

const uri = `mongodb+srv://admin:${password}@course-plan-t2nrj.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const requirements = require('./reqs-data.json');

function addRequirement() {
    // Add a document with requirement data from the reqs-data file

    // Establish connection to MongoDB
    client.connect((err, db) => {
        if (err) throw err;

        const dbo = db.db('course-plan');
        const insert = requirements.as;
        dbo.collection('requirements').insertOne(insert, (err2) => {
            if (err2) throw err2;

            // Close connection
            return client.close();
        });
    });
}

addRequirement();
