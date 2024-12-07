const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const db = require('./database'); 
const jwt = require('jsonwebtoken');
const bcrypt= require('bcrypt');
require('dotenv').config();



const app = express();
const port = process.env.PORT || 5003;

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

// ======================= USERS CRUD =======================
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
    //Validate input
    body('name').notEmpty().withMessage('Name is required.'),
    body('email').isEmail().withMessage('Valid email is required.'),
    body('password').isLength({min:6}).withMessage('Password must be at least 6 characters long.')
], async (req, res) => {
    //Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array() });
    }

    const {name, email, password} = req.body;

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
                INSERT INTO users (name, email, password)
                VALUES (?,?,?)`,
                [name, email, hashedPassword],
                function(err) {
                    if(err){
                        console.error('Database Insertion Error:', err); 
                        res.status(500).json({error: err.message});
                    } else {
                        res.status(201).json({message: 'User registered successfully!',user_id: this.lastID });
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
    body('name').optional().notEmpty().withMessage('Name cannot be empty.'),
    body('email').optional().isEmail().withMessage('Valid email is required.'),
], (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
    db.run(`
        UPDATE users SET 
            name = COALESCE(?, name), 
            email = COALESCE(?, email), 
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ?`,
        [name, email, id],
        function(err) {
            if (err) {
                res.status(400).json({ error: err.message });
            } else if (this.changes === 0) {
                res.status(404).json({ error: 'User not found.' });
            } else {
                res.json({ message: 'User updated successfully.' });
            }
        }
    );
});

// Delete User
app.delete('/users/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM users WHERE user_id = ?`, id, function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
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
        // Find user with email
        db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
            if (err) {
                console.error('Database Error:', err);
                return res.status(500).json({ error: 'Database error occurred.' });
            }
            if (!user) {
                return res.status(400).json({ error: 'Invalid email or password.' });
            }

            // Compare password
            const isSame = await bcrypt.compare(password, user.password);
            if (!isSame) {
                return res.status(400).json({ error: 'Invalid email or password.' });
            }

            // Generate JWT
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

//Middleware to verify JWT Token
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
        req.user = user; // Attach user info to the request
        next();
    });
};

// Protected route example
app.get('/protected', authenticateToken, (req, res) => {
    res.status(200).json({ message: 'This is a protected resource.', user: req.user });
});


// ======================= COURSES CRUD =======================
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

// ======================= STUDY GROUPS CRUD =======================
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

// ======================= USER-COURSES AND STUDY GROUP MEMBERS CRUD =======================
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

// User statistics endpoint
app.get('/user/stats', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    const statsQuery = `
        SELECT 
            (SELECT COUNT(*) FROM study_groups WHERE group_id IN 
                (SELECT study_group_id FROM study_group_members WHERE user_id = ?)) AS activeGroups,
            (SELECT COUNT(*) FROM sessions WHERE user_id = ? AND date > CURRENT_TIMESTAMP) AS scheduledSessions,
            (SELECT AVG(rating) FROM reviews WHERE reviewed_user_id = ?) AS userRating
    `;
    db.get(statsQuery, [userId, userId, userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

// Announcements endpoint
app.get('/announcements', authenticateToken, (req, res) => {
    db.all(`SELECT * FROM announcements ORDER BY created_at DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Recent activities endpoint
app.get('/user/activities', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    const activitiesQuery = `
        SELECT * FROM activities 
        WHERE user_id = ? 
        ORDER BY created_at DESC 
        LIMIT 10
    `;
    db.all(activitiesQuery, [userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// User profile endpoint
app.get('/user/profile', authenticateToken, (req, res) => {
    const userId = req.user.user_id;
    db.get(`SELECT * FROM users WHERE user_id = ?`, [userId], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(row);
    });
});

// Start Server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
