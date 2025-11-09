import React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Chip,
  IconButton,
  Stack,
  Tooltip
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import CheckIcon from '@mui/icons-material/Check';
import PersonIcon from '@mui/icons-material/Person';

type Note = {
  _id: string;
  subject?: string;
  semester?: string;
  branch?: string;
  uploaderId?: string;
  approved?: boolean;
};

export default function NoteCard({
  note,
  onDownload,
  onApprove,
  isAdmin
}: {
  note: Note;
  onDownload: (id: string) => void;
  onApprove: (id: string) => void;
  isAdmin: boolean;
}) {
  return (
    <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardHeader
        title={note.subject || 'Untitled'}
        subheader={`${note.branch || '-'} • Semester ${note.semester ?? '-'}`}
      />
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Uploaded by: <strong>{note.uploaderId ?? 'Unknown'}</strong>
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {note.approved ? (
            <Chip label="Approved" color="success" size="small" />
          ) : (
            <Chip label="Pending" color="warning" size="small" />
          )}
        </Stack>
      </CardContent>
      <CardActions>
        <Tooltip title="Download">
          <IconButton size="small" onClick={() => onDownload(note._id)}><DownloadIcon /></IconButton>
        </Tooltip>
        {isAdmin && !note.approved && (
          <Tooltip title="Approve">
            <IconButton size="small" color="primary" onClick={() => onApprove(note._id)}><CheckIcon /></IconButton>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
}