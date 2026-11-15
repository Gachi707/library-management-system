import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { fakeToken, renderApp } from '../test/helpers.jsx';

const dateOffset = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const open = () => {
  localStorage.setItem('token', fakeToken());
  return renderApp('/book-space');
};

// <input type="date"/"time"> are filled with fireEvent-style changes in tests
const setValue = async (user, label, value) => {
  const input = screen.getByLabelText(label);
  await user.clear(input);
  await user.type(input, value);
};

describe('Space booking form', () => {
  it('has a study space dropdown with a hardcoded list, plus date, start and end time inputs', async () => {
    open();
    const select = await screen.findByLabelText('Study space');
    const options = within(select).getAllByRole('option').map((o) => o.textContent);
    expect(options[0]).toBe('Select a study space');
    expect(options).toContain('Room A (4 seats)');
    expect(options).toContain('Quiet Study Pod (1 seat)');
    expect(screen.getByLabelText('Date')).toHaveAttribute('type', 'date');
    expect(screen.getByLabelText('Start time')).toHaveAttribute('type', 'time');
    expect(screen.getByLabelText('End time')).toHaveAttribute('type', 'time');
  });

  it('is a controlled form: the dropdown shows the chosen space', async () => {
    const user = userEvent.setup();
    open();
    const select = await screen.findByLabelText('Study space');
    await user.selectOptions(select, 'Room A (4 seats)');
    expect(select).toHaveValue('1');
  });

  it('the date picker will not offer days in the past', async () => {
    open();
    const date = await screen.findByLabelText('Date');
    expect(date).toHaveAttribute('min', dateOffset(0));
  });

  it('an empty form shows an error for every field and does not submit', async () => {
    const user = userEvent.setup();
    open();
    await user.click(await screen.findByRole('button', { name: 'Request Booking' }));
    expect(screen.getByText('Choose a study space.')).toBeInTheDocument();
    expect(screen.getByText('Choose a date.')).toBeInTheDocument();
    expect(screen.getByText('Choose a start time.')).toBeInTheDocument();
    expect(screen.getByText('Choose an end time.')).toBeInTheDocument();
    expect(screen.queryByText('Booking request ready')).not.toBeInTheDocument();
  });

  it('end time must be after the start time', async () => {
    const user = userEvent.setup();
    open();
    await user.selectOptions(await screen.findByLabelText('Study space'), 'Room B (6 seats)');
    await setValue(user, 'Date', dateOffset(1));
    await setValue(user, 'Start time', '14:00');
    await setValue(user, 'End time', '13:00');
    await user.click(screen.getByRole('button', { name: 'Request Booking' }));
    expect(screen.getByText('The end time must be after the start time.')).toBeInTheDocument();
  });

  it('a date in the past is rejected', async () => {
    const user = userEvent.setup();
    open();
    await user.selectOptions(await screen.findByLabelText('Study space'), 'Room A (4 seats)');
    await setValue(user, 'Date', dateOffset(-3));
    await setValue(user, 'Start time', '09:00');
    await setValue(user, 'End time', '10:00');
    await user.click(screen.getByRole('button', { name: 'Request Booking' }));
    expect(screen.getByText('The date cannot be in the past.')).toBeInTheDocument();
  });

  it('a valid form shows the request back to the user, and can be reset', async () => {
    const user = userEvent.setup();
    open();
    await user.selectOptions(await screen.findByLabelText('Study space'), 'Group Study Hall (12 seats)');
    await setValue(user, 'Date', dateOffset(2));
    await setValue(user, 'Start time', '09:30');
    await setValue(user, 'End time', '11:00');
    await user.click(screen.getByRole('button', { name: 'Request Booking' }));

    expect(await screen.findByRole('heading', { name: 'Booking request ready' })).toBeInTheDocument();
    expect(screen.getByText(/Group Study Hall \(12 seats\)/)).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`${dateOffset(2)}, 09:30 to 11:00`))).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Make another request' }));
    expect(screen.getByLabelText('Study space')).toHaveValue('');
  });

  it('typing an end time equal to the start time is also rejected', async () => {
    const user = userEvent.setup();
    open();
    await user.selectOptions(await screen.findByLabelText('Study space'), 'Room A (4 seats)');
    await setValue(user, 'Date', dateOffset(1));
    await setValue(user, 'Start time', '10:00');
    await setValue(user, 'End time', '10:00');
    await user.click(screen.getByRole('button', { name: 'Request Booking' }));
    expect(screen.getByText('The end time must be after the start time.')).toBeInTheDocument();
  });
});
