const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const db = require('./database'); 
const jwt = require('jsonwebtoken');
const bcrypt= require('bcrypt');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({ origin: 'http://localhost:5173' }));
// Middleware
app.use(bodyParser.json());


//Function to generate random color
const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++){
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

// Test Route
app.get('/', (req, res) => {
    res.send('Study Buds Backend Running!');
});

//verify token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('JWT Verification Error:', err);
            return res.status(403).json({ error: 'Invalid token.' });
        }
        req.user = user; 
        next();
    });
};

// Protected route 
app.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected resource.', user: req.user });
});

// USERS CRUD
// Create User
app.post('/users', [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long.'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    const profile_picture = generateRandomColor(); //automatically assign random color

    db.run(`
        INSERT INTO users (name, email, password, profile_picture) 
        VALUES (?, ?, ?, ?)`, 
        [name, email, password, profile_picture],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
            } else {
                res.status(201).json({ user_id: this.lastID, name, email, profile_picture });
            }
        }
    );
});

//Register a new user
app.post('/auth/register', [
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }

    const {name, email, password} = req.body;
    const profile_picture = generateRandomColor();

    try {
        //check if email is already registered
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('Database Error', err);
            return res.status(500).json({error: 'Database error.'});
        }
            if (user) {
            return res.status(400).json({error: 'Email already in use.'});
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            db.run(`
                INSERT INTO users (name, email, password,profile_picture)
                VALUES (?,?,?,?)`,
                [name, email, hashedPassword, profile_picture],
                function(err) {
                    if(err){
                        console.error('Database Insertion Error:', err); 
                        res.status(500).json({error: err.message});
                    } else {
                        res.status(201).json({message: 'User registered successfully!',user_id: this.lastID, profile_picture});
                    }
                }
            );
        });
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({error: 'Internal server error.'});
    }
});

// Get All Users
app.get('/users', (req, res) => {
    db.all(`SELECT user_id, name, email, profile_picture FROM users`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Update User
app.put('/users/:id', [
    authenticateToken,
    body('name').optional().notEmpty().withMessage('Name cannot be empty.'),
    body('email').optional().isEmail().withMessage('Valid email is required.'),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { id } = req.params;
    const { name, email, profile_picture } = req.body;

    // Check user is updating their own profile
    if (parseInt(id, 10) !== req.user.user_id) {
        return res.status(403).json({ error: 'You can only update your own profile.' });
    }

    // Check email is not in use
    if (email) {
        db.get(`SELECT * FROM users WHERE email = ? AND user_id != ?`, [email, id], (err, row) => {
            if (err) {
                console.error('Database Query Error:', err);
                return res.status(500).json({ error: 'Database error occurred.' });
            }

            if (row) {
                return res.status(400).json({ error: 'Email is already in use by another account.' });
            }
            proceedToUpdate();
        });
    } else {
        proceedToUpdate();
    }

    function proceedToUpdate() {
        db.run(`
            UPDATE users SET 
                name = COALESCE(?, name), 
                email = COALESCE(?, email), 
                profile_picture = COALESCE(?, profile_picture),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?`,
            [name, email, profile_picture, id],
            function(err) {
                if (err) {
                    console.error('Database Update Error:', err);
                    res.status(500).json({ error: 'Failed to update profile.' });
                } else if (this.changes === 0) {
                    res.status(404).json({ error: 'User not found.' });
                } else {
                    // get the updated profile to return
                    db.get(`SELECT user_id, name, email, profile_picture FROM users WHERE user_id = ?`, [id], (err, updatedUser) => {
                        if (err) {
                            console.error('Database Fetch Error:', err);
                            return res.status(500).json({ error: 'Database error occurred.' });
                        }

                        res.json({
                            message: 'Profile updated successfully.',
                            user: updatedUser,
                        });
                    });
                }
            }
        );
    }
});

// Delete User
app.delete('/users/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    // Check user is deleting their own profile
    if (parseInt(id, 10) !== req.user.user_id) {
        return res.status(403).json({ error: 'You can only delete your own profile.' });
    }

    db.run(`DELETE FROM users WHERE user_id = ?`, id, function(err) {
        if (err) {
            console.error('Database Delete Error:', err);
            res.status(500).json({ error: 'Failed to delete user.' });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'User not found.' });
        } else {
            res.json({ message: 'User deleted successfully.' });
        }
    });
});

