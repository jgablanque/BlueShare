const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Uploads directory for proof-of-payment receipts
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// In-Memory Database
let items = [
  {
    id: '1',
    title: 'Texas Instruments BA II Plus Financial Calculator',
    category: 'calculators',
    course: 'FinMan 211 / FinAcct 101',
    price: 150,
    deposit: 200,
    lenderEmail: 'j.ablanque@addu.edu.ph',
    desc: 'Essential for finance majors. Excellent condition, fresh battery installed.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    zone: 'Finster Hall Lobby',
    featured: true
  },
  {
    id: '2',
    title: 'Rotring Technical Drawing & Drafting Board Set',
    category: 'drafting',
    course: 'EnggDraw 101 / Arch 102',
    price: 250,
    deposit: 300,
    lenderEmail: 'a.gaw@addu.edu.ph',
    desc: 'Complete set with T-square, triangles, and carrying bag.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    zone: 'CCFC',
    featured: false
  }
];

let bookings = [];

function isAdDUStudent(email) {
  return typeof email === 'string' && email.trim().toLowerCase().endsWith('@addu.edu.ph');
}

// 1. Student Auth Endpoint
app.post('/api/auth/verify-student', (req, res) => {
  const { email } = req.body;
  if (!isAdDUStudent(email)) {
    return res.status(400).json({ success: false, error: 'Restricted to @addu.edu.ph student emails.' });
  }
  res.json({ success: true, verified: true, email: email.toLowerCase() });
});

// 2. Search Equipment Catalog
app.get('/api/items', (req, res) => {
  const { q, category, course } = req.query;
  let results = [...items];

  if (category && category !== 'all') results = results.filter(i => i.category === category);
  if (course) results = results.filter(i => i.course.toLowerCase().includes(course.toLowerCase()));
  if (q) results = results.filter(i => i.title.toLowerCase().includes(q.toLowerCase()));

  results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  res.json({ success: true, count: results.length, data: results });
});

// 3. Create Booking & Upload GCash Receipt
app.post('/api/bookings', upload.single('paymentReceipt'), (req, res) => {
  const { itemId, borrowerEmail, pickupZone } = req.body;

  if (!isAdDUStudent(borrowerEmail)) {
    return res.status(403).json({ success: false, error: 'Borrower must use an @addu.edu.ph email.' });
  }

  const item = items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ success: false, error: 'Item not found.' });

  const contractId = 'CONTRACT-ADDU-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const booking = {
    bookingId: 'BK-' + Date.now(),
    contractId,
    item,
    borrowerEmail,
    pickupZone: pickupZone || item.zone,
    totalPaid: item.price + item.deposit + 15,
    status: 'PENDING_VERIFICATION',
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  res.status(201).json({ success: true, message: 'Booking request created.', data: booking });
});

app.listen(PORT, () => console.log(`BlueShare API running on port ${PORT}`));const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Uploads directory for proof-of-payment receipts
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// In-Memory Database
let items = [
  {
    id: '1',
    title: 'Texas Instruments BA II Plus Financial Calculator',
    category: 'calculators',
    course: 'FinMan 211 / FinAcct 101',
    price: 150,
    deposit: 200,
    lenderEmail: 'j.ablanque@addu.edu.ph',
    desc: 'Essential for finance majors. Excellent condition, fresh battery installed.',
    image: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
    zone: 'Finster Hall Lobby',
    featured: true
  },
  {
    id: '2',
    title: 'Rotring Technical Drawing & Drafting Board Set',
    category: 'drafting',
    course: 'EnggDraw 101 / Arch 102',
    price: 250,
    deposit: 300,
    lenderEmail: 'a.gaw@addu.edu.ph',
    desc: 'Complete set with T-square, triangles, and carrying bag.',
    image: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    zone: 'CCFC',
    featured: false
  }
];

let bookings = [];

function isAdDUStudent(email) {
  return typeof email === 'string' && email.trim().toLowerCase().endsWith('@addu.edu.ph');
}

// 1. Student Auth Endpoint
app.post('/api/auth/verify-student', (req, res) => {
  const { email } = req.body;
  if (!isAdDUStudent(email)) {
    return res.status(400).json({ success: false, error: 'Restricted to @addu.edu.ph student emails.' });
  }
  res.json({ success: true, verified: true, email: email.toLowerCase() });
});

// 2. Search Equipment Catalog
app.get('/api/items', (req, res) => {
  const { q, category, course } = req.query;
  let results = [...items];

  if (category && category !== 'all') results = results.filter(i => i.category === category);
  if (course) results = results.filter(i => i.course.toLowerCase().includes(course.toLowerCase()));
  if (q) results = results.filter(i => i.title.toLowerCase().includes(q.toLowerCase()));

  results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
  res.json({ success: true, count: results.length, data: results });
});

// 3. Create Booking & Upload GCash Receipt
app.post('/api/bookings', upload.single('paymentReceipt'), (req, res) => {
  const { itemId, borrowerEmail, pickupZone } = req.body;

  if (!isAdDUStudent(borrowerEmail)) {
    return res.status(403).json({ success: false, error: 'Borrower must use an @addu.edu.ph email.' });
  }

  const item = items.find(i => i.id === itemId);
  if (!item) return res.status(404).json({ success: false, error: 'Item not found.' });

  const contractId = 'CONTRACT-ADDU-' + crypto.randomBytes(4).toString('hex').toUpperCase();
  const booking = {
    bookingId: 'BK-' + Date.now(),
    contractId,
    item,
    borrowerEmail,
    pickupZone: pickupZone || item.zone,
    totalPaid: item.price + item.deposit + 15,
    status: 'PENDING_VERIFICATION',
    createdAt: new Date().toISOString()
  };

  bookings.push(booking);
  res.status(201).json({ success: true, message: 'Booking request created.', data: booking });
});

app.listen(PORT, () => console.log(`BlueShare API running on port ${PORT}`));
