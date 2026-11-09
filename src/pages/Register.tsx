import { useState } from 'react'
import type { FormEvent } from 'react'
import {
  Box,
  Button,
  Link,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material'

export function Register() {
  const [sent, setSent] = useState(false)
  const [title, setTitle] = useState('Ms')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  if (sent) {
    return (
      <Box
        sx={{
          minHeight: '100%',
          display: 'grid',
          placeItems: 'center',
          background:
            'linear-gradient(160deg, #0A6E7A 0%, #0D9AA8 45%, #E8F4F6 45%, #F7F8F9 100%)',
          px: 2,
          py: 6,
        }}
      >
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 420,
            p: 4,
            textAlign: 'center',
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            Email Sent!
          </Typography>
          <Typography sx={{ color: 'text.secondary', mb: 3 }}>
            Check your email to find your Compass account details. You may wish
            to store these details somewhere safe.
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 2 }}>
            Sample only - no email was sent.
          </Typography>
          <Button variant="contained" onClick={() => setSent(false)}>
            Proceed to login
          </Button>
        </Paper>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        minHeight: '100%',
        display: 'grid',
        placeItems: 'center',
        background:
          'linear-gradient(160deg, #0A6E7A 0%, #0D9AA8 42%, #E8F4F6 42%, #F7F8F9 100%)',
        px: 2,
        py: 6,
      }}
    >
      <Paper
        elevation={0}
        component="form"
        onSubmit={onSubmit}
        aria-label="Registration Window"
        sx={{
          width: '100%',
          maxWidth: 420,
          p: { xs: 3, sm: 4 },
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 1 }}>
          <Box
            component="img"
            src="/compass.svg"
            alt="Compass"
            sx={{ width: 56, height: 56, mb: 1.5 }}
          />
          <Typography variant="h4" sx={{ mb: 0.75 }}>
            Enrolment Portal
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Create your parent/guardian account to begin your student&apos;s
            enrolment application
          </Typography>
        </Box>

        <TextField
          select
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          fullWidth
          size="small"
        >
          {['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Mx'].map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="First name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          fullWidth
          size="small"
        />
        <TextField
          label="Last name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          fullWidth
          size="small"
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          fullWidth
          size="small"
        />

        <Button type="submit" variant="contained" size="large" fullWidth>
          Register
        </Button>

        <Typography variant="body2" sx={{ textAlign: 'center' }}>
          Already have an account?{' '}
          <Link href="#" underline="hover" onClick={(e) => e.preventDefault()}>
            Sign in
          </Link>
        </Typography>
      </Paper>
    </Box>
  )
}
