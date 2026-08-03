import { useEffect, useState } from 'react';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { PageSpinner } from '../../components/RouteGuards';

export default function AuditLog() {
  const { token } = useAuth();
  const [logs, setLogs] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.adminLogs(token).then((d) => setLogs(d.logs)).catch((e) => setError(e.message));
  }, [token]);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Audit log</h1>
      <p className="mt-1 text-sm text-road-950/60">Every price and timing change, with who made it and when.</p>

      <div className="mt-6 space-y-2">
        {logs === null && !error && <PageSpinner />}
        {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
        {logs?.length === 0 && <p className="text-sm text-road-950/50">No changes logged yet.</p>}
        {logs?.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-xl border border-road-900/10 bg-white px-4 py-3 text-sm">
            <div>
              <span className="font-semibold capitalize">{l.action.replace(/_/g, ' ')}</span>
              <span className="ml-2 text-road-950/40">by {l.admin_name}</span>
            </div>
            <span className="font-mono text-xs text-road-950/40">{l.created_at}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
