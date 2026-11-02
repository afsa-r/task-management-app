export const STATUSES = ['Pending', 'In Progress', 'Completed'];
export const PRIORITIES = ['Low', 'Medium', 'High'];

export const isOverdue = (t) => !!t.dueDate && t.status !== 'Completed' && new Date(t.dueDate) < new Date(new Date().toDateString());
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : 'No due date');
export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
export const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');
