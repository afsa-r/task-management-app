export default function Spinner({ full }) {
  return <div className={full ? 'spinner-full' : 'spinner-wrap'}><div className="spinner" role="status" aria-label="Loading" /></div>;
}
