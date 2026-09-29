require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sendLoginOtp } = require('./utils/email');
const pool = require('./db'); // Load PostgreSQL connection

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow cross-origin requests from the frontend
app.use(express.json()); // Parse JSON request bodies

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).send('Sundip Forms API is running securely!');
});

// Database Initialization
const initDB = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS staff (
                id SERIAL PRIMARY KEY,
                staff_type VARCHAR(50),
                emp_id VARCHAR(50),
                name VARCHAR(255),
                designation VARCHAR(255),
                college VARCHAR(255),
                distance NUMERIC,
                bank_name VARCHAR(255),
                acc_no VARCHAR(255),
                ifsc VARCHAR(50),
                branch VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            
            CREATE TABLE IF NOT EXISTS assignments (
                id SERIAL PRIMARY KEY,
                claim_no VARCHAR(100),
                exam_date DATE,
                time_slot VARCHAR(100),
                div_batch VARCHAR(100),
                school VARCHAR(255),
                course VARCHAR(255),
                subject VARCHAR(255),
                sub_type VARCHAR(100),
                candidate_level VARCHAR(2) DEFAULT 'UG',
                registered INT,
                present INT,
                ext_name VARCHAR(255),
                int_name VARCHAR(255),
                lab_name VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            ALTER TABLE assignments ADD COLUMN IF NOT EXISTS candidate_level VARCHAR(2) DEFAULT 'UG';

            CREATE TABLE IF NOT EXISTS payment_rules (
                id INT PRIMARY KEY DEFAULT 1,
                ug_rate NUMERIC DEFAULT 15,
                pg_rate NUMERIC DEFAULT 20,
                ta_rate NUMERIC DEFAULT 8,
                da_rate NUMERIC DEFAULT 150,
                lab_rate NUMERIC DEFAULT 70,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS auth_settings (
                id INT PRIMARY KEY DEFAULT 1,
                shared_password VARCHAR(255) DEFAULT 'sandip123'
            );
            INSERT INTO auth_settings (id, shared_password) VALUES (1, 'sandip123') ON CONFLICT (id) DO NOTHING;
        `);
        console.log("Database tables initialized.");
    } catch (err) {
        console.error("Error initializing database:", err);
    }
};
initDB();

// --- API ENDPOINTS ---

// GET: Retrieve all registered staff
app.get('/api/staff', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM staff ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error fetching staff:", err);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

// POST: Save new staff from Master Form
app.post('/api/staff', async (req, res) => {
    const { type, id, name, designation, college, distance, bankName, accNo, ifsc, branch } = req.body;
    
    try {
        const result = await pool.query(
            `INSERT INTO staff 
            (staff_type, emp_id, name, designation, college, distance, bank_name, acc_no, ifsc, branch) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
            [type, id, name, designation, college, distance, bankName, accNo, ifsc, branch]
        );
        res.status(201).json({ success: true, data: result.rows[0], message: "Staff saved successfully!" });
    } catch (err) {
        console.error("Error saving staff:", err);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

// PUT: Update staff
app.put('/api/staff/:id', async (req, res) => {
    const { id: staffId } = req.params;
    const { type, id, name, designation, college, distance, bankName, accNo, ifsc, branch } = req.body;
    
    try {
        const result = await pool.query(
            `UPDATE staff SET 
            staff_type = $1, emp_id = $2, name = $3, designation = $4, college = $5, 
            distance = $6, bank_name = $7, acc_no = $8, ifsc = $9, branch = $10 
            WHERE id = $11 RETURNING *`,
            [type, id, name, designation, college, distance, bankName, accNo, ifsc, branch, staffId]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }
        res.status(200).json({ success: true, data: result.rows[0], message: "Staff updated successfully!" });
    } catch (err) {
        console.error("Error updating staff:", err);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

// DELETE: Remove staff
app.delete('/api/staff/:id', async (req, res) => {
    const { id: staffId } = req.params;
    try {
        const result = await pool.query('DELETE FROM staff WHERE id = $1 RETURNING *', [staffId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: "Staff not found" });
        }
        res.status(200).json({ success: true, message: "Staff deleted successfully!" });
    } catch (err) {
        console.error("Error deleting staff:", err);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

// GET: Retrieve payment rules
app.get('/api/payment-rules', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM payment_rules WHERE id = 1');
        res.status(200).json({ success: true, data: result.rows[0] });
    } catch (err) {
        console.error("Error fetching payment rules:", err);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

// PUT: Update payment rules
app.put('/api/payment-rules', async (req, res) => {
    const { ugRate, pgRate, taRate, daRate, labRate } = req.body;
    try {
        const result = await pool.query(
            `UPDATE payment_rules SET ug_rate=$1, pg_rate=$2, ta_rate=$3, da_rate=$4, lab_rate=$5, updated_at=NOW() WHERE id=1 RETURNING *`,
            [ugRate, pgRate, taRate, daRate, labRate]
        );
        res.status(200).json({ success: true, data: result.rows[0], message: "Payment rules saved!" });
    } catch (err) {
        console.error("Error saving payment rules:", err);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

// GET: Retrieve all assignments
app.get('/api/assignments', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM assignments ORDER BY created_at DESC');
        res.status(200).json({ success: true, data: result.rows });
    } catch (err) {
        console.error("Error fetching assignments:", err);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});

// POST: Save new assignment
app.post('/api/assignments', async (req, res) => {
    const { claimNo, examDate, timeSlot, divBatch, school, course, subject, subType, registered, present, extName, intName, labName } = req.body;
    const candidateLevel = String(req.body.candidateLevel || 'UG').trim().toUpperCase() === 'PG' ? 'PG' : 'UG';
    
    try {
        // Check if claim_no already exists
        const existing = await pool.query('SELECT id FROM assignments WHERE claim_no = $1', [claimNo]);
        
        let result;
        if (existing.rows.length > 0) {
            // Update existing
            result = await pool.query(
                `UPDATE assignments SET 
                    exam_date = $2, time_slot = $3, div_batch = $4, school = $5, 
                    course = $6, subject = $7, sub_type = $8, candidate_level = $9, registered = $10, 
                    present = $11, ext_name = $12, int_name = $13, lab_name = $14 
                WHERE claim_no = $1 RETURNING *`,
                [claimNo, examDate || null, timeSlot, divBatch, school, course, subject, subType, candidateLevel, registered, present, extName, intName, labName]
            );
        } else {
            // Insert new
            result = await pool.query(
                `INSERT INTO assignments 
                (claim_no, exam_date, time_slot, div_batch, school, course, subject, sub_type, candidate_level, registered, present, ext_name, int_name, lab_name) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
                [claimNo, examDate || null, timeSlot, divBatch, school, course, subject, subType, candidateLevel, registered, present, extName, intName, labName]
            );
        }
        res.status(201).json({ success: true, data: result.rows[0], message: "Assignment saved successfully!" });
    } catch (err) {
        console.error("Error saving assignment:", err);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});


// DELETE: Remove an assignment by claim_no
app.delete('/api/assignments/:claimNo', async (req, res) => {
    try {
        const claimNo = req.params.claimNo;
        const result = await pool.query('DELETE FROM assignments WHERE claim_no = $1 RETURNING *', [claimNo]);
        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, message: 'Assignment not found' });
        }
        res.status(200).json({ success: true, message: 'Assignment deleted successfully!' });
    } catch (err) {
        console.error("Error deleting assignment:", err);
        res.status(500).json({ success: false, message: "Database Error" });
    }
});


// In-memory store for OTPs
const otpStore = {};

// Login Route
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    console.log(`\nLogin attempt for email: ${email}`);

    // List of allowed emails
    const allowedEmails = [
        "rahulpatil@sandipuniversity.edu.in",
        "anirudh.kolpyakwar@sandipuniversity.edu.in",
        "raghurag172@gmail.com"
    ];

    if (!allowedEmails.includes(email)) {
        return res.status(401).json({ success: false, message: 'Unauthorized email address.' });
    }

    try {
        const authRes = await pool.query('SELECT shared_password FROM auth_settings WHERE id = 1');
        const sharedPassword = authRes.rows[0].shared_password;
        
        if (password !== sharedPassword) {
            return res.status(401).json({ success: false, message: 'Incorrect password.' });
        }
    } catch(err) {
        console.error('Error fetching password:', err);
        return res.status(500).json({ success: false, message: 'Database Error' });
    }

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Store OTP in memory (expires in 5 minutes)
    otpStore[email] = otp;
    setTimeout(() => {
        delete otpStore[email];
    }, 5 * 60 * 1000);

    // Trigger the email sending logic
    try {
        // Send the OTP
        await sendLoginOtp(email, otp, 'Student');
        
        // Respond to the frontend
        res.status(200).json({ 
            success: true, 
            message: 'OTP has been sent to your email.',
        });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Verify OTP Route
app.post('/api/verify-otp', (req, res) => {
    const { email, otp } = req.body;

    if (otpStore[email] && otpStore[email] === otp) {
        // OTP matches, clear it and allow login
        delete otpStore[email];
        res.status(200).json({ success: true, message: 'OTP verified successfully.' });
    } else {
        res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }
});

// Forgot Password Route (Send OTP)
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    const allowedEmails = [
        "rahulpatil@sandipuniversity.edu.in",
        "anirudh.kolpyakwar@sandipuniversity.edu.in",
        "raghurag172@gmail.com"
    ];

    if (!allowedEmails.includes(email)) {
        return res.status(401).json({ success: false, message: 'Unauthorized email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = otp;
    setTimeout(() => { delete otpStore[email]; }, 5 * 60 * 1000);

    try {
        await sendLoginOtp(email, otp, 'Password Reset');
        res.status(200).json({ success: true, message: 'Password reset OTP has been sent to your email.' });
    } catch (error) {
        console.error('Error sending reset OTP:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
});

// Reset Password Route (Verify OTP and Change Password)
app.post('/api/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (otpStore[email] && otpStore[email] === otp) {
        try {
            await pool.query('UPDATE auth_settings SET shared_password = $1 WHERE id = 1', [newPassword]);
            delete otpStore[email];
            res.status(200).json({ success: true, message: 'Password has been successfully changed for all users!' });
        } catch(err) {
            console.error('Error updating password:', err);
            res.status(500).json({ success: false, message: 'Database Error' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
