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
// Example: 
app.get('/', (req, res) => { 
    connection.query('SELECT * FROM student', (error, results) => { 
      if (error) throw error; 
      res.render('index', { student: results }); // Render HTML page with data 
    }); 
}); 

app.get('/student/:studentId', (req, res) => {
  // Extract the student ID from the request parameters
  const studentId = req.params.studentId;
  const sql = 'SELECT * FROM student WHERE studentId = ?';
  // Fetch data from MySQL based on the student ID
  connection.query( sql , [studentId], (error, results) => {
    if (error) {
      console.error('Database query error:', error.message); 
      return res.send('Error Retrieving student by ID'); 
    }
    // Check if any student with the given ID was found
    if (results.length > 0) {
      // Render HTML page with the student data
      res.render('student', { student: results[0] });
    } else {
      // If no student with the given ID was found
      res.send('Student not found');
    }
  });
});

const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));