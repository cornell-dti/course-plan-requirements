// Check README.md file for information of Roster API

// Get latest acadGroups from API (FA19)
$.get("https://classes.cornell.edu/api/2.0/config/acadGroups.json?roster=FA19", data => {
    const colleges = data.data.acadGroups;
    // Loop through all objects in colleges
    colleges.map(college => {
        $("#colleges").append(`<option value=${college.value}>${college.descr}</option>`)
    })
});

// Get latest subjects from API (FA19)
$.get("https://classes.cornell.edu/api/2.0/config/subjects.json?roster=FA19", data => {
    const subjects = data.data.subjects;
    // Loop through all objects in subjects
    subjects.map(subject => {
        $("#subjects").append(`<option value=${subject.value}>${subject.descr}</option>`)
    })
});

function requirements() {
    const reqs = $("#reqs");

    // Clear all text inside element
    reqs.empty();
    // Add html to element
    reqs.append(`<p>Total Credits: 120<p>`);
}