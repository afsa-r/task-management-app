import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, CalendarDays, RotateCcw, ClipboardList } from 'lucide-react';
import { taskApi, errorMessage } from '../services/api.js';
import { useToast } from '../context/ToastContext.jsx';
import Spinner from '../components/Spinner.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { StatusBadge, PriorityBadge } from '../components/Badges.jsx';
import { STATUSES, PRIORITIES, fmtDate, isOverdue } from '../utils/format.js';

const DEFAULTS = { search: '', status: '', priority: '', overdue: false, sortBy: 'createdAt-desc' };

export default function Tasks() {
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const [filters, setFilters] = useState(DEFAULTS);
  const [debounced, setDebounced] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(params.get('new') ? {} : null); // {} = new, task = edit
  const [deleting, setDeleting] = useState(null);
  const [delBusy, setDelBusy] = useState(false);

  useEffect(() => { const t = setTimeout(() => setDebounced(filters.search), 300); return () => clearTimeout(t); }, [filters.search]);

  const load = useCallback(async () => {
    const [sort, order] = filters.sortBy.split('-');
    setLoading(true); setError('');
    try {
      setTasks(await taskApi.list({ search: debounced || undefined, status: filters.status || undefined, priority: filters.priority || undefined, overdue: filters.overdue || undefined, sort, order }));
    } catch (e) { setError(errorMessage(e)); } finally { setLoading(false); }
  }, [debounced, filters.status, filters.priority, filters.overdue, filters.sortBy]);
  useEffect(() => { load(); }, [load]);

  const closeModal = () => { setModal(null); if (params.get('new')) setParams({}); };
  const set = (k) => (e) => setFilters({ ...filters, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const dirty = JSON.stringify(filters) !== JSON.stringify(DEFAULTS);

  const changeStatus = async (t, status) => {
    try { await taskApi.setStatus(t._id, status); toast.success(`Marked as ${status.toLowerCase()}.`); load(); }
    catch (e) { toast.error(errorMessage(e)); }
  };
  const confirmDelete = async () => {
    setDelBusy(true);
    try { await taskApi.remove(deleting._id); toast.success('Task deleted.'); setDeleting(null); load(); }
    catch (e) { toast.error(errorMessage(e)); } finally { setDelBusy(false); }
  };

  return (
    <>
      <div className="page-head"><div><h1>My tasks</h1><p className="muted">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} shown</p></div>
        <button className="btn primary" onClick={() => setModal({})}><Plus size={18} /> New task</button></div>

      <div className="card filters">
        <div className="search"><Search size={16} /><input aria-label="Search tasks by title" placeholder="Search by title" value={filters.search} onChange={set('search')} /></div>
        <select aria-label="Filter by status" value={filters.status} onChange={set('status')}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select aria-label="Filter by priority" value={filters.priority} onChange={set('priority')}><option value="">All priorities</option>{PRIORITIES.map((p) => <option key={p}>{p}</option>)}</select>
        <select aria-label="Sort tasks" value={filters.sortBy} onChange={set('sortBy')}>
          <option value="createdAt-desc">Newest created</option><option value="createdAt-asc">Oldest created</option>
          <option value="dueDate-asc">Due soonest</option><option value="dueDate-desc">Due latest</option>
        </select>
        <label className="check"><input type="checkbox" checked={filters.overdue} onChange={set('overdue')} /> Overdue only</label>
        <button className="btn ghost" onClick={() => setFilters(DEFAULTS)} disabled={!dirty}><RotateCcw size={15} /> Reset</button>
      </div>

      {error && <div className="alert" role="alert">{error} <button className="link" onClick={load}>Try again</button></div>}
      {loading ? <Spinner /> : tasks.length === 0 && !error ? (
        <div className="empty card"><ClipboardList size={36} />
          <h2>{dirty ? 'No tasks match these filters' : 'No tasks yet'}</h2>
          <p className="muted">{dirty ? 'Try a different search or reset the filters.' : 'Create your first task to start tracking your work.'}</p>
          {dirty ? <button className="btn ghost" onClick={() => setFilters(DEFAULTS)}>Reset filters</button> : <button className="btn primary" onClick={() => setModal({})}>Create a task</button>}
        </div>
      ) : (
        <ul className="task-list">
          {tasks.map((t) => (
            <li key={t._id} className={`card task ${isOverdue(t) ? 'is-overdue' : ''} ${t.status === 'Completed' ? 'is-done' : ''}`}>
              <div className="task-main">
                <h3>{t.title}</h3>
                {t.description && <p className="muted">{t.description}</p>}
                <div className="meta">
                  <span className={isOverdue(t) ? 'overdue-text' : 'muted'}><CalendarDays size={14} /> {isOverdue(t) ? 'Overdue · ' : ''}{fmtDate(t.dueDate)}</span>
                  <PriorityBadge priority={t.priority} /><StatusBadge status={t.status} />
                </div>
              </div>
              <div className="task-actions">
                <select aria-label={`Change status of ${t.title}`} value={t.status} onChange={(e) => changeStatus(t, e.target.value)}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                <button className="icon-btn" onClick={() => setModal(t)} aria-label={`Edit ${t.title}`}><Pencil size={17} /></button>
                <button className="icon-btn danger" onClick={() => setDeleting(t)} aria-label={`Delete ${t.title}`}><Trash2 size={17} /></button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modal && <TaskModal task={modal._id ? modal : null} onClose={closeModal} onSaved={() => { closeModal(); load(); }} />}
      {deleting && <ConfirmDialog title="Delete this task?" message={`“${deleting.title}” will be permanently removed.`} busy={delBusy} onConfirm={confirmDelete} onCancel={() => setDeleting(null)} />}
    </>
  );
}
