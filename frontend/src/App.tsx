import React, { useState } from 'react';
import AppointmentBooking from './components/AppointmentBooking';
import AppointmentManagement from './components/AppointmentManagement';
import { Container, Tabs, Tab, Box, Typography } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

function App() {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Appointment System
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Book new appointments or manage existing ones
        </Typography>
      </Box>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="appointment tabs" centered>
          <Tab label="Book Appointment" {...a11yProps(0)} />
          <Tab label="Manage Appointment" {...a11yProps(1)} />
        </Tabs>
      </Box>
      
      <TabPanel value={value} index={0}>
        <AppointmentBooking />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <AppointmentManagement />
      </TabPanel>
    </Container>
  );
}

export default App;
