'use client';
import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Box,
  TextField,
  MenuItem,
  Grid
} from '@mui/material';
import type { FirebaseOptions } from 'firebase/app';
import type { User } from 'firebase/auth';
import { initFirebase, onAuthChanged, signInWithGooglePopup, signOut } from '../../lib/firebaseClient';
import NoteCard from '../../components/NoteCard';

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
};
try { initFirebase(firebaseConfig); } catch (e) { /* already initialized */ }

type Note = {
  _id: string;
  subject?: string;
  semester?: number | string;
  branch?: string;
  uploaderId?: string;
  approved?: boolean;
};

export default function NotesPage() {
  const [user, setUser] = useState<User | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [snack, setSnack] = useState<{ open: boolean; message: string; severity?: 'error'|'success'|'info' }>({ open: false, message: '', severity: 'info' });
  const [filters, setFilters] = useState({ subject: '', semester: '', branch: '' });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const ADMIN_UIDS = (process.env.NEXT_PUBLIC_ADMIN_UIDS || '').split(',').map(s => s.trim()).filter(Boolean);

  useEffect(() => {
    const unsub = onAuthChanged(u => setUser(u));
    return () => unsub();
  }, []);

  async function getIdToken() {
    if (!user) return null;
    return user.getIdToken();
  }

  function buildQuery() {
    const params = new URLSearchParams();
    if (filters.branch) params.append('branch', filters.branch);
    if (filters.semester) params.append('semester', filters.semester);
    if (filters.subject) params.append('subject', filters.subject);
    const q = params.toString();
    return q ? `?${q}` : '';
  }

  async function fetchNotes() {
    setLoading(true);
    try {
      const token = await getIdToken();
      const headers: Record<string,string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${API_BASE}/notes${buildQuery()}`, { headers });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Failed to fetch notes: ${res.status} ${txt}`);
      }
      const data: Note[] = await res.json();
      setNotes(data);
    } catch (err: any) {
      setSnack({ open: true, message: err?.message || 'Failed to load notes', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(id: string) {
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Sign in to download');
      const res = await fetch(`${API_BASE}/notes/${id}/download`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a'); a.href = url; a.download = 'note'; document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setSnack({ open: true, message: err?.message || 'Download error', severity: 'error' });
    }
  }

  async function handleApprove(id: string) {
    try {
      const token = await getIdToken();
      if (!token) throw new Error('Sign in as admin to approve');
      const res = await fetch(`${API_BASE}/notes/${id}/approve`, { method: 'PATCH', headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`Approve failed: ${res.status} ${t}`);
      }
      setNotes(prev => prev.map(n => n._id === id ? { ...n, approved: true } : n));
      setSnack({ open: true, message: 'Approved', severity: 'success' });
    } catch (err: any) {
      setSnack({ open: true, message: err?.message || 'Approve failed', severity: 'error' });
    }
  }

  async function handleSignIn() {
    try {
      await signInWithGooglePopup();
      setSnack({ open: true, message: 'Signed in', severity: 'success' });
      await fetchNotes();
    } catch (e: any) {
      setSnack({ open: true, message: e?.message || 'Sign-in failed', severity: 'error' });
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      setUser(null);
      setNotes([]);
      setSnack({ open: true, message: 'Signed out', severity: 'info' });
    } catch (e: any) {
      setSnack({ open: true, message: e?.message || 'Sign-out failed', severity: 'error' });
    }
  }

  const isAdmin = !!user && ADMIN_UIDS.includes(user.uid);

  useEffect(() => {
    if (!user) {
      setNotes([]);
      return;
    }
    // fetch when user becomes available
    fetchNotes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <Container sx={{ pb: 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Notes</Typography>
        <Box>
          {user ? (
            <Button variant="outlined" color="inherit" onClick={handleSignOut}>Sign out</Button>
          ) : (
            <Button variant="contained" onClick={handleSignIn}>Sign in to load</Button>
          )}
        </Box>
      </Box>

      <Box mb={3} display="flex" gap={2} flexWrap="wrap">
        <TextField label="Subject" size="small" value={filters.subject} onChange={e => setFilters(s => ({ ...s, subject: e.target.value }))} sx={{ minWidth: 220 }} />
        <TextField select label="Semester" size="small" value={filters.semester} onChange={e => setFilters(s => ({ ...s, semester: e.target.value }))} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          {[1,2,3,4,5,6,7,8].map(s => <MenuItem key={s} value={String(s)}>Semester {s}</MenuItem>)}
        </TextField>
        <TextField select label="Branch" size="small" value={filters.branch} onChange={e => setFilters(s => ({ ...s, branch: e.target.value }))} sx={{ minWidth: 160 }}>
          <MenuItem value="">All</MenuItem>
          {['CSE','IT','ECE','EEE','MECH'].map(b => <MenuItem key={b} value={b}>{b}</MenuItem>)}
        </TextField>
        <Box>
          <Button variant="contained" onClick={fetchNotes} sx={{ mr: 1 }}>Search</Button>
          <Button variant="outlined" onClick={() => { setFilters({ subject: '', semester: '', branch: '' }); setTimeout(fetchNotes, 0); }}>Clear</Button>
        </Box>
      </Box>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}><CircularProgress /></Box>
      ) : (
        <Grid container spacing={2}>
          {notes.length === 0 ? (
            <Grid item xs={12}>
              <Typography align="center" color="text.secondary" sx={{ py: 6 }}>No notes found</Typography>
            </Grid>
          ) : notes.map(note => (
            <Grid item xs={12} sm={6} md={4} key={note._id}>
              <NoteCard note={note} onDownload={handleDownload} onApprove={handleApprove} isAdmin={isAdmin} />
            </Grid>
          ))}
        </Grid>
      )}

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={() => setSnack(s => ({ ...s, open: false }))}>
        <Alert severity={snack.severity} onClose={() => setSnack(s => ({ ...s, open: false }))}>{snack.message}</Alert>
      </Snackbar>
    </Container>
  );
}