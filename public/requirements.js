// Check README.md file for information of Roster API
// Libraries used: jQuery, Bootstrap

// Get latest acadGroups from API
$.get("https://classes.cornell.edu/api/2.0/config/acadGroups.json", {roster: 'FA19'}, data => {
    const colleges = data.data.acadGroups;
    // Loop through all objects in colleges
    colleges.map(college => {
        $("#colleges").append(`<option value=${college.value}>${college.descr}</option>`);
    })
});

// Get latest subjects from API
$.get("https://classes.cornell.edu/api/2.0/config/subjects.json", {roster: 'FA19'}, data => {
    const subjects = data.data.subjects;
    // Loop through all objects in subjects
    subjects.map(subject => {
        $("#subjects").append(`<option value=${subject.value}>${subject.descr}</option>`);
    })
});

// Search latest roster for class
function search() {

    // Get text from search input
    const input = $("#search").val();

    // Split name into subject (sub) and number (num)
    const sub = input.split(" ")[0].toUpperCase();
    const num = input.split(" ")[1];

    $.get("https://classes.cornell.edu/api/2.0/search/classes.json", { roster: 'FA19', subject: sub, q: num }, data => {
        
        console.log(data);
        if (data.status === "success") {

            const course = data.data.classes[0];

            // Append dismissible alert with course info
            $("#courses").append(`<div class="alert alert-secondary alert-dismissible fade show" role="alert">
            ${course.subject} ${course.catalogNbr}: ${course.titleLong}
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            </div>`);
        }
    });
}

function requirements() {
    // Define requirement section
    const reqs = $("#reqs");

    // Clear all text inside element
    reqs.empty();
    // Add html to element
    reqs.append(`<p>Total Credits: 120<p>`);
}