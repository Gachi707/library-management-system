import { useState } from 'react';

// A small hardcoded list for now. The real spaces, and conflict checking, arrive with the backend next week.
const SPACES = [
  { id: '1', name: 'Room A', seats: 4 },
  { id: '2', name: 'Room B', seats: 6 },
  { id: '3', name: 'Quiet Study Pod', seats: 1 },
  { id: '4', name: 'Group Study Hall', seats: 12 },
];

const EMPTY_FORM = { spaceId: '', date: '', startTime: '', endTime: '' };

// Today's date as YYYY-MM-DD in the user's own time zone (what <input type="date"> uses)
function todayString() {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

function validate(form) {
  const errors = {};
  if (!form.spaceId) errors.spaceId = 'Choose a study space.';
  if (!form.date) errors.date = 'Choose a date.';
  else if (form.date < todayString()) errors.date = 'The date cannot be in the past.';
  if (!form.startTime) errors.startTime = 'Choose a start time.';
  if (!form.endTime) errors.endTime = 'Choose an end time.';
  else if (form.startTime && form.endTime <= form.startTime) errors.endTime = 'The end time must be after the start time.';
  return errors;
}

function SpaceBookingPage() {
  // Controlled form: one state object holds every field, one handler updates them all
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(null);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    // Next week this will POST the form to the bookings API with the user's JWT.
    // For now the form is complete and valid, so we just show the request back to the user.
    setSubmitted({ ...form, space: SPACES.find((s) => s.id === form.spaceId) });
  };

  const reset = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setSubmitted(null);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-emerald-200 bg-emerald-50 p-6" role="status">
        <h1 className="text-2xl font-bold text-emerald-900">Booking request ready</h1>
        <p className="mt-2 text-emerald-900">
          {submitted.space.name} ({submitted.space.seats} {submitted.space.seats === 1 ? 'seat' : 'seats'}) on{' '}
          {submitted.date}, {submitted.startTime} to {submitted.endTime}.
        </p>
        <p className="mt-2 text-sm text-emerald-800">
          Sending requests to the library arrives next week. Your details are filled in and valid.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg bg-emerald-700 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-800"
        >
          Make another request
        </button>
      </div>
    );
  }

  const field = 'mt-1 w-full rounded-lg border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200';
  const border = (name) => (errors[name] ? 'border-rose-400' : 'border-slate-300');

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold">Book a study space</h1>
      <p className="mt-1 text-slate-600">Pick a space, a day and a time.</p>

      <form onSubmit={handleSubmit} noValidate className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div>
          <label htmlFor="spaceId" className="block text-sm font-medium">
            Study space
          </label>
          <select id="spaceId" name="spaceId" value={form.spaceId} onChange={handleChange} className={`${field} ${border('spaceId')}`}>
            <option value="">Select a study space</option>
            {SPACES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.seats} {s.seats === 1 ? 'seat' : 'seats'})
              </option>
            ))}
          </select>
          {errors.spaceId && <p className="mt-1 text-xs text-rose-700">{errors.spaceId}</p>}
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium">
            Date
          </label>
          <input id="date" name="date" type="date" min={todayString()} value={form.date} onChange={handleChange} className={`${field} ${border('date')}`} />
          {errors.date && <p className="mt-1 text-xs text-rose-700">{errors.date}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startTime" className="block text-sm font-medium">
              Start time
            </label>
            <input id="startTime" name="startTime" type="time" value={form.startTime} onChange={handleChange} className={`${field} ${border('startTime')}`} />
            {errors.startTime && <p className="mt-1 text-xs text-rose-700">{errors.startTime}</p>}
          </div>
          <div>
            <label htmlFor="endTime" className="block text-sm font-medium">
              End time
            </label>
            <input id="endTime" name="endTime" type="time" value={form.endTime} onChange={handleChange} className={`${field} ${border('endTime')}`} />
            {errors.endTime && <p className="mt-1 text-xs text-rose-700">{errors.endTime}</p>}
          </div>
        </div>

        <button type="submit" className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Request Booking
        </button>
      </form>
    </div>
  );
}

export default SpaceBookingPage;
