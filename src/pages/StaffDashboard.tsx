import { useMemo, useState } from 'react'
import {
  Box,
  Button,
  LinearProgress,
  Paper,
  Typography,
} from '@mui/material'
import { SAMPLE_STAFF, STATUS_COLOR } from '../data/sample'
import type { ApplicationStatus, StaffProfile } from '../data/sample'
import { FilterChip } from '../components/FilterChip'
import { StatusTag } from '../components/StatusTag'

function subtitle(p: StaffProfile) {
  return [p.year, p.term, p.schoolName].filter(Boolean).join(' · ')
}

function ProfileTile({
  profile,
  onComplete,
}: {
  profile: StaffProfile
  onComplete: () => void
}) {
  const isDraft = profile.status === 'APPLICATIONDRAFT'
  const border = STATUS_COLOR[profile.status].border

  return (
    <Box
      sx={{
        width: { xs: '100%', md: '50%' },
        boxSizing: 'border-box',
        borderLeft: isDraft ? 'none' : `4px solid ${border}`,
        p: { xs: 2, md: '1rem 1.25rem' },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="h4">
            {profile.firstName} {profile.lastName}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', pt: 0.5 }}
          >
            {subtitle(profile)}
          </Typography>
          {isDraft ? (
            <>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  color: 'text.secondary',
                  pt: 2,
                  pb: 0.75,
                }}
              >
                Student profile · {profile.percentageComplete}% complete
              </Typography>
              <LinearProgress
                variant="determinate"
                value={profile.percentageComplete}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  bgcolor: '#E5E5E5',
                  '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' },
                }}
              />
            </>
          ) : (
            <Box sx={{ pt: 1 }}>
              <StatusTag status={profile.status} />
            </Box>
          )}
        </Box>
        {isDraft && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: { xs: 'center', sm: 'flex-end' },
              flex: 1,
            }}
          >
            <Button variant="text" color="primary" onClick={onComplete}>
              Complete details
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  )
}

export function StaffDashboard() {
  const { preferredName, brandColor, stripeGradientEnd, profiles } =
    SAMPLE_STAFF
  const [filters, setFilters] = useState<ApplicationStatus[]>([])

  const draftCount = profiles.filter(
    (p) => p.status === 'APPLICATIONDRAFT',
  ).length

  const filtered = useMemo(() => {
    const drafts = profiles.filter((p) => p.status === 'APPLICATIONDRAFT')
    const others = profiles.filter((p) => p.status !== 'APPLICATIONDRAFT')
    const ordered = [...drafts, ...others]
    if (!filters.length) return ordered
    return ordered.filter((p) => filters.includes(p.status))
  }, [filters, profiles])

  const statuses = Array.from(
    new Set(profiles.map((p) => p.status)),
  ) as ApplicationStatus[]

  const toggle = (status: ApplicationStatus) => {
    setFilters((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100%',
        bgcolor: '#F2F4F5',
        borderTop: {
          xs: `9.5rem solid ${brandColor}`,
          md: `12.3125rem solid ${brandColor}`,
        },
        borderImage: `linear-gradient(317.46deg, ${brandColor} 24.84%, ${stripeGradientEnd} 79.69%) 1`,
      }}
    >
      <Box
        sx={{
          mt: { xs: '-9.5rem', md: '-12.3125rem' },
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            px: { xs: 2, md: 6 },
            pt: { xs: 2, md: 4.5 },
            pb: 1,
            color: '#fff',
            textAlign: { xs: 'center', md: 'left' },
          }}
        >
          <Typography
            variant="h3"
            sx={{ color: '#fff', pb: 0.5, fontSize: { xs: '1.5rem', md: '1.75rem' } }}
          >
            Welcome to Enrolments, {preferredName}!
          </Typography>
          <Typography
            sx={{
              color: '#fff',
              fontSize: '1.25rem',
              lineHeight: 1.5,
              minHeight: '2rem',
            }}
          >
            {draftCount > 0
              ? `You have ${draftCount} incomplete student profile${draftCount === 1 ? '' : 's'}.`
              : "You are all done. There's nothing left to do."}
          </Typography>
        </Box>

        <Box sx={{ px: { xs: 2, md: 6 }, pb: 6, pt: 2 }}>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              overflow: 'hidden',
              border: '1px solid #E4E4E4',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1,
                px: 2.5,
                pt: 2.5,
                pb: 1,
              }}
            >
              <Typography variant="h4">Student profiles</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
                <FilterChip
                  status="ALL"
                  active={filters.length === 0}
                  count={profiles.length}
                  onClick={() => setFilters([])}
                />
                {statuses.map((status) => (
                  <FilterChip
                    key={status}
                    status={status}
                    active={filters.includes(status)}
                    count={profiles.filter((p) => p.status === status).length}
                    onClick={() => toggle(status)}
                  />
                ))}
              </Box>
            </Box>

            {filtered.length === 0 ? (
              <Box sx={{ py: 10, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="h4" sx={{ mb: 1 }}>
                  Student Profiles
                </Typography>
                <Typography>
                  You currently have no student profiles.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', pb: 1 }}>
                {filtered.map((profile) => (
                  <ProfileTile
                    key={profile.id}
                    profile={profile}
                    onComplete={() => {
                      window.alert(
                        `Sample only: would open complete details for ${profile.firstName} ${profile.lastName}`,
                      )
                    }}
                  />
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>
    </Box>
  )
}
