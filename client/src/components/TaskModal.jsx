import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { taskApi, errorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import { STATUSES, PRIORITIES, toInputDate } from '../utils/format.js';

export default function TaskModal({ task, onClose, onSaved }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: task?.title || '', description: task?.description || '', status: task?.status || 'Pending',
    priority: task?.priority || 'Medium', dueDate: toInputDate(task?.dueDate),
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) return setError('Task title is required.');
    setSaving(true); setError('');
    const payload = { ...form, dueDate: form.dueDate || null };
    try {
      const saved = task ? await taskApi.update(task._id, payload) : await taskApi.create(payload);
      toast.success(task ? 'Task saved.' : 'Task created.');
      onSaved(saved);
    } catch (err) { setError(errorMessage(err)); toast.error(errorMessage(err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form className="modal" role="dialog" aria-modal="true" aria-labelledby="tm-title" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()} noValidate>
        <div className="modal-head">
          <h2 id="tm-title">{task ? 'Edit task' : 'New task'}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        {error && <div className="alert" role="alert">{error}</div>}
        <label>Title
          <input autoFocus value={form.title} onChange={set('title')} maxLength={120} placeholder="e.g. Prepare sprint review" />
        </label>
        <label>Description
          <textarea rows={3} value={form.description} onChange={set('description')} maxLength={1000} placeholder="Add details (optional)" />
        </label>
        <div className="grid-3">
          <label>Status<select value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select></label>
          <label>Priority<select value={form.priority} onChange={set('priority')}>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select></label>
          <label>Due date<input type="date" value={form.dueDate} onChange={set('dueDate')} /></label>
        </div>
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onClose}>Cancel</button>
          <button className="btn primary" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button>
        </div>
      </form>
    </div>
  );
}
