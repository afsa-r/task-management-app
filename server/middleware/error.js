export const notFound = (req, res) =>
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });

export const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message || 'Server error';
  if (err.name === 'ValidationError') { status = 400; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  if (err.name === 'CastError') { status = 400; message = 'Invalid ID format.'; }
  if (err.code === 11000) { status = 409; message = 'An account with this email already exists.'; }
  if (status === 500) { console.error(err); message = 'Something went wrong on the server.'; }
  res.status(status).json({ message });
};
