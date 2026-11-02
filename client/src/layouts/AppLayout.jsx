import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ListChecks, LogOut, Menu, X, CheckCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function AppLayout() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const nav = useNavigate();
  const out = () => { logout(); nav('/login'); };
  const link = ({ isActive }) => `nav-link${isActive ? ' active' : ''}`;
  return (
    <div className="shell">
      <header className="topbar">
        <button className="icon-btn" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={22} /></button>
        <span className="brand"><CheckCheck size={20} /> Taskly</span>
      </header>
      {open && <div className="scrim" onClick={() => setOpen(false)} />}
      <aside className={`sidebar${open ? ' open' : ''}`}>
        <div className="side-top">
          <span className="brand"><CheckCheck size={22} /> Taskly</span>
          <button className="icon-btn mobile-only" onClick={() => setOpen(false)} aria-label="Close menu"><X size={20} /></button>
        </div>
        <nav aria-label="Main">
          <NavLink to="/" end className={link} onClick={() => setOpen(false)}><LayoutDashboard size={18} /> Dashboard</NavLink>
          <NavLink to="/tasks" className={link} onClick={() => setOpen(false)}><ListChecks size={18} /> My tasks</NavLink>
        </nav>
        <div className="side-bottom">
          <div className="me"><span className="avatar">{user.name[0].toUpperCase()}</span><div><strong>{user.name}</strong><small>{user.email}</small></div></div>
          <button className="nav-link" onClick={out}><LogOut size={18} /> Log out</button>
        </div>
      </aside>
      <main className="content"><Outlet /></main>
    </div>
  );
}
