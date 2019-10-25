# Course Plan Requirements API
API Document for Course Plan 📝


### Request
`/api/1.0/requirements`

Provided the following optional arguments

Argument | Type | Description
-------------- | ------- | -------------
`college` | `string`  | Abbreviated name of the college(s)
`major` | `string`  | Subject name of the major(s)
`minor` | `string`  | Subject name of the minor(s)

*Multiple arguments can be provided for the request to requirements across multiple colleges/majors/minors

### Example
`/api/1.0/requirements?college=EN`

```
[{
    status: "success",
    message: "requirements data retrieved",
    data: [
            {
            type: "university",
            value: "UNI",
            name: "University Requirements",
            requirements: [
                {
                    name: "Academic Credits",
                    search: "all-eligible",
                    reqs: [],
                    minCreds: 120,
                    maxCreds: 120,
                    applies: "all"
                },
                {
                    name: "Cornell Credits",
                    search: "all-eligible",
                    reqs: [],
                    minCreds: 60,
                    maxCreds: 120,
                    applies: "transfers"
                },
                {
                    name: "Physical Education",
                    search: "subject",
                    reqs: ["PE", "PE"],
                    minCreds: 2,
                    maxCreds: 2,
                    applies: "all"
                },
                {
                    name: "Swimming Test",
                    search: "selfcheck",
                    reqs: [],
                    minCreds: 0,
                    maxCreds: 0,
                    applies: "all"
                }
            ]
        },
        {
        type: "college",
        value: "EN",
        name: "Engineering Requirements",
        requirements: [
            {
                name: "Mathematics",
                multiplePaths: false,
                search: "course",
                reqs: ["MATH 1910", "MATH 1920", ["MATH 2930", "MATH 2940"]],
                minCreds: 14,
                maxCreds: 16,
                uniqueCourses: 0,
                majorDep: true
            },
            {
                name: "Physics",
                multiplePaths: false,
                search: "course",
                reqs: ["PHYS 1112", "PHYS 2213"],
                minCreds: 8,
                maxCreds: 12,
                uniqueCourses: 0,
                majorDep: true
            },
            {
                name: "Chemistry",
                multiplePaths: false,
                search: "course",
                reqs: ["CHEM 2090"],
                minCreds: 4,
                naxCreds: 8,
                uniqueCourses: 0,
                majorDep: true
            },
            {
                name: "Freshman Writing Seminars",
                multiplePaths: false,
                search: "title",
                reqs: ["FWS:"],
                minCreds: 6,
                maxCreds: 12,
                uniqueCourses: 0,
                majorDep: false
            },
            {
                name: "Computing",
                multiplePaths: false,
                search: "course",
                reqs: [["CS 1110", "CS 1112", "CS 1114", "CS 1115"]],
                minCreds: 4,
                maxCreds: 4,
                uniqueCourses: 0,
                majorDep: false
            },
            {
                name: "Introducation to Engineering",
                multiplePaths: false,
                search: "subject",
                reqs: ["ENGRI"],
                minCreds: 4,
                maxCreds: 4,
                uniqueCourses: 0,
                majorDep: false
            },
            {
                name: "Engineering Distribution",
                multiplePaths: false,
                search: "subject",
                reqs: ["ENGRD"],
                minCreds: 6,
                maxCreds: 8,
                uniqueCourses: 0,
                majorDep: false
            },
            {
                name: "Liberal Studies Distribution",
                multiplePaths: false,
                search: "dist",
                reqs: [["CA", "HA", "LA/LAD", "KCM", "SBA", "FL", "CE"],
                ["CA", "HA", "LA/LAD", "KCM", "SBA", "FL", "CE"],
                ["CA", "HA", "LA/LAD", "KCM", "SBA", "FL", "CE"],
                ["CA", "HA", "LA/LAD", "KCM", "SBA", "FL", "CE"],
                ["CA", "HA", "LA/LAD", "KCM", "SBA", "FL", "CE"],
                ["CA", "HA", "LA/LAD", "KCM", "SBA", "FL", "CE"]],
                minCreds: 18,
                maxCreds: 120,
                uniqueCourses: 3,
                majorDep: false
            },
            {
                name: "Advisor-Approved Electives",
                multiplePaths: false,
                search: "selfcheck",
                reqs: [],
                minCreds: 6,
                maxCreds: 6,
                uniqueCourses: 0,
                majorDep: false
            },
            {
                name: "Technical Communication",
                multiplePaths: false,
                search: "selfcheck",
                reqs: [],
                minCreds: 3,
                maxCreds: 4,
                uniqueCourses: 0,
                majorDep: false
            }
        ]
    }]
}]
```

### Result
Attribute | Type | Description
------------ | ------- | -------------
status | `string` | Status of the request ("success" or "error")
message | `string` | Message to describe the request result
data | `object` | Returned data of user requirements


### General
Attribute | Type | Description
------------ | ------- | -------------
type | `string` | Category of data ("university", "college", "major", "minor")
value | `string` | Search identificiation ("UNI", "EN", "CS")
name | `string` | Description of requirement
multiplePaths | `bool` | Whether a requirement can be satisfied in multiple ways
search | `string` | Search command for courses
req | `array` | Search parameters for courses
minCreds | `int` | Minimum number of credits to satisfy requirement (0 if credits are not used to track progress)
maxCreds | `int` | Recommended maximum number of credits (0 if credits are not used to track progress)
uniqueCourses | `int` | Number of unique req search parameters (0 if irrelevant)
majorDep | `bool` | Whether specific majors determine requirement

### Rules for req (search parameters)
- The number of elements in req is used to determine the number of courses required to satisfy the requirement (especially when minCreds is 0 meaning that credits are not used to track requirement progress)
- Another array in an element is used to represent options. For example `[["CS 1110", "CS 1112"], "CS 2110"]` means that (either CS 1110 or CS 1112) and CS 2110 is required.

### Search Commands
Search commands are used to find courses that satisfy the req attribute

Command | Description (reqs)
------------ | -------------
all-eligible | All courses that are not PE nor "10XX" levels
course | Full course name (CS 1110)
subject | Course subject (AEM)
level | Course and level (CHIN 2XXX)
acadGroup | Academic group (AS)
dist | Distribution requirement (PBS-AS)
breadth | Breadth requirement (GB)
title | Title of the course includes (FWS:)
selfCheck | User checks off the requirement