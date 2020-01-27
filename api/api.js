const fs = require('fs');
// import request package
const rp = require("request-promise");

getAllCoursesFromAllSemesters();

function getRosters() {
    // Description: return a list of rosters

    return new Promise((resolve, reject) => {
        rp('https://classes.cornell.edu/api/2.0/config/rosters.json').then(res => {
            const rosters = JSON.parse(res);
            const rostersArray = rosters.data.rosters.map(roster => roster.slug);
            
            resolve(rostersArray);
        })
    })
}

function getSubjects(roster) {
    // Description: return a list of all abbreviated subject values
    // @ros: roster used to retrieve subjects array

    return new Promise((resolve, reject) => {
        rp(`https://classes.cornell.edu/api/2.0/config/subjects.json?roster=${roster}`).then(res => {
            const subjects = JSON.parse(res);
            const subjectsArray = subjects.data.subjects.map(subject => subject.value);

            resolve(subjectsArray);
        })
    })
}

function getCoursesFromRosterAndSubject(roster, subject) {
    // Description: function to get all courses from specific roster
    // @ros: roster used to retrieve courses array
    return new Promise((resolve, reject) => {
        rp(`https://classes.cornell.edu/api/2.0/search/classes.json?roster=${roster}&subject=${subject}`).then(res => {
            const course = JSON.parse(res);
            resolve(course.data.classes);
        })
    })
}

/**
 * Scrapes through all courses data to update course.json
 */
function getAllCoursesFromAllSemesters() {

    getRosters().then(rostersArray => {
        rostersArray.forEach((roster, i) => {
            setTimeout(() => {
                
                // Function call
                getSubjects(roster).then(subjectsArray => {

                    try {
                        const requests = subjectsArray.map(subject => getCoursesFromRosterAndSubject(roster, subject));
                        Promise.all(requests).then(res => {
                            generateJSON(roster, res);
                            console.log(roster, "added");
                        })
                    }

                    catch(err) {
                        console.log("Error with adding");
                    }
                })
                // Allow delay to prevent overload
            }, i * 15 * 1000);
        });
    })
}

/**
 * Takes array of classes from API
 */
function generateJSON(roster, coursesBySubject) {

    // Get course object from courses.json JSON. Should contain lastScanned key
    let coursesObject = readJSON('courses.json');

    const today = new Date();
    coursesObject.lastScanned = today.toLocaleString();

    coursesBySubject.forEach(courses => {
        courses.forEach(course => {

        coursesObject[`${course.subject} ${course.catalogNbr}`] = {
            t: course.titleLong,
            r: roster
        }
        })
    })

    updateJSON('courses.json', coursesObject);
}

function readJSON(fileName) {
    let json = fs.readFileSync(fileName);
    return JSON.parse(json);
}

function updateJSON(fileName, obj) {
    let json = JSON.stringify(obj);
    fs.writeFileSync(fileName, json);
}