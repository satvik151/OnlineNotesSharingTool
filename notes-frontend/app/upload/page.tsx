'use client';
import React, { useState } from 'react';
import { Box, Button, TextField, MenuItem, Typography, Paper, CircularProgress, Snackbar, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { auth } from '../../lib/firebaseClient';

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({ subject:'', semester:'', branch:'' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setError('Please select a file');
    try {
      setLoading(true);
      const token = await auth().currentUser?.getIdToken();
      if (!token) throw new Error('Sign in to upload');

      const payload = new FormData();
      payload.append('noteFile', file);
      payload.append('subject', formData.subject);
      payload.append('semester', formData.semester);
      payload.append('branch', formData.branch);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/uploadNote`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: payload
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Upload failed: ${res.status} ${txt}`);
      }

      router.push('/notes');
    } catch (err:any) {
      setError(err?.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box component={Paper} sx={{ p:4, maxWidth:680, mx:'auto', mt:4 }}>
      <Typography variant="h5" gutterBottom>Upload Note</Typography>
      <form onSubmit={handleSubmit}>
        <TextField label="Subject" fullWidth required value={formData.subject} onChange={e=>setFormData(s=>({...s,subject:e.target.value}))} sx={{mb:2}} />
        <TextField select label="Semester" fullWidth required value={formData.semester} onChange={e=>setFormData(s=>({...s,semester:e.target.value}))} sx={{mb:2}}>
          {[1,2,3,4,5,6,7,8].map(s=> <MenuItem key={s} value={String(s)}>Semester {s}</MenuItem>)}
        </TextField>
        <TextField select label="Branch" fullWidth required value={formData.branch} onChange={e=>setFormData(s=>({...s,branch:e.target.value}))} sx={{mb:2}}>
          {['CSE','IT','ECE','EEE','MECH'].map(b=> <MenuItem key={b} value={b}>{b}</MenuItem>)}
        </TextField>

        <Button variant="contained" component="label" fullWidth sx={{mb:2}}>
          {file ? file.name : 'Select file'}
          <input type="file" hidden onChange={e=>setFile(e.target.files?.[0]||null)} />
        </Button>

        <Button type="submit" variant="contained" fullWidth disabled={loading}>
          {loading ? <CircularProgress size={20}/> : 'Upload'}
        </Button>
      </form>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={()=>setError('')}>
        <Alert severity="error">{error}</Alert>
      </Snackbar>
    </Box>
  );
}