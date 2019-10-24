const request = require('request');
const express = require('express');

// MongoDB credentials setup
const MongoClient = require('mongodb').MongoClient;
const { password } = require('./password');
const uri = `mongodb+srv://admin:${password}@course-plan-t2nrj.mongodb.net/test?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const rosters = ["FA14","WI15","SP15","SU15","FA15","WI16","SP16","SU16","FA16","WI17","SP17","SU17","FA17","WI18","SP18","SU18","FA18","WI19","SP19","SU19","FA19","WI20"];
const ros = "FA19";

function getCourses(ros, callback) {
    // Function to get all courses from specific roster

    let result = [];
    getSubjects("FA19", subjects => {

        let subFill = [];
        subjects.map((sub) => {
            
            request(`https://classes.cornell.edu/api/2.0/search/classes.json?roster=${ros}&subject=${sub}`, { json: true }, (err, res, body) => {
                if (body) {
                    subFill.push(sub);
                    courseFill = [];
                    let courses = body.data.classes;

                    courses.map((course) => {
                        result.push(course);
                        courseFill.push(course);
                        if (subFill.length === subjects.length && courseFill.length === courses.length) {
                            return callback(result);
                        }
                    })
                }
            });
        });
    });
}

// Return a list of all abbreviated subject values
function getSubjects(ros, callback) {
    request(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${ros}`, { json: true }, (err, res, subject) => {
        if (err) throw err;
        if (!subject.data) throw URIError;
        let subjects = [];
        subject.data.subjects.map(sub => {
            subjects.push(sub.value);
        });
        return callback(subjects);
    });
}

// Returns full course name from string
function parsePreReqs(subjects, str) {

    // Sorted to search full subject names first
    subjects.sort((a, b) => b.length - a.length);

    const regEx = new RegExp(`(${subjects.join("|")}) [0-9]{4}`, 'm');

    let prereqs = [];
    while(regEx.test(str)) {
        let result = regEx.exec(str);
        let index = result.index;

        prereqs.push(result[0]);

        str = str.substring(index+result[0].length);
    }
    return prereqs;
}

function parseDdata(ros) {
    // Parse prerequirement from data in course roster API
    getCourses(ros, (res) => {

        let prereqs = [];
        getSubjects(ros, subjects => {
    
            res.map(course => {
                const apiPreReq = course.catalogPrereqCoreq;
                if (apiPreReq !== "" && apiPreReq !== null) {
                    const parsedPreReq = parsePreReqs(subjects, apiPreReq);
                    prereqs.push({course: course.subject+" "+course.catalogNbr, string: apiPreReq, arr: parsedPreReq});
                }
            });
    
            client.connect((err, db) => {
                if (err) throw err;
                var dbo = db.db("course-plan");
                var myobj = { name: "Pre-Requirements", data: prereqs };
                dbo.collection("prereqs").insertOne(myobj, (err, res) => {
                    if (err) throw err;
                    console.log("1 document inserted");
                    return db.close();
                });
            });
        })
    })
}