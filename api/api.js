// import request package
const request = require('request');
// import Firebase from 'firebase'
const firebase = require('firebase');
// import firebase configuration credentials hidden from gith
const { firebaseConfig } = require('./config');

// getCourses("FA19", (res) => {
// }, true)

function addToFirebase(obj) {
    // Description: function to add object to CoursePlan firebase
    // @obj: object to add

    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }
    const db = firebase.firestore();

    // firebase collection
    const emailsCollection = db.collection('courses');

    emailsCollection.add(obj).then(() => {
        console.log(`${obj.subject} ${obj.catalogNbr} added to Firebase`);
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

function getRosters(callback) {
    // Description: return a list of rosters
    // @callback: function applied to the list of rosters

    request('https://classes.cornell.edu/api/2.0/config/rosters.json', { json: true }, (err, res, body) => {
        if (err) throw err;
        const rosArr = [];
        body.data.rosters.map((ros) => rosArr.push(ros.slug));
        return callback(rosArr);
    });
}

function getSubjects(ros, callback) {
    // Description: return a list of all abbreviated subject values
    // @ros: roster used to retrieve subjects array
    // @callback: function applied to the array of subjects

    request(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${ros}`, { json: true }, (err, res, body) => {
        if (err) throw err;
        if (!body.data) throw URIError;
        const subjectsArr = [];
        body.data.subjects.forEach((sub) => {
            subjectsArr.push(sub.value);
        });
        return callback(subjectsArr);
    });
}

function getCourses(ros, callback, addToDB = false) {
    // Description: function to get all courses from specific roster
    // @ros: roster used to retrieve courses array
    // @callback: function applied to the array of courses
    // @addToDB: boolean on whether the course is added to DB

    const result = [];
    getSubjects(ros, (subjects) => {
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
                        const add = course;
                        // Add custom attributes
                        add.title = `${course.subject} ${course.catalogNbr}: ${course.titleLong}`;
                        add.code = `${course.subject} ${course.catalogNbr}`;
                        add.year = parseInt(`20${ros.slice(2)}`, 10);
                        add.season = ros.slice(0, 2);
                        add.semester = ros;
                        add.parsedPreReqs = parsePreReqs(subjects, course.catalogPrereqCoreq);

                        if (addToDB) {
                            addToFirebase(add);
                        }

                        result.push(add);
                        cFill.push(add);
                        if (sFill.length === subjects.length && cFill.length === courses.length) {
                            callback(result);
                        }
                    });
                }
            });
        });
    });
}

function getAll(callback, addToDB = false) {
    // Description: function to get all courses
    // @callback: function aplied to the array of courses
    // @addToDB: boolean on whether the course is added to DB

    getRosters((rosters) => {
        rosters.map((ros) => getCourses(ros, (courseArr) => callback(courseArr), addToDB));
    });
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
            // Add data to db
        });
    });
}