// User Login
app.post('/auth/login', [
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
        db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).json({ error: 'Database error occurred.' });
            }
            if (!user) {
                return res.status(400).json({ error: 'Invalid email or password.' });
            }

            const isSame = await bcrypt.compare(password, user.password);
            if (!isSame) {
                return res.status(400).json({ error: 'Invalid email or password.' });
            }

            //generate token
            const token = jwt.sign(
                { user_id: user.user_id }, 
                process.env.JWT_SECRET, 
                { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
            );

            res.status(200).json({ message: 'Login successful!', token });
        });
    } catch (err) {
        console.error('Server Error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});


// COURSES CRUD
// Create Course
app.post('/courses', [
    body('course_name').notEmpty().withMessage('Course name is required.'),
    body('course_code').notEmpty().withMessage('Course code is required.')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { course_name, course_code, instructor_name } = req.body;
    db.run(`
        INSERT INTO courses (course_name, course_code, instructor_name) 
        VALUES (?, ?, ?)`,
        [course_name, course_code, instructor_name || null],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
            } else {
                res.status(201).json({ course_id: this.lastID, course_name, course_code });
            }
        }
    );
});

// Get All Courses
app.get('/courses', (req, res) => {
    db.all(`SELECT course_id, course_name, course_code, instructor_name FROM courses`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Update Course
app.put('/courses/:id', [
    body('course_name').optional().notEmpty().withMessage('Course name cannot be empty.'),
    body('course_code').optional().notEmpty().withMessage('Course code cannot be empty.')
], (req, res) => {
    const { id } = req.params;
    const { course_name, course_code, instructor_name } = req.body;
    db.run(`
        UPDATE courses SET 
            course_name = COALESCE(?, course_name), 
            course_code = COALESCE(?, course_code), 
            instructor_name = COALESCE(?, instructor_name), 
            updated_at = CURRENT_TIMESTAMP
        WHERE course_id = ?`,
        [course_name, course_code, instructor_name, id],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Course not found.' });
            } else {
                res.json({ message: 'Course updated successfully.' });
            }
        }
    );
});

// Delete Course
app.delete('/courses/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM courses WHERE course_id = ?`, id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Course not found.' });
        } else {
            res.json({ message: 'Course deleted successfully.' });
        }
    });
});

// STUDY GROUPS CRUD
// Create Study Group
app.post('/study-groups', [
    body('group_name').notEmpty().withMessage('Group name is required.'),
    body('course_id').isInt().withMessage('Course ID must be an integer.')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { group_name, course_id } = req.body;
    db.run(`
        INSERT INTO study_groups (group_name, course_id) 
        VALUES (?, ?)`,
        [group_name, course_id],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
            } else {
                res.status(201).json({ study_group_id: this.lastID, group_name, course_id });
            }
        }
    );
});

// Get All Study Groups
app.get('/study-groups', (req, res) => {
    db.all(`
        SELECT sg.study_group_id, sg.group_name, c.course_name 
        FROM study_groups sg 
        JOIN courses c ON sg.course_id = c.course_id`,
        [],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        }
    );
});

// Update Study Group
app.put('/study-groups/:id', [
    body('group_name').optional().notEmpty().withMessage('Group name cannot be empty.')
], (req, res) => {
    const { id } = req.params;
    const { group_name } = req.body;
    db.run(`
        UPDATE study_groups SET 
            group_name = COALESCE(?, group_name), 
            updated_at = CURRENT_TIMESTAMP
        WHERE study_group_id = ?`,
        [group_name, id],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Study group not found.' });
            } else {
                res.json({ message: 'Study group updated successfully.' });
            }
        }
    );
});

// Delete Study Group
app.delete('/study-groups/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM study_groups WHERE study_group_id = ?`, id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else if (this.changes === 0) {
            res.status(404).json({ error: 'Study group not found.' });
        } else {
            res.json({ message: 'Study group deleted successfully.' });
        }
    });
});

