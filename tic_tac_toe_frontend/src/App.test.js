import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe title', () => {
  render(<App />);
  const title = screen.getByRole('heading', { name: /tic tac toe/i });
  expect(title).toBeInTheDocument();
});

test('renders restart button and 3x3 grid', () => {
  render(<App />);
  const restartBtn = screen.getByRole('button', { name: /restart/i });
  expect(restartBtn).toBeInTheDocument();

  // There should be 9 clickable cells (buttons)
  const cells = screen.getAllByRole('button', { name: /cell/i });
  expect(cells).toHaveLength(9);
});
