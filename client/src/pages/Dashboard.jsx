import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ListTodo, Loader, CheckCircle2, AlertTriangle, Layers, Flame } from 'lucide-react';
import { taskApi, errorMessage } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import Spinner from '../components/Spinner.jsx';
import { StatusBadge, PriorityBadge } from '../components/Badges.jsx';
import { fmtDate, isOverdue } from '../utils/format.js';

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { taskApi.stats().then(setData).catch((e) => setError(errorMessage(e))); }, []);

  if (error) return <div className="alert" role="alert">{error}</div>;
  if (!data) return <Spinner />;
  const { stats: s, recent } = data;
  const pct = (n) => (s.total ? (n / s.total) * 100 : 0);
  const cards = [
    ['Total tasks', s.total, Layers, ''], ['Pending', s.pending, ListTodo, ''], ['In progress', s.inProgress, Loader, ''],
    ['Completed', s.completed, CheckCircle2, 'ok'], ['Overdue', s.overdue, AlertTriangle, s.overdue ? 'bad' : ''], ['High priority open', s.openHighPriority, Flame, s.openHighPriority ? 'warn' : ''],
  ];
  return (
    <>
      <div className="page-head"><div><h1>Hello, {user.name.split(' ')[0]}</h1><p className="muted">Here is where your work stands today.</p></div>
        <Link to="/tasks?new=1" className="btn primary">New task</Link></div>
      <div className="stat-grid">
        {cards.map(([label, n, Icon, tone]) => (
          <div className={`card stat ${tone}`} key={label}><Icon size={20} /><strong>{n}</strong><span>{label}</span></div>
        ))}
      </div>
      <div className="two-col">
        <section className="card">
          <h2>Progress</h2>
          <div className="big-pct">{s.completionRate}%<small>of tasks completed</small></div>
          <div className="bar" role="progressbar" aria-valuenow={s.completionRate} aria-valuemin="0" aria-valuemax="100" aria-label="Completion">
            <span className="seg done" style={{ width: `${pct(s.completed)}%` }} />
            <span className="seg prog" style={{ width: `${pct(s.inProgress)}%` }} />
            <span className="seg pend" style={{ width: `${pct(s.pending)}%` }} />
          </div>
          <ul className="legend"><li><i className="seg done" />Completed {s.completed}</li><li><i className="seg prog" />In progress {s.inProgress}</li><li><i className="seg pend" />Pending {s.pending}</li></ul>
        </section>
        <section className="card">
          <div className="card-head"><h2>Recent tasks</h2><Link to="/tasks">View all</Link></div>
          {recent.length === 0 ? <p className="muted">No tasks yet. Create your first one to see it here.</p> : (
            <ul className="recent">
              {recent.map((t) => (
                <li key={t._id}>
                  <div><strong>{t.title}</strong><small className={isOverdue(t) ? 'overdue-text' : 'muted'}>{isOverdue(t) ? 'Overdue · ' : ''}{fmtDate(t.dueDate)}</small></div>
                  <div className="badges"><PriorityBadge priority={t.priority} /><StatusBadge status={t.status} /></div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
