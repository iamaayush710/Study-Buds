const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const db = new sqlite3.Database(path.resolve(__dirname, 'studybuds.db'), (err) => {
    if (err) {
        console.error('Error connecting to the database', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// Users Table
db.run(`
    CREATE TABLE IF NOT EXISTS users (
        user_id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        profile_picture TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

// Courses Table
db.run(`
    CREATE TABLE IF NOT EXISTS courses (
        course_id INTEGER PRIMARY KEY AUTOINCREMENT,
        course_name TEXT NOT NULL,
        course_code TEXT NOT NULL,
        instructor_name TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`);

// Study Groups Table
db.run(`
    CREATE TABLE IF NOT EXISTS study_groups (
        study_group_id INTEGER PRIMARY KEY AUTOINCREMENT,
        group_name TEXT NOT NULL,
        course_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (course_id) REFERENCES courses (course_id)
    );
`);

// User-Course Table
db.run(`
    CREATE TABLE IF NOT EXISTS user_courses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        course_id INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (user_id),
        FOREIGN KEY (course_id) REFERENCES courses (course_id)
    );
`);

// Study Group Members Table
db.run(`
    CREATE TABLE IF NOT EXISTS study_group_members (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        study_group_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (study_group_id) REFERENCES study_groups (study_group_id),
        FOREIGN KEY (user_id) REFERENCES users (user_id)
    );
`);

module.exports = db;
