const fs = require('fs');
class Data {
  constructor(students, courses) {
    this.students = students;
    this.courses = courses;
  }
}
let dataCollection = null;
function initialize() {
  return new Promise((resolve, reject) => {
    fs.readFile('./data/students.json', 'utf8', (err, studentDataFromFile) => {
      if (err) {
        reject('Unable to read students.json');
        return;
      }
      fs.readFile('./data/courses.json', 'utf8', (err, courseDataFromFile) => {
        if (err) {
          reject('Unable to read courses.json');
          return;
        }
        const studentData = JSON.parse(studentDataFromFile);
        const courseData = JSON.parse(courseDataFromFile);
        dataCollection = new Data(studentData, courseData);
        resolve();
      });
    });
  });
}
function getAllStudents() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.students && dataCollection.students.length > 0) {
      resolve(dataCollection.students);
    } else {
      reject('No results returned');
    }
  });
}
function getTAs() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.students && dataCollection.students.length > 0) {
      const tas = dataCollection.students.filter(student => student.TA);
      resolve(tas);
    } else {
      reject('No results returned');
    }
  });
}
function getCourses() {
  return new Promise((resolve, reject) => {
    if (dataCollection && dataCollection.courses && dataCollection.courses.length > 0) {
      resolve(dataCollection.courses);
    } else {
      reject('No results returned');
    }
  });
}
function getCourseById(id) {
  return new Promise((resolve, reject) => {
      const course = dataCollection.courses.find((course) => course.courseId === id);
      if (course) {
          resolve(course);
      } else {
          reject(new Error("query returned 0 results"));
      }
  });
}

function getStudentsByCourse(course) {
    return new Promise(async(resolve, reject) => {
      const students = await this.getAllStudents();
      const filteredStudents = students.filter(student => student.course == course);
      console.log(filteredStudents)
      if (filteredStudents.length > 0) {
        resolve(filteredStudents);
      } else {
        reject("No results returned");
      }
    });
}

function getStudentByNum(num) {
    return new Promise(async(resolve, reject) => {
      const students = await this.getAllStudents();
      const student = students.find(student => student.studentNum == num);

      if (student) {
        resolve(student);
      } else {
        reject("No results returned");
      }
    });
}
function addStudent(studentData) {
  return new Promise((resolve, reject) => {
    var studentsDataFromFile = dataCollection.students;
    let newStudent;
    if (studentData.TA) {
      newStudent = {
        ...studentData,
        TA: true,
        studentNum: studentsDataFromFile.length + 1,
      };
    } else {
      newStudent = {
        ...studentData,
        TA: false,
        studentNum: studentsDataFromFile.length + 1,
      };
    }
    dataCollection.students.push(newStudent);

    if (studentsDataFromFile.length != 0) {
      resolve(newStudent);
    } else {
      reject("no results returned");
    }
  });
}
function updateStudent(studentData) {
  return new Promise((resolve, reject) => {
      const index = dataCollection.students.findIndex((student) => student.studentNum === studentData.studentNum);
      if (index !== -1) {
          // Update the student with the new data
          dataCollection.students[index] = {
              ...studentData,
              TA: studentData.TA === "on", // Convert checkbox value to boolean
          };
          resolve();
      } else {
          reject(new Error("Student not found"));
      }
  });
}


module.exports = {
  initialize,
  getAllStudents,
  getTAs,
  getCourses,
  getStudentsByCourse,
  getStudentByNum,
  addStudent,
  getCourseById,
  updateStudent
  
};
