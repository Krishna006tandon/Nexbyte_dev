import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const headingElement = screen.getByRole('heading', {
    name: /Web Development & Digital Solutions/i
  });
  expect(headingElement).toBeInTheDocument();
});
