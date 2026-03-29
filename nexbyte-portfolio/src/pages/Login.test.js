import React, { act } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { AuthContext } from '../context/AuthContext';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ token: 'test-token', role: 'intern' })
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('fetches profile and routes intern after login', async () => {
    const fetchUser = jest.fn(() => Promise.resolve());
    const setIsAdmin = jest.fn();
    const setIsClient = jest.fn();
    const setIsIntern = jest.fn();

    render(
      <AuthContext.Provider value={{ setIsAdmin, setIsClient, setIsIntern, fetchUser }}>
        <Login />
      </AuthContext.Provider>
    );

    await act(async () => {
      await userEvent.type(screen.getByLabelText(/email/i), 'intern@example.com');
      await userEvent.type(screen.getByLabelText(/password/i), 'password123');
      await userEvent.click(screen.getByRole('button', { name: /login/i }));
    });

    await waitFor(() => expect(fetchUser).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/intern-panel'));
  });
});
