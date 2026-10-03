require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { sendLoginOtp } = require('./utils/email');
const pool = require('./db'); // Load PostgreSQL connection

const JWT_SECRET = process.env.JWT_SECRET || 'sandip-forms-secret-2026';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: [
        'http://127.0.0.1:5500',
        'http://localhost:5500',
        'http://127.0.0.1:3000',
        'http://localhost:3000',
        'https://practical-forms.vercel.app',
        /\.vercel\.app$/   // allow all vercel preview deployments
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(express.json()); // Parse JSON request bodies

// Health Check Route
app.get('/', (req, res) => {
    res.status(200).send('Sandip Forms API is running securely!');
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
            
            INSERT INTO payment_rules (id) VALUES (1) ON CONFLICT (id) DO NOTHING;
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

// Admin: Clean up bad (negative) claim numbers
app.delete('/api/assignments/cleanup-bad', async (req, res) => {
    try {
        const result = await pool.query("DELETE FROM assignments WHERE claim_no LIKE '-%' OR claim_no = '' OR claim_no IS NULL");
        res.status(200).json({ success: true, deleted: result.rowCount, message: `Cleaned up ${result.rowCount} bad records.` });
    } catch (err) {
        console.error("Error cleaning up assignments:", err);
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


// ── Ensure otp_store table exists (runs on first request) ──
let otpTableReady = false;
async function ensureOtpTable() {
    if (otpTableReady) return;
    await pool.query(`
        CREATE TABLE IF NOT EXISTS otp_store (
            email       VARCHAR(255) PRIMARY KEY,
            otp         VARCHAR(10)  NOT NULL,
            expires_at  TIMESTAMPTZ  NOT NULL
        )
    `);
    otpTableReady = true;
}


// Login Route — Step 1: validate credentials, generate OTP, return temp JWT
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    console.log(`\nLogin attempt for email: ${email}`);

    const allowedEmails = [
        "sanjeevanilshukla@gmail.com",
        "anirudha.kolpyakwar@gmail.com",
        "saeebhadane9@gmail.com",
    ];

    if (!allowedEmails.includes(email)) {
        return res.status(401).json({ success: false, message: 'Unauthorized email address.' });
    }

    // Validate password
    try {
        const authRes = await pool.query('SELECT shared_password FROM auth_settings WHERE id = 1');
        const sharedPassword = authRes.rows.length > 0 ? authRes.rows[0].shared_password : 'sandip123';
        if (password !== sharedPassword) {
            return res.status(401).json({ success: false, message: 'Incorrect password.' });
        }
    } catch (err) {
        console.error('Error fetching password:', err);
        return res.status(500).json({ success: false, message: 'Database Error while fetching password.' });
    }

    // Generate 6-digit OTP and save to DB
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
        await ensureOtpTable();
        await pool.query(
            `INSERT INTO otp_store (email, otp, expires_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO UPDATE SET otp = $2, expires_at = $3`,
            [email, otp, expiresAt]
        );
    } catch (err) {
        console.error('Error saving OTP to DB:', err);
        return res.status(500).json({ success: false, message: 'Database Error while saving OTP.' });
    }

    // Send OTP email
    try {
        await sendLoginOtp(email, otp, 'User');
    } catch (error) {
        console.error('Error sending OTP email:', error);
    }

    // Issue short-lived TEMP JWT (proves login attempt is in progress, 10 min)
    const tempToken = jwt.sign(
        { email, purpose: 'otp-verification' },
        JWT_SECRET,
        { expiresIn: '10m' }
    );

    res.status(200).json({
        success: true,
        message: 'OTP has been securely sent to your email.',
        tempToken
    });
});

// Verify OTP Route — Step 2: validate temp JWT + OTP, issue final auth JWT
app.post('/api/verify-otp', async (req, res) => {
    const { tempToken, otp } = req.body;

    // Verify temporary JWT
    let decoded;
    try {
        decoded = jwt.verify(tempToken, JWT_SECRET);
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Session expired. Please login again.' });
    }

    if (decoded.purpose !== 'otp-verification') {
        return res.status(401).json({ success: false, message: 'Invalid session token.' });
    }

    const email = decoded.email;

    try {
        await ensureOtpTable();
        const result = await pool.query(
            `SELECT otp, expires_at FROM otp_store WHERE email = $1`, [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        const { otp: storedOtp, expires_at } = result.rows[0];

        if (new Date() > new Date(expires_at)) {
            await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);
            return res.status(401).json({ success: false, message: 'OTP expired. Please request a new one.' });
        }

        if (storedOtp !== String(otp).trim()) {
            return res.status(401).json({ success: false, message: 'Invalid OTP. Please check your email.' });
        }

        // OTP matched — delete it (single use)
        await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);

        // Issue final authentication JWT (valid 8 hours)
        const authToken = jwt.sign(
            { email, role: 'admin' },
            JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful.',
            authToken
        });

    } catch (err) {
        console.error('Error verifying OTP:', err);
        res.status(500).json({ success: false, message: 'Database Error during OTP verification.' });
    }
});



// Forgot Password Route (Send OTP)
app.post('/api/forgot-password', async (req, res) => {
    const { email } = req.body;
    const allowedEmails = [
        "sanjeevanilshukla@gmail.com",
        "anirudha.kolpyakwar@gmail.com",
        "saeebhadane9@gmail.com"
    ];

    if (!allowedEmails.includes(email)) {
        return res.status(401).json({ success: false, message: 'Unauthorized email address.' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    try {
        await ensureOtpTable();
        await pool.query(
            `INSERT INTO otp_store (email, otp, expires_at)
             VALUES ($1, $2, $3)
             ON CONFLICT (email) DO UPDATE SET otp = $2, expires_at = $3`,
            [email, otp, expiresAt]
        );
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

    try {
        await ensureOtpTable();
        const result = await pool.query(
            `SELECT otp, expires_at FROM otp_store WHERE email = $1`, [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid or expired OTP.' });
        }

        const { otp: storedOtp, expires_at } = result.rows[0];

        if (new Date() > new Date(expires_at)) {
            await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);
            return res.status(401).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        if (storedOtp !== String(otp).trim()) {
            return res.status(401).json({ success: false, message: 'Invalid OTP.' });
        }

        await pool.query('UPDATE auth_settings SET shared_password = $1 WHERE id = 1', [newPassword]);
        await pool.query('DELETE FROM otp_store WHERE email = $1', [email]);
        res.status(200).json({ success: true, message: 'Password has been successfully changed for all users!' });

    } catch (err) {
        console.error('Error resetting password:', err);
        res.status(500).json({ success: false, message: 'Database Error' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
