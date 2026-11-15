// Turns an axios error from the Nest API into a message a person can act on
export function getErrorMessage(err, messages = {}) {
  if (!err.response) return 'Could not reach the library server. Is the API running?';

  const { status, data } = err.response;

  // Nest's ValidationPipe answers 400 with { message: ['email must be an email', ...] }
  if (status === 400 && Array.isArray(data?.message)) return data.message.join('. ') + '.';

  return messages[status] ?? data?.message ?? 'Something went wrong. Please try again.';
}
