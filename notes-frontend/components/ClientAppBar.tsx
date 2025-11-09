'use client';
import React from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
  Tooltip
} from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import NoteIcon from '@mui/icons-material/Note';
import PersonIcon from '@mui/icons-material/Person';
import { FirebaseOptions } from 'firebase/app';

export default function ClientAppBar() {
  const [user, setUser] = React.useState<any>(null);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  React.useEffect(() => {
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
        const mod = await import('../lib/firebaseClient');
        try { mod.initFirebase(firebaseConfig); } catch (e) { /* already initialized */ }
        if (typeof mod.onAuthChanged === 'function') {
          unsub = mod.onAuthChanged((u: any) => setUser(u));
        } else {
          const cur = mod.auth?.().currentUser;
          setUser(cur ?? null);
        }
      } catch (err) {
        // ignore init errors on server rendering / dev
      }
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  function openMenu(e: React.MouseEvent<HTMLElement>) { setAnchorEl(e.currentTarget); }
  function closeMenu() { setAnchorEl(null); }

  async function handleSignIn() {
    const mod = await import('../lib/firebaseClient');
    if (typeof mod.signInWithGooglePopup === 'function') await mod.signInWithGooglePopup();
  }

  async function handleSignOut() {
    const mod = await import('../lib/firebaseClient');
    if (typeof mod.signOut === 'function') await mod.signOut();
    setUser(null);
    closeMenu();
  }

  return (
    <AppBar position="sticky" color="primary" sx={{ mb: 3 }}>
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
            <NoteIcon sx={{ fontSize: 28 }} />
            <Typography
              variant="h6"
              component={Link}
              href="/"
              sx={{ color: 'inherit', textDecoration: 'none', fontWeight: 600 }}
            >
              Notes Share
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Button component={Link} href="/notes" color="inherit">Browse</Button>
            <Button component={Link} href="/upload" color="inherit" startIcon={<UploadFileIcon />}>Upload</Button>
            <Button component={Link} href="/my-notes" color="inherit">My Notes</Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user ? (
              <>
                <Tooltip title={user.email || 'Signed in'}>
                  <IconButton onClick={openMenu} size="small" sx={{ p: 0.5 }}>
                    <Badge color="secondary" variant="dot" invisible={false}>
                      <Avatar src={user.photoURL ?? undefined} alt={user.displayName ?? undefined}>
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : <PersonIcon />}
                      </Avatar>
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={closeMenu}>
                  <MenuItem disabled>
                    <Typography variant="body2">{user.displayName ?? user.email}</Typography>
                  </MenuItem>
                  <MenuItem component={Link} href="/whoami" onClick={closeMenu}>Profile</MenuItem>
                  <MenuItem onClick={handleSignOut} sx={{ color: 'error.main' }}>
                    <LogoutIcon sx={{ mr: 1 }} /> Sign out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Button color="inherit" startIcon={<LoginIcon />} onClick={handleSignIn}>Sign in</Button>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}