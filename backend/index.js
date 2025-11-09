// Load environment variables from .env file
require('dotenv').config();

// IMPORTS
const ADMIN_UIDS = ['Ua0vFdHyJqS6SDu52fZ9nG2TUtM2','T2W0p3XbL2NkyuThucp6NeF7iGj2'];
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');      // <-- You need this for MongoDB!
const admin = require('./firebase');       // <-- Import Firebase Admin SDK
const verifyFirebaseToken = require('./verifyFirebaseToken');
const multer = require('multer');          // <-- Added for file upload
const Note = require('./models/Note');     // <-- Your Note model (create this file separately)
const path = require('path');


// INITIALIZE EXPRESS APP
const app = express();
app.use(cors());
app.use(express.json());

// Multer setup for storing files locally in uploads/
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Make sure you create this folder manually
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// CONNECT TO MONGODB ATLAS
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// INITIALIZE AND CHECK FIREBASE ADMIN
console.log('Firebase Admin initialized:', !!admin.apps.length);

// ROUTES
app.get('/', (req, res) => res.send('Notes Sharing API Running'));

// Protected upload route that accepts single file + metadata
app.post('/uploadNote', verifyFirebaseToken, upload.single('noteFile'), async (req, res) => {
  try {
    const { subject, semester, branch } = req.body;
    const fileUrl = req.file.path; // local file path saved by multer

    // Create new note object
    const note = new Note({
      uploaderId: req.user.uid,   // Firebase user ID from token
      fileUrl,
      subject,
      semester,
      branch,
      approved: false             // default pending approval
    });

    await note.save();           // Save note metadata to MongoDB
    res.status(201).json({ message: 'Note uploaded and awaiting approval', note });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

app.get('/notes', verifyFirebaseToken, async (req, res) => {
  try {
    // Admins see all notes (pending and approved)
    if (ADMIN_UIDS.includes(req.user.uid)) {
      const notes = await Note.find({});
      return res.json(notes);
    }
    // Regular users see only approved notes
    const notes = await Note.find();
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Unable to fetch notes' });
  }
});


// ...existing code...
app.patch('/notes/:id/approve', verifyFirebaseToken, async (req, res) => {
  try {
    // Only allow admins to approve notes
    console.log('User trying to approve:', req.user.uid);
    console.log('Admin UIDs:', ADMIN_UIDS);

    if (!ADMIN_UIDS.includes(req.user.uid)) {
      return res.status(403).json({ error: 'Access denied: Admins only' });
    }

    const note = await Note.findByIdAndUpdate(
      req.params.id,
      { approved: true },
      { new: true }
    );

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note approved successfully', note });
  } catch (error) {
    res.status(500).json({ error: 'Server error while approving note' });
  }
});
// ...existing code...

app.get('/notes/:id/download', verifyFirebaseToken, async (req, res) => {
  try {

    // Find the note by ID
    const note = await Note.findById(req.params.id);

    // Check if note exists
    if (!note) return res.status(404).json({ error: 'Note not found' });

    // Regular users: Only allow download if note is approved
    const isAdmin = ADMIN_UIDS.includes(req.user.uid);
    if (!note.approved && !isAdmin) {
      return res.status(403).json({ error: 'Not approved for download' });
    }

    // Send the file
    res.sendFile(path.resolve(note.fileUrl), err => {
      if (err) {
        res.status(500).json({ error: 'Error sending file' });
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error while downloading note' });
  }
});

app.get('/my-notes', verifyFirebaseToken, async (req, res) => {
  try {
    const notes = await Note.find({ uploaderId: req.user.uid });
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch your uploads' });
  }
});

app.get('/notes/search', verifyFirebaseToken, async (req, res) => {
  try {
    const filters = {};

    // Add filters based on query parameters
    if (req.query.subject) filters.subject = req.query.subject;
    if (req.query.semester) filters.semester = req.query.semester;
    if (req.query.branch) filters.branch = req.query.branch;

    // Admin sees all notes, others only approved
    if (!ADMIN_UIDS.includes(req.user.uid)) {
      filters.approved = true;
    }

    const notes = await Note.find(filters);
    res.json(notes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch filtered notes' });
  }
});


// START SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
