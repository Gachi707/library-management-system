import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseToken } from '../context/AuthContext.jsx';
import { apiError, fakeToken, mockApi, networkError, renderApp } from '../test/helpers.jsx';

afterEach(() => vi.restoreAllMocks());

const fillLogin = async (user, email = 'ann@library.test', password = 'Secret123!') => {
  await user.type(screen.getByLabelText('Email'), email);
  await user.type(screen.getByLabelText('Password'), password);
};

describe('parseToken', () => {
  it('reads the role and id from a JWT', () => {
    expect(parseToken(fakeToken({ sub: 9, role: 'LIBRARIAN' }))).toMatchObject({ sub: 9, role: 'LIBRARIAN' });
  });
  it('returns null for garbage', () => {
    expect(parseToken('not-a-token')).toBeNull();
    expect(parseToken(undefined)).toBeNull();
  });
});

describe('Login page (controlled form posting to /auth/login)', () => {
  it('the inputs are controlled: they show exactly what is typed', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    await user.type(screen.getByLabelText('Email'), 'ann@library.test');
    expect(screen.getByLabelText('Email')).toHaveValue('ann@library.test');
    expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
  });

  it('the submit button stays disabled until both fields are filled', async () => {
    const user = userEvent.setup();
    renderApp('/login');
    expect(screen.getByRole('button', { name: 'Log in' })).toBeDisabled();
    await fillLogin(user);
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled();
  });

  it('posts the form to /auth/login, stores the returned JWT in localStorage and goes home', async () => {
    const user = userEvent.setup();
    mockApi();
    const token = fakeToken();
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { access_token: token } });
    renderApp('/login');
    await fillLogin(user);
    await user.click(screen.getByRole('button', { name: 'Log in' }));

    expect(post).toHaveBeenCalledTimes(1);
    expect(post.mock.calls[0][0]).toMatch(/\/auth\/login$/);
    expect(post.mock.calls[0][1]).toEqual({ email: 'ann@library.test', password: 'Secret123!' });
    await waitFor(() => expect(localStorage.getItem('token')).toBe(token));
    expect(await screen.findByText('Showing 4 books')).toBeInTheDocument(); // landed on the catalog
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('does not reload the page: e.preventDefault() is called', async () => {
    const user = userEvent.setup();
    vi.spyOn(axios, 'post').mockRejectedValue(apiError(401, 'Invalid credentials'));
    renderApp('/login');
    await fillLogin(user);
    // React handles events at the root, so look at the event once it has bubbled up to the document
    let defaultPrevented = null;
    const record = (e) => {
      defaultPrevented = e.defaultPrevented;
    };
    document.addEventListener('submit', record);
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    document.removeEventListener('submit', record);
    expect(defaultPrevented).toBe(true);
    await screen.findByRole('alert'); // let the request settle before the test ends
  });

  it('wrong password (401): shows a clear message and stores nothing', async () => {
    const user = userEvent.setup();
    vi.spyOn(axios, 'post').mockRejectedValue(apiError(401, 'Invalid credentials'));
    renderApp('/login');
    await fillLogin(user, 'ann@library.test', 'wrong-password');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.');
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByRole('button', { name: 'Log in' })).toBeEnabled(); // can try again
  });

  it('API down: says so', async () => {
    const user = userEvent.setup();
    vi.spyOn(axios, 'post').mockRejectedValue(networkError());
    renderApp('/login');
    await fillLogin(user);
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not reach the library server');
  });

  it('validation errors (400) from the API are shown', async () => {
    const user = userEvent.setup();
    vi.spyOn(axios, 'post').mockRejectedValue(apiError(400, ['email must be an email']));
    renderApp('/login');
    await fillLogin(user, 'bad', 'x');
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('email must be an email.');
  });
});

