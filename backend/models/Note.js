const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  uploaderId: { type: String, required: true }, // Firebase user ID
  fileUrl: { type: String, required: true },    // URL to file storage location
  subject: { type: String, required: true },    // E.g. "Maths", "Physics"
   semester: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },   // Semester info e.g. "6"
  branch: { type: String, required: true },     // Branch e.g. "CSE", "ECE"
  approved: { type: Boolean, default: false },  // Admin approval flag
  uploadedAt: { type: Date, default: Date.now },// Timestamp
});

module.exports = mongoose.model('Note', noteSchema);
