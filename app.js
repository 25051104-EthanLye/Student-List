const express = require('express'); 
const mysql = require('mysql2'); 
const multer = require('multer');
const app = express(); 

// Configure Multer for image storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/images'); // Ensure this folder exists in your project
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

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
// enable static files 
app.use(express.static('public')); 
// enable form processing
app.use(express.urlencoded({ extended: true})); 

// Define routes 
app.get('/', (req, res) => { 
    connection.query('SELECT * FROM student', (error, results) => { 
      if (error) throw error; 
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
  res.render('addStudent');
});

// Added: upload.single('image') middleware for file processing
app.post('/addstudent', upload.single('image'), (req, res) => {
  const { studentName, dob, contact } = req.body; 
  const image = req.file ? req.file.filename : null; // Get filename from Multer
  const sql = 'INSERT INTO student (studentName, dob, contactNumber, image) VALUES (?, ?, ?, ?)';

  connection.query(sql, [studentName, dob, contact, image], (error, results) => {
    if (error) {
      console.error('Database insert error:', error.message);
      return res.send('Error adding student');
    }
    res.redirect('/');
  });
});

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
      res.render('updateStudent', { student: results[0] });
    } else {
      res.send('Student not found');
    }
  });
});

// Added: upload.single('image') middleware for update
app.post('/updateStudent/:studentId', upload.single('image'), (req, res) => {
  const studentId = req.params.studentId;
  const { studentName, dob, contactNumber } = req.body; 
  // If a new image is uploaded, use it; otherwise, keep the old one (logic would typically require fetching current DB record first)
  const image = req.file ? req.file.filename : req.body.existingImage; 

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