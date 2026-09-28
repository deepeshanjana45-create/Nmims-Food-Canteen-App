const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env'), override: true });
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Firebase client SDK (CommonJS compat) — for Firestore student persistence
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, getDoc, setDoc, updateDoc, serverTimestamp } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyA2gkmI3f-TPPuDRqxVmPnybs64zlO-o54",
  authDomain: "nmims-canteen-c4b40.firebaseapp.com",
  projectId: "nmims-canteen-c4b40",
  storageBucket: "nmims-canteen-c4b40.firebasestorage.app",
  messagingSenderId: "760798816372",
  appId: "1:760798816372:web:30c901a79a9bfe4e14c921",
  measurementId: "G-JXYS7P2XCN",
};

const firebaseApp = initializeApp(firebaseConfig, 'server');
const db = getFirestore(firebaseApp);

/**
 * Sync verified student to Firestore: students/{email}
 * - New student → creates document with createdAt + lastLogin
 * - Returning student → updates lastLogin only
 * - Never stores OTP or password
 */
async function syncStudentToFirestore(studentEmail, uid) {
  try {
    // Use email as the document ID (replace dots/special chars for safety)
    const docId = studentEmail;
    const studentDocRef = doc(db, 'students', docId);
    const docSnap = await getDoc(studentDocRef);

    if (docSnap.exists()) {
      await updateDoc(studentDocRef, {
        lastLogin: serverTimestamp(),
        verified: true,
      });
      console.log(`[FIRESTORE] Updated lastLogin for student: students/${docId}`);
    } else {
      await setDoc(studentDocRef, {
        uid,
        email: studentEmail,
        verified: true,
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      });
      console.log(`[FIRESTORE] Created new student record: students/${docId}`);
    }
  } catch (err) {
    console.error('[FIRESTORE ERROR] Could not sync student document:', err);
  }
}

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// We now use Firestore for OTP storage, so in-memory otpStore is removed.

// Transporter cache
let cachedTransporter = null;
let isEthereal = false;

async function getTransporter() {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (user && pass) {
    const host = process.env.SMTP_HOST || 'smtp.gmail.com';
    const port = parseInt(process.env.SMTP_PORT || '465', 10);
    const secure = process.env.SMTP_SECURE === 'true' || port === 465;

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    });
  }

  // Fallback to Nodemailer Ethereal test account if .env SMTP is not yet populated
  if (!cachedTransporter) {
    try {
      console.log('No SMTP_USER / SMTP_PASS in .env — creating Nodemailer test account...');
      const testAccount = await nodemailer.createTestAccount();
      cachedTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
      isEthereal = true;
      console.log(`Nodemailer test SMTP ready: ${testAccount.user}`);
    } catch (err) {
      console.error('Failed to create Nodemailer test account:', err);
      throw new Error('Email service unavailable. Please configure SMTP in .env');
    }
  }
  return cachedTransporter;
}

