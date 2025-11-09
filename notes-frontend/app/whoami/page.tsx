'use client';
import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, CircularProgress } from '@mui/material';
import type { FirebaseOptions } from 'firebase/app';

export default function WhoamiPage() {
  const [uid, setUid] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const firebaseConfig: FirebaseOptions = {
          apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
          authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '',
          projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
          storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
          appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '',
        };

        const mod = await import('../../lib/firebaseClient');
        try { mod.initFirebase(firebaseConfig); } catch (e) { /* already initialized */ }

        // onAuthChanged should call back with firebase.User | null
        if (typeof mod.onAuthChanged === 'function') {
          unsub = mod.onAuthChanged((user: any) => {
            setUid(user?.uid ?? null);
            setEmail(user?.email ?? null);
            setLoading(false);
          });
        } else {
          // fallback: try reading current user once
          const current = mod.auth?.().currentUser;
          setUid(current?.uid ?? null);
          setEmail(current?.email ?? null);
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    })();

    return () => { if (unsub) unsub(); };
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h5" gutterBottom>Whoami</Typography>
      {loading ? (
        <Box display="flex" alignItems="center"><CircularProgress size={20} sx={{ mr: 2 }} /> Loading...</Box>
      ) : (
        <>
          <Typography>UID: {uid ?? 'Not signed in'}</Typography>
          <Typography>Email: {email ?? '-'}</Typography>
        </>
      )}
    </Container>
  );
}