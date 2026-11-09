import { useState } from 'react'
import { Box, Tab, Tabs } from '@mui/material'
import { SampleBanner } from './components/SampleBanner'
import { StaffDashboard } from './pages/StaffDashboard'
import { ParentDashboard } from './pages/ParentDashboard'
import { Register } from './pages/Register'

type View = 'staff' | 'parent' | 'register'

export default function App() {
  const [view, setView] = useState<View>('staff')

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <SampleBanner />
      <Box
        sx={{
          bgcolor: '#fff',
          borderBottom: '1px solid #E4E4E4',
          px: { xs: 1, md: 2 },
        }}
      >
        <Tabs
          value={view}
          onChange={(_, v: View) => setView(v)}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab value="staff" label="Staff dashboard" />
          <Tab value="parent" label="Parent dashboard" />
          <Tab value="register" label="Self registration" />
        </Tabs>
      </Box>
      <Box sx={{ flex: 1 }}>
        {view === 'staff' && <StaffDashboard />}
        {view === 'parent' && <ParentDashboard />}
        {view === 'register' && <Register />}
      </Box>
    </Box>
  )
}
