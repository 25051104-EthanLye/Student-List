const express = require('express'); 
const mysql = require('mysql2'); 
const app = express(); 
 
// Create MySQL connection 
const connection = mysql.createConnection({ 
    host: 'localhost', 
    user: 'root', 
    password: 'root',
    database: 'c237_studentlistapp' 
}); 
 
connection.connect((err) => { 
    if (err) { 
        console.error('Error connecting to MySQL:', err); 
        return; 
    } 
    console.log('Connected to MySQL database'); 
}); 
 
// Set up view engine 
app.set('view engine', 'ejs'); 
//  enable static files 
app.use(express.static('public')); 
//enable form processing
app.use(express.urlencoded({ extended: true})); 

// Define routes 
app.get('/', (req, res) => { 
    connection.query('SELECT * FROM student', (error, results) => { 
      if (error) throw error; 
      // Fixed: Variable key named 'students' to match index.ejs template
      res.render('index', { students: results }); 
    }); 
}); 

app.get('/student/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  const sql = 'SELECT * FROM student WHERE studentId = ?';

  connection.query(sql, [studentId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message); 
      return res.send('Error Retrieving student by ID'); 
    }
    if (results.length > 0) {
      res.render('student', { student: results[0] });
    } else {
      res.send('Student not found');
    }
  });
});

app.get('/addstudent', (req, res) => {
  res.render('addStudent'); // Explicitly matches addStudent.ejs
});

app.post('/addstudent', (req, res) => {
  // Fixed: Map parameter names to match input 'name' attributes from addStudent.ejs
  const { studentName, dob, contact, image } = req.body; 
  const sql = 'INSERT INTO student (studentName, dob, contactNumber, image) VALUES (?, ?, ?, ?)';

  connection.query(sql, [studentName, dob, contact, image], (error, results) => {
    if (error) {
      console.error('Database insert error:', error.message);
      return res.send('Error adding student');
    }
    res.redirect('/');
  });
});

// Fixed: Aligned endpoint naming from /delete-student to match index.ejs link format (/deleteStudent/:id)
app.get('/deleteStudent/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  const sql = 'DELETE FROM student WHERE studentId = ?';

  connection.query(sql, [studentId], (error, results) => {
    if (error) {
      console.error('Database delete error:', error.message);
      return res.send('Error deleting student');
    }
    res.redirect('/');
  });
});

app.get('/updateStudent/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  const sql = 'SELECT * FROM student WHERE studentId = ?';

  connection.query(sql, [studentId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message);
      return res.send('Error retrieving student for update');
    }
    if (results.length > 0) {
      res.render('updateStudent', { student: results[0] }); // Render explicit file updateStudent.ejs
    } else {
      res.send('Student not found');
    }
  });
});

app.post('/updateStudent/:studentId', (req, res) => {
  const studentId = req.params.studentId;
  const { studentName, dob, contactNumber, image } = req.body; 
  const sql = 'UPDATE student SET studentName = ?, dob = ?, contactNumber = ?, image = ? WHERE studentId = ?';

  connection.query(sql, [studentName, dob, contactNumber, image, studentId], (error, results) => {
    if (error) {
      console.error('Database update error:', error.message);
      return res.send('Error updating student');
    }
    res.redirect('/');
  });
});

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));