// Generate HTML email template
function createOtpEmailHtml(otp) {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #12131C; color: #FFFFFF; padding: 40px 20px; border-radius: 12px; max-width: 500px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #FF4D4D; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: 1px;">NMIMS CANTEEN</h1>
        <p style="color: #94A3B8; margin-top: 6px; font-size: 13px;">Student Food Portal Verification</p>
      </div>
      <div style="background-color: #1C1E2D; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 24px; text-align: center;">
        <p style="color: #CBD5E1; font-size: 14px; margin-bottom: 16px;">
          Use the 6-digit verification code below to complete your student login and place your canteen order:
        </p>
        <div style="background-color: rgba(255, 77, 77, 0.1); border: 2px dashed #FF4D4D; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #FF4D4D;">${otp}</span>
        </div>
        <p style="color: #94A3B8; font-size: 12px; margin-top: 16px;">
          ⏱️ This code is valid for <strong>5 minutes</strong>. Do not share this code with anyone.
        </p>
      </div>
      <div style="text-align: center; margin-top: 24px; color: #64748B; font-size: 11px;">
        NMIMS University · Indore Campus Canteen
      </div>
    </div>
  `;
}

// POST /api/auth/send-otp
app.post('/api/auth/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
    }

    const otpDocRef = doc(db, 'otps', cleanEmail);
    const otpSnap = await getDoc(otpDocRef);

    // Cooldown check: 30 seconds
    if (otpSnap.exists()) {
      const existingData = otpSnap.data();
      const lastSentTime = existingData.createdAt ? existingData.createdAt.toMillis() : 0;
      if (Date.now() - lastSentTime < 30 * 1000) {
        const waitSec = Math.ceil((30 * 1000 - (Date.now() - lastSentTime)) / 1000);
        return res.status(429).json({
          success: false,
          message: `Please wait ${waitSec}s before requesting a new code.`,
        });
      }
    }

    // Secure 6-digit OTP generation (Backend only)
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hash = crypto.createHash('sha256').update(otp).digest('hex');
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    // Store in Firestore otps/{email}
    await setDoc(otpDocRef, {
      otpHash: hash,
      createdAt: serverTimestamp(),
      expiresAt: expiresAt,
      used: false,
      attempts: 0
    });

    // Send email via Nodemailer
    const transporter = await getTransporter();
    const fromAddress = process.env.SMTP_FROM || `NMIMS Canteen <${process.env.SMTP_USER || 'no-reply@nmims.edu'}>`;

    const info = await transporter.sendMail({
      from: fromAddress,
      to: cleanEmail,
      subject: 'Your NMIMS Canteen Login OTP',
      text: `Your NMIMS Canteen verification code is: ${otp}. It is valid for 5 minutes.`,
      html: createOtpEmailHtml(otp),
    });

    console.log(`[AUTH] OTP sent via email to: ${cleanEmail}`);
    if (isEthereal && nodemailer.getTestMessageUrl) {
      console.log(`[ETHEREAL PREVIEW URL]: ${nodemailer.getTestMessageUrl(info)}`);
    }

    // NEVER return OTP to client
    return res.json({
      success: true,
      message: `A 6-digit verification code was sent to ${cleanEmail}`,
    });
  } catch (err) {
    console.error('[AUTH ERROR] send-otp failed:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Failed to send verification email. Please check SMTP configuration.',
    });
  }
});

// POST /api/auth/verify-otp
app.post('/api/auth/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanOtp = (otp || '').trim();

    if (!cleanEmail) {
      return res.status(400).json({ success: false, message: 'Email is required.' });
    }
    if (!cleanOtp || cleanOtp.length !== 6) {
      return res.status(400).json({ success: false, message: 'Please enter the 6-digit verification code.' });
    }

    const otpDocRef = doc(db, 'otps', cleanEmail);
    const otpSnap = await getDoc(otpDocRef);

    if (!otpSnap.exists()) {
      return res.status(400).json({
        success: false,
        message: 'No verification code was requested for this email. Please request one first.',
      });
    }

    const record = otpSnap.data();

    if (record.used) {
      return res.status(400).json({
        success: false,
        message: 'This code has already been used. Please request a new one.',
      });
    }

    // Check expiry (5 minutes)
    if (Date.now() > record.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'The verification code has expired. Please request a new code.',
      });
    }

    // Check max attempts (5)
    if (record.attempts >= 5) {
      return res.status(400).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new verification code.',
      });
    }

    // Verify hash
    const inputHash = crypto.createHash('sha256').update(cleanOtp).digest('hex');
    if (inputHash !== record.otpHash) {
      const newAttempts = (record.attempts || 0) + 1;
      await updateDoc(otpDocRef, { attempts: newAttempts });

      const remaining = 5 - newAttempts;
      return res.status(400).json({
        success: false,
        message: `Invalid verification code. ${remaining} attempt${remaining !== 1 ? 's' : ''} remaining.`,
      });
    }

    // Valid: Mark OTP as used
    await updateDoc(otpDocRef, { used: true });

    // Create student profile & session token
    const uid = 'nmims_' + crypto.createHash('md5').update(cleanEmail).digest('hex').slice(0, 12);
    const studentUser = {
      uid,
      email: cleanEmail,
      name: cleanEmail
        .split('@')[0]
        .replace(/[._]/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      sapId: cleanEmail.split('@')[0].replace(/[^0-9]/g, '') || '70012023045',
      branch: 'NMIMS Student',
      year: 'Campus Portal',
      campus: 'Indore Campus',
    };

    const sessionToken = 'tok_' + crypto.randomBytes(32).toString('hex');

    console.log(`[AUTH] Student authenticated successfully: ${cleanEmail}`);

    // Persist verified student to Firestore: students/{email}
    // This runs async — don't block the response
    syncStudentToFirestore(cleanEmail, uid).catch((err) => {
      console.error('[FIRESTORE] Background sync failed:', err);
    });

    return res.json({
      success: true,
      user: studentUser,
      token: sessionToken,
    });
  } catch (err) {
    console.error('[AUTH ERROR] verify-otp failed:', err);
    return res.status(500).json({ success: false, message: 'Server error during verification.' });
  }
});

// POST /api/auth/resend-otp
app.post('/api/auth/resend-otp', async (req, res) => {
  // Delegate to send-otp endpoint logic
  req.url = '/api/auth/send-otp';
  return app._router.handle(req, res);
});

// GET /api/health
app.get('/api/health', (req, res) => {
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const userConfigured = Boolean(user && pass);
  return res.json({
    status: 'ok',
    mode: userConfigured ? 'production_smtp' : (isEthereal ? 'ethereal_test' : 'unconfigured'),
    port: PORT,
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ NMIMS Canteen Auth Server running on http://127.0.0.1:${PORT}`);
});
