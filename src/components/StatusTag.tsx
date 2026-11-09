import { Box } from '@mui/material'
import { STATUS_COLOR, STATUS_LABEL } from '../data/sample'
import type { ApplicationStatus } from '../data/sample'

export function StatusTag({ status }: { status: ApplicationStatus }) {
  const colors = STATUS_COLOR[status]
  return (
    <Box
      component="span"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1,
        py: 0.25,
        borderRadius: '4px',
        bgcolor: colors.bg,
        color: colors.fg,
        fontSize: '0.75rem',
        fontWeight: 600,
        lineHeight: 1.5,
        whiteSpace: 'nowrap',
      }}
    >
      {STATUS_LABEL[status]}
    </Box>
  )
}
