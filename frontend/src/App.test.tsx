import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders appointment booking form', () => {
  render(<App />);
  const heading = screen.getByText(/book an appointment/i);
  expect(heading).toBeInTheDocument();
});
