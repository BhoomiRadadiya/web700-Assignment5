/* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part 
* of this assignment has been copied manually or electronically from any other source 
* (including 3rd party web sites) or distributed to other students.
* 
* Name: Bhoomi Radadiya Student ID: 129796223 Date: 07/26/2023
*
* Online (Cyclic) Link: 
*
********************************************************************************/

var HTTP_PORT = process.env.PORT || 8080;
var express = require("express");
var bodyParser = require("body-parser");
const exphbs = require('express-handlebars');
var app = express();
var path = require("path");
const collegeData = require('./modules/collegeData'); 
const { log } = require("console");

app.use(bodyParser.urlencoded({ extended: true }));
app.use("/public", express.static(__dirname + '/public'));
app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));    
  next();
});
app.engine('hbs', exphbs.engine({ extname: '.hbs', defaultLayout: 'main', helpers: {
  navLink: function (url, options) {
      return (
          '<li' +
          ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
          '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>'
      );
  },
  // Handlebars helper for equality check
  equal: function (lvalue, rvalue, options) {
      if (arguments.length < 3)
          throw new Error("Handlebars Helper equal needs 2 parameters");
      if (lvalue != rvalue) {
          return options.inverse(this);
      } else {
          return options.fn(this);
      }
  }
}, }));
app.set('view engine', 'hbs');
// Configure express-handlebars


// GET /students
app.get('/students', (req, res) => {
  const { course } = req.query;
  if (course) {
    console.log(course)
    collegeData.getStudentsByCourse(course)
      .then(students => {
        if (students.length === 0) {
          res.render({ message: 'no results' });
        } else {
          res.json(students);
        }
      })
      .catch(error => {
        console.log(error)
        res.status(500).json({ message: 'Internal server error' });
      });
  } else {
    collegeData.getAllStudents()
      .then(students => {
        if (students.length === 0) {
          res.render({ message: 'no results' });
        } else {
          res.render("students", {students: students});
        }
      })
      .catch(() => {
        res.render("students", { message: 'no results' });
      });
  }
});

// GET /tas
app.get('/tas', (req, res) => {
  collegeData.getTAs()
    .then(tas => {
      if (tas.length === 0) {
        res.json({ message: 'no results' });
      } else {
        res.json(tas);
      }
    })
    .catch(error => {
      res.status(500).json({ message: 'Internal server error' });
    });
});

// GET /courses
app.get("/courses", function(req, res) {
  collegeData.getCourses()
    .then(function(data) {
      res.render("courses", { courses: data });
    })
    .catch(function(err) {
      res.render("courses", { message: "no results" });
    });
});

app.get("/course/:id", (req, res) => {
  const courseId = parseInt(req.params.id);
  collegeData
      .getCourseById(courseId)
      .then((data) => {
          res.render("course", { course: data });
      })
      .catch((err) => {
          res.render("course", { message: err.message });
      });
});

// GET /student/num
app.get('/student/:num', (req, res) => {
  const { num } = req.params;
  collegeData.getStudentByNum(num)
    .then((student) => {
      res.render("student", { student: student });
    })
    .catch(() => {
      res.render("student", { message: "Student not found" });
    });
});

// GET /
app.get('/', (req, res) => {
  res.render("home");
});

// GET /about
app.get('/about', (req, res) => {
  res.render("about")
});

// GET /htmlDemo
app.get('/htmlDemo', (req, res) => {
  res.render("htmlDemo")
});

app.get("/students/add", (req, res) => {
  res.render("addStudent")
});

app.post("/students/add", (req, res) => {
  collegeData.addStudent(req.body).then((value) => {
      console.log(value)
      res.json(value);
    }).catch((err) => {
      res.send({ message: "no results" });
    });
});
app.post("/student/update", (req, res) => {
  const updatedStudent = {
      studentNum: parseInt(req.body.studentNum),
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      addressStreet: req.body.addressStreet,
      addressCity: req.body.addressCity,
      addressProvince: req.body.addressProvince,
      TA: req.body.TA === "on", // Convert checkbox value to boolean
      status: req.body.status,
      course: req.body.course,
  };

  collegeData
      .updateStudent(updatedStudent)
      .then(() => {
          res.redirect("/students");
      })
      .catch((err) => {
          console.error("Error updating student:", err.message);
          res.redirect("/students");
      });
});

// setup http server to listen on HTTP_PORT
collegeData.initialize()
  .then(() => {
    // Start the server
    app.listen(8080, () => {
      console.log('Server is running on port 8080');
    });
  })
  .catch((err) => {
    console.error('Error initializing data:', err);
  });

app.use((req, res) => {
  res.sendFile(path.join(__dirname + "/views/error.html"));
});