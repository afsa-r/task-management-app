import { slug } from '../utils/format.js';
export const StatusBadge = ({ status }) => <span className={`badge status-${slug(status)}`}>{status}</span>;
export const PriorityBadge = ({ priority }) => <span className={`badge prio-${slug(priority)}`}><i className="dot" />{priority}</span>;
