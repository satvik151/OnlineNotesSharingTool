'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Box,
  Button
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import { auth } from '../../lib/firebaseClient';

type Note = {
  _id: string;
  subject: string;
  semester: string;
  branch: string;
  approved: boolean;
  createdAt: string;
};

export default function MyNotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMyNotes();
  }, []);

  const fetchMyNotes = async () => {
    try {
      const token = await auth().currentUser?.getIdToken();
      if (!token) {
        setError('Please sign in to view your notes');
        return;
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-notes`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch your notes');
      const data = await res.json();
      setNotes(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" py={4}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container>
      <Typography variant="h4" gutterBottom>My Uploaded Notes</Typography>
      
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Subject</TableCell>
            <TableCell>Branch</TableCell>
            <TableCell>Semester</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {notes.map(note => (
            <TableRow key={note._id}>
              <TableCell>{note.subject}</TableCell>
              <TableCell>{note.branch}</TableCell>
              <TableCell>{note.semester}</TableCell>
              <TableCell>
                {note.approved ? (
                  <Chip label="Approved" color="success" />
                ) : (
                  <Chip label="Pending" color="warning" />
                )}
              </TableCell>
              <TableCell>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={() => {/* Add download handler */}}
                >
                  Download
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {error && (
        <Typography color="error" sx={{ mt: 2 }}>
          {error}
        </Typography>
      )}
    </Container>
  );
}