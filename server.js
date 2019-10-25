// Import express for creating REST APIs
const express = require('express');

const app = express();

// Import MongoDB client package
const { MongoClient } = require('mongodb');
const { password } = require('./password');

const uri = `mongodb+srv://admin:${password}@course-plan-t2nrj.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// Load all files in /public folder
app.use(express.static(`${__dirname}/public`));

app.get('/api/1.0/requirements', (req, res) => {
    // API endpoint to extract all requirements
    // Queries: college, major, minor (can be separated by comma for multiple entries
    // (e.g. college=EN,AS)

    const { query } = req;
    // Seach for documents by value
    // By default set university requirements
    let find = ['UNI'];

    if (query.college) {
        find = find.concat(query.college.split(','));
    }
    if (query.major) {
        find = find.concat(query.major.split(','));
    }
    if (query.minor) {
        find = find.concat(query.minor.split(','));
    }

    client.connect((err) => {
        if (err) throw err;
        const collection = client.db('course-plan').collection('requirements');
        // Search database with find parameters
        collection.find({ value: { $in: find } }).toArray((err1, doc) => {
            res.send(doc);

            // Close connection
            client.close();
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