// USER-COURSES CRUD
// Add a user to a course
app.post('/user-courses', [
    body('user_id').isInt().withMessage('User ID must be an integer.'),
    body('course_id').isInt().withMessage('Course ID must be an integer.')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { user_id, course_id } = req.body;
    db.run(`
        INSERT INTO user_courses (user_id, course_id) 
        VALUES (?, ?)`,
        [user_id, course_id],
        function (err) {
            if (err) {
                res.status(400).json({ error: err.message });
            } else {
                res.status(201).json({ id: this.lastID, user_id, course_id });
            }
        }
    );
});

// Get all courses a user is enrolled in
app.get('/user-courses/:user_id', (req, res) => {
    const { user_id } = req.params;
    db.all(`
        SELECT c.course_id, c.course_name, c.course_code 
        FROM user_courses uc 
        JOIN courses c ON uc.course_id = c.course_id 
        WHERE uc.user_id = ?`,
        [user_id],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        }
    );
});

// Remove a user from a course
app.delete('/user-courses/:user_id/:course_id', (req, res) => {
    const { user_id, course_id } = req.params;
    db.run(`
        DELETE FROM user_courses 
        WHERE user_id = ? AND course_id = ?`,
        [user_id, course_id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Enrollment not found.' });
            } else {
                res.json({ message: 'User removed from course successfully.' });
            }
        }
    );
});

// STUDY GROUP MEMBERS CRUD
// Add a user to a study group
app.post('/study-group-members', [
    body('study_group_id').isInt().withMessage('Study Group ID must be an integer.'),
    body('user_id').isInt().withMessage('User ID must be an integer.')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { study_group_id, user_id } = req.body;
    db.run(`
        INSERT INTO study_group_members (study_group_id, user_id) 
        VALUES (?, ?)`,
        [study_group_id, user_id],
        function (err) {
            if (err) {
                res.status(400).json({ error: err.message });
            } else {
                res.status(201).json({ id: this.lastID, study_group_id, user_id });
            }
        }
    );
});

// Get all users in a study group
app.get('/study-group-members/:study_group_id', (req, res) => {
    const { study_group_id } = req.params;
    db.all(`
        SELECT u.user_id, u.name, u.email 
        FROM study_group_members sgm 
        JOIN users u ON sgm.user_id = u.user_id 
        WHERE sgm.study_group_id = ?`,
        [study_group_id],
        (err, rows) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json(rows);
            }
        }
    );
});

// Remove a user from a study group
app.delete('/study-group-members/:study_group_id/:user_id', (req, res) => {
    const { study_group_id, user_id } = req.params;
    db.run(`
        DELETE FROM study_group_members 
        WHERE study_group_id = ? AND user_id = ?`,
        [study_group_id, user_id],
        function (err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'Membership not found.' });
            } else {
                res.json({ message: 'User removed from study group successfully.' });
            }
        }
    );
});

