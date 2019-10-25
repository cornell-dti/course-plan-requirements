const request = require('request');

// MongoDB credentials setup
const { MongoClient } = require('mongodb');

const { password } = require('../password');

const uri = `mongodb+srv://admin:${password}@course-plan-t2nrj.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });


function getSubjects(ros, callback) {
    // Description: return a list of all abbreviated subject values
    // ros: roster used to retrieve subjects array
    // callback: function applied to the array of subjects

    request(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${ros}`, { json: true }, (err, res, subject) => {
        if (err) throw err;
        if (!subject.data) throw URIError;
        const result = [];
        subject.data.subjects.forEach((sub) => {
            result.push(sub.value);
        });
        return callback(result);
    });
}

function getCourses(ros, callback) {
    // Description: function to get all courses from specific roster
    // ros: roster used to retrieve courses array
    // callback: function applied to the array of courses

    const result = [];
    getSubjects('FA19', (subjects) => {
        // Array of subjects
        const sFill = [];
        subjects.forEach((sub) => {
            // Look through all subjects
            request(`https://classes.cornell.edu/api/2.0/search/classes.json?roster=${ros}&subject=${sub}`, { json: true }, (err, res, body) => {
                if (body) {
                    sFill.push(sub);
                    // array of courses
                    const cFill = [];
                    const courses = body.data.classes;

                    courses.forEach((course) => {
                        result.push(course);
                        cFill.push(course);
                        if (sFill.length === subjects.length && cFill.length === courses.length) {
                            callback(result);
                        }
                    });
                }
            });
        });
    });
}

function parsePreReqs(subjects, str) {
    // Description: returns array of courses found in string
    // subjects: list of subjects to guide the search for course names
    // str: a string with (potentially) full course names

    // Sorted to search full subject names first
    subjects.sort((a, b) => b.length - a.length);

    const regEx = new RegExp(`(${subjects.join('|')}) [0-9]{4}`, 'm');

    const prereqs = [];
    let line = str;
    while (regEx.test(line)) {
        const result = regEx.exec(line);
        const { index } = result;

        prereqs.push(result[0]);

        line = line.substring(index + result[0].length);
    }
    return prereqs;
}

function parseData(ros) {
    // Description: function to parse all prerequirement in a given roster
    // ros: roster used to scrape all courses
    getCourses(ros, (res) => {
        // First retrieve all courses
        const prereqs = [];
        getSubjects(ros, (subjects) => {
            res.forEach((course) => {
                const apiPreReq = course.catalogPrereqCoreq;
                if (apiPreReq !== '' && apiPreReq !== null) {
                    const parsedPreReq = parsePreReqs(subjects, apiPreReq);
                    prereqs.push({ course: `${course.subject} ${course.catalogNbr}`, string: apiPreReq, arr: parsedPreReq });
                }
            });
            client.connect((err, db) => {
                if (err) throw err;
                const dbo = db.db('course-plan');
                const myobj = { name: 'Pre-Requirements', data: prereqs };

                dbo.collection('prereqs').insertOne(myobj, (err1, res1) => {
                    if (err1) throw err1;
                    console.log(res1);
                    return db.close();
                });
            });
        });
    });
}