describe('Register page (controlled form posting to /auth/register)', () => {
  const fill = async (user, { email = 'new@library.test', password = 'Secret123!', confirm = 'Secret123!' } = {}) => {
    await user.type(screen.getByLabelText('Email'), email);
    await user.type(screen.getByLabelText('Password'), password);
    await user.type(screen.getByLabelText('Confirm password'), confirm);
  };

  it('posts only email and password, stores the returned JWT and signs the user in', async () => {
    const user = userEvent.setup();
    mockApi();
    const token = fakeToken({ sub: 21 });
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { access_token: token } });
    renderApp('/register');
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));

    expect(post.mock.calls[0][0]).toMatch(/\/auth\/register$/);
    expect(post.mock.calls[0][1]).toEqual({ email: 'new@library.test', password: 'Secret123!' }); // no confirmPassword
    await waitFor(() => expect(localStorage.getItem('token')).toBe(token));
    expect(await screen.findByText('Showing 4 books')).toBeInTheDocument();
  });

  it('mismatched passwords are caught in the browser: no request is sent', async () => {
    const user = userEvent.setup();
    const post = vi.spyOn(axios, 'post');
    renderApp('/register');
    await fill(user, { confirm: 'Different123!' });
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The two passwords do not match.');
    expect(post).not.toHaveBeenCalled();
  });

  it('a password under 8 characters is caught in the browser', async () => {
    const user = userEvent.setup();
    const post = vi.spyOn(axios, 'post');
    renderApp('/register');
    await fill(user, { password: 'short', confirm: 'short' });
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('at least 8 characters');
    expect(post).not.toHaveBeenCalled();
  });

  it('email already registered (409): friendly message', async () => {
    const user = userEvent.setup();
    vi.spyOn(axios, 'post').mockRejectedValue(apiError(409, 'Email already registered'));
    renderApp('/register');
    await fill(user);
    await user.click(screen.getByRole('button', { name: 'Create account' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('already registered');
    expect(localStorage.getItem('token')).toBeNull();
  });
});

describe('ProtectedRoute (/book-space)', () => {
  it('no token: redirects to /login', async () => {
    renderApp('/book-space');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Book a study space' })).not.toBeInTheDocument();
  });

  it('with a token: shows the booking form', async () => {
    localStorage.setItem('token', fakeToken());
    renderApp('/book-space');
    expect(await screen.findByRole('heading', { name: 'Book a study space' })).toBeInTheDocument();
  });

  it('after logging in, sends the user back to the page they wanted', async () => {
    const user = userEvent.setup();
    vi.spyOn(axios, 'post').mockResolvedValue({ data: { access_token: fakeToken() } });
    renderApp('/book-space'); // redirected to /login first
    await screen.findByRole('heading', { name: 'Log in' });
    await fillLogin(user);
    await user.click(screen.getByRole('button', { name: 'Log in' }));
    expect(await screen.findByRole('heading', { name: 'Book a study space' })).toBeInTheDocument();
  });

  it('an expired token counts as logged out, and is removed', async () => {
    localStorage.setItem('token', fakeToken({ exp: Math.floor(Date.now() / 1000) - 60 }));
    renderApp('/book-space');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBeNull();
  });

  it('a malformed token counts as logged out', async () => {
    localStorage.setItem('token', 'garbage');
    renderApp('/book-space');
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });

  it('a signed-in user visiting /login is sent away from it', async () => {
    mockApi();
    localStorage.setItem('token', fakeToken());
    renderApp('/login');
    expect(await screen.findByText('Showing 4 books')).toBeInTheDocument();
  });
});

describe('Navbar', () => {
  it('logged out: shows Log in and Sign up', async () => {
    mockApi();
    renderApp('/');
    await screen.findByText('Showing 4 books');
    expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Sign up' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Log out' })).not.toBeInTheDocument();
  });

  it('logged in: shows the role and Log out, which clears the token and goes home', async () => {
    const user = userEvent.setup();
    mockApi();
    localStorage.setItem('token', fakeToken({ role: 'LIBRARIAN' }));
    renderApp('/');
    await screen.findByText('Showing 4 books');
    expect(screen.getByText('Librarian')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Log out' }));
    expect(localStorage.getItem('token')).toBeNull();
    expect(screen.getByRole('link', { name: 'Log in' })).toBeInTheDocument();
  });

  it('stays signed in after a refresh', async () => {
    mockApi();
    localStorage.setItem('token', fakeToken());
    const first = renderApp('/');
    await screen.findByText('Showing 4 books');
    first.unmount();
    renderApp('/');
    await screen.findByText('Showing 4 books');
    expect(screen.getByRole('button', { name: 'Log out' })).toBeInTheDocument();
  });

  it('logging out of a protected page sends the user back to login when they return', async () => {
    const user = userEvent.setup();
    localStorage.setItem('token', fakeToken());
    renderApp('/book-space');
    await screen.findByRole('heading', { name: 'Book a study space' });
    await user.click(screen.getByRole('button', { name: 'Log out' }));
    await user.click(screen.getByRole('link', { name: 'Book a space' }));
    expect(await screen.findByRole('heading', { name: 'Log in' })).toBeInTheDocument();
  });
});
