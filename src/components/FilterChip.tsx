import { Box } from '@mui/material'
import FilterListIcon from '@mui/icons-material/FilterList'
import {
  STATUS_COLOR,
  STATUS_LABEL,
} from '../data/sample'
import type { ApplicationStatus } from '../data/sample'

interface Props {
  status: ApplicationStatus | 'ALL'
  active: boolean
  count: number
  onClick: () => void
}

export function FilterChip({ status, active, count, onClick }: Props) {
  const label = status === 'ALL' ? 'All profiles' : STATUS_LABEL[status]
  const color =
    status === 'ALL'
      ? { bg: '#0A6E7A', fg: '#fff' }
      : STATUS_COLOR[status]

  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.75,
        border: active ? `1.5px solid ${color.bg}` : '1px solid #D0D0D0',
        bgcolor: active ? `${color.bg}18` : '#fff',
        borderRadius: '20px',
        px: 1.5,
        py: 0.5,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: '0.8125rem',
        fontWeight: 600,
        color: '#333',
        mr: 1,
        mb: 1,
        '&:hover': { bgcolor: `${color.bg}22` },
      }}
    >
      <FilterListIcon sx={{ fontSize: 16, color: color.bg }} />
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          bgcolor: color.bg,
        }}
      />
      {label}
      <Box
        component="span"
        sx={{
          bgcolor: active ? color.bg : '#EEE',
          color: active ? '#fff' : '#555',
          borderRadius: '10px',
          px: 0.75,
          minWidth: 20,
          textAlign: 'center',
          fontSize: '0.75rem',
        }}
      >
        {count}
      </Box>
    </Box>
  )
}