// SESSIONS CRUD
// Create a session
app.post('/sessions', authenticateToken, [
    body('title').notEmpty().withMessage('Title is required.'),
    body('type').isIn(['study', 'exam', 'class']).withMessage('Type must be study, exam, or class.'),
    body('date').isISO8601().withMessage('Valid date is required.'),
    body('venue').notEmpty().withMessage('Venue is required.'),
    body('description').optional().isString().withMessage('Description must be a string.')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.user_id;
    const { title, type, date, venue, description } = req.body;
    db.run(
        `INSERT INTO sessions (user_id, title, type, date, venue, description)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, title, type, date, venue, description || null],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ session_id: this.lastID, message: 'Session created.' });
        }
    );
});

// GET ALL SESSIONS WITH INTEREST STATUS
app.get('/sessions/all', authenticateToken, (req, res) => {
    const userId = req.user.user_id;

    db.all(
        `SELECT s.*, 
                COALESCE(us.is_interested, 0) AS is_interested 
         FROM sessions s
         LEFT JOIN user_sessions us ON s.session_id = us.session_id AND us.user_id = ?
         WHERE s.completed = 0
         ORDER BY s.date ASC`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error('Database Query Error:', err);
                return res.status(500).json({ error: 'Database error occurred.' });
            }
            res.json(rows);
        }
    );
});

// Get all sessions a user is "interested" in 
app.get('/sessions/interested', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    const today = new Date().toISOString().split('T')[0];

    db.all(
        `SELECT s.*, us.is_interested
         FROM sessions s
         JOIN user_sessions us ON s.session_id = us.session_id
         WHERE us.user_id = ? AND us.is_interested = 1
         ORDER BY s.date ASC`,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Mark "Interested" Sessions
app.post('/sessions/:session_id/interested', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    const { session_id } = req.params;

    console.log(`User ID: ${userId} is toggling interest for Session ID: ${session_id}`);

    // Check if the session exists and is active
    db.get(
        `SELECT * FROM sessions WHERE session_id = ? AND completed = 0`,
        [session_id],
        (err, session) => {
            if (err) {
                console.error('Database Query Error:', err);
                return res.status(500).json({ error: 'Database error occurred.' });
            }

            if (!session) {
                console.warn(`Session ID: ${session_id} not found or already completed.`);
                return res.status(404).json({ error: 'Session not found or already completed.' });
            }

            // Check if the user is already marked as interested
            db.get(
                `SELECT * FROM user_sessions WHERE user_id = ? AND session_id = ?`,
                [userId, session_id],
                (err, record) => {
                    if (err) {
                        console.error('Database Query Error:', err);
                        return res.status(500).json({ error: 'Database error occurred.' });
                    }

                    if (record) {
                        // Toggle the "is_interested" flag
                        const currentStatus = Number(record.is_interested) || 0; 
                        const newInterestStatus = currentStatus === 1 ? 0 : 1;
                        const message = newInterestStatus ? 'Marked as interested!' : 'Interest removed!';
                        console.log(`Updating is_interested to ${newInterestStatus} for Record ID: ${record.id}`);

                        db.run(
                            `UPDATE user_sessions SET is_interested = ? WHERE id = ?`,
                            [newInterestStatus, record.id],
                            function (updateErr) {
                                if (updateErr) {
                                    console.error('Database Update Error:', updateErr);
                                    return res.status(500).json({ error: 'Failed to update interest status.' });
                                }
                                console.log('Interest status updated successfully.');
                                res.json({ message, is_interested: newInterestStatus });
                            }
                        );
                    } else {
                        // Insert a new "interested" record
                        db.run(
                            `INSERT INTO user_sessions (user_id, session_id, is_interested)
                             VALUES (?, ?, 1)`,
                            [userId, session_id],
                            function (insertErr) {
                                if (insertErr) {
                                    console.error('Database Insert Error:', insertErr);
                                    return res.status(500).json({ error: 'Failed to mark interest.' });
                                }
                                console.log('New interest record created successfully.');
                                res.json({ message: 'Marked as interested!', is_interested: 1 });
                            }
                        );
                    }
                }
            );
        }
    );
});


// Complete a session (mark as done, store duration, log activity)
app.put('/sessions/:session_id/complete', authenticateToken, [
    body('duration').isInt({ gt: 0 }).withMessage('Duration must be a positive integer.')
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const userId = req.user.user_id;
    const { session_id } = req.params;
    const { duration } = req.body; 
    
    // Verify the session belongs to the user
    db.get('SELECT * FROM sessions WHERE session_id = ? AND user_id = ?', [session_id, userId], (err, session) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!session) {
            return res.status(404).json({ error: 'Session not found or not yours.' });
        }

        // mark session completed and store the duration
        db.run(
            `UPDATE sessions 
             SET completed = 1, duration = ?, updated_at = CURRENT_TIMESTAMP 
             WHERE session_id = ? AND user_id = ?`,
            [duration, session_id, userId],
            function (err2) {
                if (err2) return res.status(500).json({ error: err2.message });
                if (this.changes === 0) return res.status(404).json({ error: 'Session not found or not yours.' });

                const activityDesc = `Completed a ${duration}-minute ${session.type} session: "${session.title}"`;
                db.run(
                    `INSERT INTO activities (user_id, description, subject)
                     VALUES (?, ?, ?)`,
                    [userId, activityDesc, session.subject || null],
                    (err3) => {
                        if (err3) console.error('Activity log error:', err3);
                        res.json({ message: 'Session completed and activity logged.' });
                    }
                );
            }
        );
    });
});

// Delete a session  
app.delete('/sessions/:session_id', authenticateToken, (req, res) => {
    const userId = req.user.user_id; 
    const { session_id } = req.params;

    // Verify the session belongs to the user
    db.get(
        `SELECT * FROM sessions WHERE session_id = ? AND user_id = ?`,
        [session_id, userId],
        (err, session) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!session) {
                return res.status(404).json({ error: 'Session not found or not yours.' });
            }

            db.run(
                `DELETE FROM sessions WHERE session_id = ?`,
                [session_id],
                function (err2) {
                    if (err2) {
                        return res.status(500).json({ error: err2.message });
                    }
                    if (this.changes === 0) {
                        return res.status(404).json({ error: 'Session not found.' });
                    }
                    res.json({ message: 'Session deleted successfully.' });
                }
            );
        }
    );
});

//ACTIVITIES CRUD
// Create an activity
app.post('/activities', authenticateToken, [
    body('description').notEmpty().withMessage('Description is required.'),
    body('subject').optional().isString().withMessage('Subject must be a string.')
], (req,res)=>{
    const errors=validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
  
    const userId=req.user.user_id;
    const {description, subject}=req.body;
    db.run(
        `INSERT INTO activities (user_id, description, subject)
        VALUES (?, ?, ?)`,
        [userId, description, subject || null],
        function(err){
            if(err)return res.status(500).json({error:err.message});
            res.status(201).json({message:'Activity logged!', activity_id:this.lastID});
        }
    );
});

// Get recent activities
app.get('/activities', authenticateToken, (req,res)=>{
    const userId=req.user.user_id;
    db.all(
        `SELECT * FROM activities 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 10`,
        [userId],
        (err,rows)=>{
            if(err)return res.status(500).json({error:err.message});
            res.json(rows);
        }
    );
});

// Get study time for the last 7 days
app.get('/user/study-time', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    db.all(
        `SELECT date(date) AS day, SUM(duration) AS total_minutes
        FROM sessions
        WHERE user_id = ? 
            AND completed = 1 
            AND date > DATETIME('now','-7 days')
        GROUP BY date(date)
        ORDER BY date(date) ASC`,
        [userId],
        (err, rows) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json(rows);
        }
    );
});

// Get User Statistics 
app.get('/user/stats', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    const statsQuery = 
        `SELECT 
            (SELECT COUNT(*) FROM study_groups sg
                JOIN study_group_members sgm ON sg.study_group_id = sgm.study_group_id
                WHERE sgm.user_id = ?) AS activeGroups,
            (SELECT COUNT(*) FROM sessions WHERE user_id = ? AND date > CURRENT_TIMESTAMP AND completed = 0) AS scheduledSessions,
            (SELECT AVG(total_minutes) FROM (
                SELECT SUM(duration) AS total_minutes
                FROM sessions
                WHERE user_id = ? AND completed = 1
                GROUP BY date(date)
            )) AS averageStudyTime
        ;`;
    db.get(statsQuery, [userId, userId, userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

// Announcements endpoint
app.get('/announcements', authenticateToken, (req, res) => {
    db.all('SELECT * FROM announcements ORDER BY created_at DESC', [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Get User Profile
app.get('/user/profile', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    db.get('SELECT user_id, name, email, profile_picture, created_at, updated_at FROM users WHERE user_id = ?',
        [userId], (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            if (!row) {
                return res.status(404).json({error: 'User not found.'});
            }
            res.json(row);
        }
    );
});

//TASKS CRUD
// Create a task
app.post('/tasks', authenticateToken, [
    body('title').notEmpty().withMessage('Task title is required.'),
    body('due_date').optional().isISO8601().withMessage('Due date must be a valid date.')
], (req, res) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
  
    const userId = req.user.user_id;
    const { title, description, due_date, subject, priority } = req.body;
    db.run(
        `INSERT INTO tasks (user_id, title, description, due_date, subject, priority)
        VALUES (?,?,?,?,?,?)`,
        [userId, title, description || null, due_date || null, subject || null, priority || null],
        function(err){
            if(err) return res.status(500).json({error:err.message});
            db.get('SELECT * FROM tasks WHERE task_id = ?', [this.lastID], (err2, task) => {
                if(err2) return res.status(500).json({error: err2.message});
                res.status(201).json(task);
            });
        }
    );
});

// Get all tasks for user
app.get('/tasks', authenticateToken, (req,res)=>{
    const userId = req.user.user_id;
    db.all(`SELECT * FROM tasks WHERE user_id = ? ORDER BY due_date ASC`, [userId], (err,rows)=>{
        if(err) return res.status(500).json({error:err.message});
        res.json(rows);
    });
});

// Update task (mark complete or edit title/due_date/description)
app.put('/tasks/:task_id', authenticateToken, [
    body('title').optional().notEmpty().withMessage('Title cannot be empty.'),
    body('due_date').optional().isISO8601().withMessage('Due date must be a valid date.'),
    body('description').optional().isString().withMessage('Description must be a string.'),
    body('completed').optional().isInt({ min: 0, max: 1 }).withMessage('Completed must be 0 or 1.')
], (req, res)=>{
    const userId = req.user.user_id;
    const { task_id } = req.params;
    const { title, due_date, description, completed } = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors:errors.array()});
    }

    db.run(
        `UPDATE tasks SET
            title = COALESCE(?, title),
            due_date = COALESCE(?, due_date),
            description = COALESCE(?, description),
            completed = COALESCE(?, completed),
            updated_at = CURRENT_TIMESTAMP
        WHERE task_id = ? AND user_id = ?`,
        [title, due_date, description, completed, task_id, userId],
        function(err){
            if(err) return res.status(500).json({error:err.message});
            if(this.changes===0) return res.status(404).json({error:'Task not found or not yours.'});
            // get the updated task
            db.get('SELECT * FROM tasks WHERE task_id = ?', [task_id], (err2, task) => {
                if(err2) return res.status(500).json({error: err2.message});
                res.json(task);
            });
        }
    );
});

// Delete a task
app.delete('/tasks/:task_id', authenticateToken, (req,res)=>{
    const userId = req.user.user_id;
    const {task_id}=req.params;
    db.run(`DELETE FROM tasks WHERE task_id = ? AND user_id = ?`, [task_id, userId], function(err){
        if(err)return res.status(500).json({error:err.message});
        if(this.changes===0)return res.status(404).json({error:'Task not found or not yours.'});
        res.json({message:'Task deleted successfully.'});
    });
});

//ANNOUNCEMENTS CRUD
// Create Announcement (Admin Only - Implement admin role if needed)
app.post('/announcements', authenticateToken, [
    body('title').notEmpty().withMessage('Title is required.'),
    body('content').notEmpty().withMessage('Content is required.')
], (req, res) => {
    // Optionally, check if user is admin
    const { title, content } = req.body;
    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});
    
    db.run(
        `INSERT INTO announcements (title, content)
        VALUES (?, ?)`,
        [title, content],
        function(err){
            if(err)return res.status(500).json({error:err.message});
            res.status(201).json({id:this.lastID, title, content});
        }
    );
});

// Update Announcement (Admin Only - Implement admin role if needed)
app.put('/announcements/:id', authenticateToken, [
    body('title').optional().notEmpty().withMessage('Title cannot be empty.'),
    body('content').optional().notEmpty().withMessage('Content cannot be empty.')
], (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    const errors = validationResult(req);
    if(!errors.isEmpty()) return res.status(400).json({errors:errors.array()});

    db.run(
        `UPDATE announcements SET
            title = COALESCE(?, title),
            content = COALESCE(?, content)
        WHERE id = ?`,
        [title, content, id],
        function(err){
            if(err)return res.status(500).json({error:err.message});
            if(this.changes===0)return res.status(404).json({error:'Announcement not found.'});
            res.json({message:'Announcement updated successfully.'});
        }
    );
});

// Delete Announcement (Admin Only - Implement admin role if needed)
app.delete('/announcements/:id', authenticateToken, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM announcements WHERE id = ?`, id, function(err){
        if(err) return res.status(500).json({error:err.message});
        if(this.changes===0) return res.status(404).json({error:'Announcement not found.'});
        res.json({message:'Announcement deleted successfully.'});
    });
});

  
// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});