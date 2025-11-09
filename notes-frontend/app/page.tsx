'use client';

import React from 'react';
import { Typography, Box, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      gap: 4, 
      py: 8 
    }}>
      <Typography variant="h2" component="h1" align="center">
        Welcome to Notes Sharing Platform
      </Typography>
      
      <Typography variant="h5" color="text.secondary" align="center">
        Browse our collection of notes or upload your own
      </Typography>

      <Button 
        variant="contained" 
        size="large" 
        onClick={() => router.push('/notes')}
      >
        Browse Notes
      </Button>
    </Box>
  );
}