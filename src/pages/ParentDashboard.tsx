import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import { SAMPLE_PARENT } from '../data/sample'
import { StatusTag } from '../components/StatusTag'

export function ParentDashboard() {
  const { preferredName, students, applications } = SAMPLE_PARENT
  const complete = students.filter((s) => s.percentageComplete === 100)
  const incomplete = students.filter((s) => s.percentageComplete < 100)
  const offeredCount = applications.filter((a) => a.hasOffered).length

  return (
    <Box sx={{ minHeight: '100%', bgcolor: '#F7F8F9', pb: 6 }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'stretch', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 1,
          px: { xs: 2, md: 4.5 },
          pt: { xs: 2, md: 4.5 },
        }}
      >
        <Typography
          variant="h3"
          sx={{
            textAlign: { xs: 'center', md: 'left' },
            fontSize: { xs: '1.5rem', md: '1.75rem' },
          }}
        >
          Welcome to Enrolments, {preferredName}!
        </Typography>
      </Box>

      {offeredCount > 0 && (
        <Box sx={{ px: { xs: 2, md: 4.5 }, pt: 2 }}>
          <Paper
            elevation={0}
            sx={{
              borderTop: '3px solid #2B9CDB',
              px: 2,
              py: 1.5,
              bgcolor: '#F3F9FD',
            }}
          >
            <Typography variant="body2" sx={{ color: '#0B5CAD', fontWeight: 600 }}>
              You have {offeredCount} enrolment offer
              {offeredCount === 1 ? '' : 's'} waiting for a response.
            </Typography>
          </Paper>
        </Box>
      )}

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
          px: { xs: 2, md: 4.5 },
          pt: 3,
        }}
      >
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Paper
            elevation={0}
            sx={{ border: '1px solid #E4E4E4', borderRadius: 2, p: 2.5 }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h4">Student profiles</Typography>
              <Button startIcon={<AddIcon />} size="small">
                Create profile
              </Button>
            </Box>
            {complete.map((s) => (
              <Box
                key={s.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  py: 1.5,
                  borderTop: '1px solid #EEE',
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>
                  {s.firstName} {s.lastName}
                </Typography>
                <Button size="small" variant="text">
                  Edit
                </Button>
              </Box>
            ))}
          </Paper>

          {incomplete.length > 0 && (
            <Paper
              elevation={0}
              sx={{ border: '1px solid #E4E4E4', borderRadius: 2, p: 2.5 }}
            >
              <Typography variant="h4" sx={{ mb: 2 }}>
                Incomplete profiles
              </Typography>
              {incomplete.map((s) => (
                <Box
                  key={s.id}
                  sx={{
                    py: 1.5,
                    borderTop: '1px solid #EEE',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>
                      {s.firstName} {s.lastName}
                    </Typography>
                    <Button size="small">Continue</Button>
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: 'text.secondary', display: 'block', mb: 0.75 }}
                  >
                    {s.percentageComplete}% complete
                  </Typography>
                  <LinearProgress
                    variant="determinate"
                    value={s.percentageComplete}
                    sx={{
                      height: 6,
                      borderRadius: 3,
                      bgcolor: '#E5E5E5',
                      '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' },
                    }}
                  />
                </Box>
              ))}
            </Paper>
          )}
        </Box>

        <Box sx={{ flex: 1.2 }}>
          <Paper
            elevation={0}
            sx={{ border: '1px solid #E4E4E4', borderRadius: 2, p: 2.5 }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2,
              }}
            >
              <Typography variant="h4">Applications</Typography>
              <Button startIcon={<AddIcon />} size="small">
                New application
              </Button>
            </Box>
            {applications.map((app) => (
              <Box
                key={app.id}
                sx={{
                  py: 2,
                  borderTop: '1px solid #EEE',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 2,
                    flexWrap: 'wrap',
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h4" sx={{ fontSize: '1.1rem' }}>
                      {app.student.firstName} {app.student.lastName}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', pt: 0.5 }}
                    >
                      {[app.year, app.term].filter(Boolean).join(' · ')}
                    </Typography>
                    <Box sx={{ pt: 1 }}>
                      <StatusTag status={app.status} />
                    </Box>
                    <Box sx={{ pt: 1.5 }}>
                      {app.schools.map((school) => (
                        <Typography
                          key={`${school.name}-${school.suburb}`}
                          variant="body2"
                          sx={{ color: 'text.secondary', py: 0.25 }}
                        >
                          {school.name} · {school.suburb}
                        </Typography>
                      ))}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {app.hasOffered && (
                      <Button variant="contained" size="small">
                        View offer
                      </Button>
                    )}
                    <Button variant="text" size="small">
                      Edit
                    </Button>
                  </Box>
                </Box>
              </Box>
            ))}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
