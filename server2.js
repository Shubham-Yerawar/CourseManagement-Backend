var express = require('express');
var cors = require('cors');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');

// GraphQL schema
var schema = buildSchema(`
    type Query {
        course(id: Int!): Course
        courses(topic: String): [Course]
    },
    type Mutation {
        updateCourseTopic(id: Int!, topic: String!): Course
        addCourse(newCourse: CourseToAdd!): Course
        deleteCourse(id:Int!): Course
    }
    input CourseToAdd {
        title: String
        author: String
        description: String
        topic: String
        url: String
    }
    type Course {
        id: Int
        title: String
        author: String
        description: String
        topic: String
        url: String
    }
`);

var coursesData = [
    {
        id: 1,
        title: 'The Complete Node.js Developer Course',
        author: 'Andrew Mead, Rob Percival',
        description: 'Learn Node.js by building real-world applications with Node, Express, MongoDB, Mocha, and more!',
        topic: 'Node.js',
        url: 'https://codingthesmartway.com/courses/nodejs/'
    },
    {
        id: 2,
        title: 'Node.js, Express & MongoDB Dev to Deployment',
        author: 'Brad Traversy',
        description: 'Learn by example building & deploying real-world Node.js applications from absolute scratch',
        topic: 'Node.js',
        url: 'https://codingthesmartway.com/courses/nodejs-express-mongodb/'
    },
    {
        id: 3,
        title: 'JavaScript: Understanding The Weird Parts',
        author: 'Anthony Alicea',
        description: 'An advanced JavaScript course for everyone! Scope, closures, prototypes, this, build your own framework, and more.',
        topic: 'JavaScript',
        url: 'https://codingthesmartway.com/courses/understand-javascript/'
    }
];


// resolver functions

var getCourse = function (args) {
    var id = args.id;
    return coursesData.filter(course => {
        return course.id == id;
    })[0];
}

var getCourses = function (args) {
    if (args.topic) {
        var topic = args.topic;
        return coursesData.filter(course => course.topic === topic);
    } else {
        // console.log("all courses ");
        return coursesData;
    }
}

//mututations
var updateCourseTopic = function ({ id, topic }) {
    // console.log("upadte called in server");
    coursesData.map(course => {
        if (course.id === id) {
            course.topic = topic;
            return course;
        }
    });
    return coursesData.filter(course => course.id === id)[0];
}


//helper function to get the latest id
function getId() {
    let length = coursesData.length;
    return (coursesData[length - 1].id) + 1;
}

// write a fn to add new course
var addCourse = function (CourseToAdd) {
    let id = getId();
    // console.log("inside addcourse :",CourseToAdd.newCourse);
    let newCourse = Object.assign({ id }, CourseToAdd.newCourse);
    // console.log("new curse : ", newCourse);
    coursesData.push(newCourse);
    return newCourse;
}

var deleteCourse = function ({ id }) {
    // console.log("id: ", id);
    let index = -1;
    for (let i = 0; i < coursesData.length; i++) {
        if (coursesData[i].id === id) {
            index = i;
            break;
        }
    }
    // console.log("index:", index);
    let deleted = coursesData.splice(index, 1);
    // console.log("deleted : ", deleted);
    return deleted[0];
}


var root = {
    course: getCourse,
    courses: getCourses,
    updateCourseTopic: updateCourseTopic,
    addCourse: addCourse,
    deleteCourse: deleteCourse
};

// Create an express server and a GraphQL endpoint
var app = express();

app.use(cors());

app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true
}));
app.listen(4100, () => console.log('Express GraphQL Server Now Running On localhost:4100/graphql'));
