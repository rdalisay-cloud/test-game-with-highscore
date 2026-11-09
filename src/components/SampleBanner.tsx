import { Box, Typography } from '@mui/material'

export function SampleBanner() {
  return (
    <Box
      sx={{
        bgcolor: '#FFF8E6',
        borderBottom: '1px solid #F0D78C',
        px: 2,
        py: 0.75,
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" sx={{ color: '#7A5A00', fontWeight: 500 }}>
        UI-only replica of Compass Enrolments · sample data · not connected to a
        school
      </Typography>
    </Box>
  )
}
