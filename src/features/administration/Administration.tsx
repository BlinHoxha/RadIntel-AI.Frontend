import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Plus, ShieldCheck } from 'lucide-react';
import { PageHeading } from '../../app/App';
import { useAuth } from '../../shared/auth/Auth';
import { facilityPath, request } from '../../shared/api/client';
import type { Audit, Page, Template } from '../../shared/api/types';
import { Badge, Empty, ErrorBox, Loading, Modal } from '../../shared/ui';
export function Templates() {
  const { facilityId, roles } = useAuth();
  const queries = useQueryClient();
  const [adding, setAdding] = useState(false);
  const query = useQuery({
    queryKey: [facilityId, 'templates'],
    queryFn: () => request<Template[]>(facilityPath(facilityId, 'templates')),
  });
  const mutation = useMutation({
    mutationFn: ({ path, body }: { path: string; body: unknown }) =>
      request(facilityPath(facilityId, path), 'POST', body),
    onSuccess: () => {
      void queries.invalidateQueries({ queryKey: [facilityId, 'templates'] });
      setAdding(false);
    },
  });
  return (
    <>
      <PageHeading
        eyebrow="APPROVED STRUCTURES"
        title="A consistent starting point."
        description="Versioned reporting templates. Publication requires administrator and radiologist roles."
      >
        {!!(roles & 1) && (
          <button className="primary desktop-action" onClick={() => setAdding(true)}>
            <Plus size={17} />
            New template
          </button>
        )}
      </PageHeading>
      {mutation.error && <ErrorBox error={mutation.error} />}{' '}
      {query.isPending ? (
        <Loading />
      ) : query.error ? (
        <ErrorBox error={query.error} />
      ) : (
        <div className="template-grid">
          {query.data?.map((template) => (
            <article className="panel template-card" key={template.id}>
              <div className="template-icon">
                <FileText size={22} />
              </div>
              <Badge tone={template.published ? 'green' : ''}>
                {template.published ? 'Published' : 'Unpublished'}
              </Badge>
              <h2>{template.name}</h2>
              <p>
                {template.modality} · {template.bodyRegion} · {template.language.toUpperCase()} · v
                {template.version}
              </p>
              <pre>{template.structure}</pre>
              {(roles & 9) === 9 && (
                <button
                  className="desktop-action"
                  disabled={mutation.isPending}
                  onClick={() =>
                    mutation.mutate({
                      path: `templates/${template.id}/${template.published ? 'revoke' : 'publish'}`,
                      body: { expectedToken: template.concurrencyToken },
                    })
                  }
                >
                  {template.published ? 'Revoke publication' : 'Publish template'}
                </button>
              )}
            </article>
          ))}
          {!query.data?.length && <Empty />}
        </div>
      )}
      {adding && (
        <Modal title="Create unpublished template version" onClose={() => setAdding(false)}>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const values = Object.fromEntries(new FormData(event.currentTarget));
              mutation.mutate({
                path: 'templates',
                body: { ...values, version: Number(values.version) },
              });
            }}
          >
            {[
              ['name', 'Name', 200],
              ['modality', 'Modality', 20],
              ['bodyRegion', 'Body region', 100],
            ].map(([name, label, max]) => (
              <label key={name}>
                {label}
                <input name={String(name)} required maxLength={Number(max)} />
              </label>
            ))}
            <label>
              Language
              <select name="language">
                <option value="en">English</option>
                <option value="sq">Shqip</option>
              </select>
            </label>
            <label>
              Version
              <input name="version" type="number" min={1} defaultValue={1} required />
            </label>
            <label>
              Structure
              <textarea name="structure" required maxLength={10000} />
            </label>
            <button className="primary" disabled={mutation.isPending}>
              Create template
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
export function AuditTrail() {
  const { facilityId } = useAuth();
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: [facilityId, 'audit', page],
    queryFn: () => request<Page<Audit>>(facilityPath(facilityId, `audit?page=${page}&pageSize=30`)),
  });
  return (
    <>
      <PageHeading
        eyebrow="ACCOUNTABILITY"
        title="A traceable clinical workflow."
        description="Server-recorded actions, attributed to the authenticated actor."
      />
      <section className="panel">
        <div className="panel-header">
          <h2>
            <ShieldCheck size={19} />
            Audit timeline
          </h2>
          <button onClick={() => void query.refetch()}>Refresh</button>
        </div>
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorBox error={query.error} />
        ) : (
          <div className="audit-list">
            {query.data?.items.map((event) => (
              <article key={event.id}>
                <span className="timeline-dot" />
                <div>
                  <strong>{event.action}</strong>
                  <p>
                    Actor: {event.actorId} · Record: {event.entityId}
                  </p>
                  {event.reason && <p>{event.reason}</p>}
                </div>
                <time>{new Date(event.createdAt).toLocaleString()}</time>
              </article>
            ))}
            {!query.data?.items.length && <Empty />}
          </div>
        )}
        <div className="table-footer">
          <span>
            Page {page} · {query.data?.total || 0} events
          </span>
          <div className="pagination">
            <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}>
              Previous
            </button>
            <button
              disabled={!query.data || page * 30 >= query.data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
export function Administration() {
  const { facilityId, session } = useAuth();
  const [notice, setNotice] = useState('');
  const mutation = useMutation({
    mutationFn: ({
      path,
      body,
      method = 'POST',
    }: {
      path: string;
      body: unknown;
      method?: string;
    }) => request(facilityPath(facilityId, path), method, body),
    onSuccess: () => setNotice('Change saved by the server.'),
  });
  const metrics = useQuery({
    queryKey: [facilityId, 'metrics'],
    queryFn: () =>
      request<{ ordersByStatus: { status: string; count: number }[]; pendingOutbox: number }>(
        facilityPath(facilityId, 'metrics'),
      ),
  });
  return (
    <>
      <PageHeading
        eyebrow="INSTITUTION SETTINGS"
        title="The right access. The right context."
        description="Manage authoritative facility memberships and imaging equipment."
      />
      {notice && (
        <div className="success-box" role="status">
          {notice}
        </div>
      )}
      {mutation.error && <ErrorBox error={mutation.error} />}
      <div className="admin-grid">
        <section className="panel padded">
          <h2>Staff membership</h2>
          <p>Another administrator must change your own membership.</p>
          <form
            className="desktop-action"
            onSubmit={(event) => {
              event.preventDefault();
              const data = new FormData(event.currentTarget);
              mutation.mutate({
                path: 'memberships',
                method: 'PUT',
                body: {
                  userId: data.get('userId'),
                  roles: data.getAll('roles').reduce((total, value) => total | Number(value), 0),
                  active: data.has('active'),
                },
              });
            }}
          >
            <label>
              Identity provider user ID
              <input name="userId" required maxLength={200} />
            </label>
            {[
              ['Administrator', 1],
              ['Scheduler', 2],
              ['Technician', 4],
              ['Radiologist', 8],
              ['Auditor', 16],
            ].map(([label, value]) => (
              <label className="check-label" key={value}>
                <input type="checkbox" name="roles" value={value} />
                {label}
              </label>
            ))}
            <label className="check-label">
              <input name="active" type="checkbox" defaultChecked />
              Active membership
            </label>
            <button className="primary" disabled={mutation.isPending}>
              Save membership
            </button>
          </form>
        </section>
        <section className="panel padded">
          <h2>Register equipment</h2>
          <form
            className="desktop-action"
            onSubmit={(event) => {
              event.preventDefault();
              mutation.mutate({
                path: 'equipment',
                body: Object.fromEntries(new FormData(event.currentTarget)),
              });
            }}
          >
            <label>
              Equipment name
              <input required maxLength={200} name="name" />
            </label>
            <label>
              Modality
              <select name="modality">
                {['CT', 'MR', 'XR', 'US'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>
            <button className="primary" disabled={mutation.isPending}>
              Register equipment
            </button>
          </form>
          <hr />
          <h3>Session</h3>
          <p>Identity: {session?.userId}</p>
          <p>Recent MFA: {session?.hasRecentMfa ? 'Present' : 'Not present'}</p>
          <h3>Workflow counts</h3>
          {metrics.error && <ErrorBox error={metrics.error} />}{' '}
          {metrics.data?.ordersByStatus.map((item) => (
            <p key={item.status}>
              {item.status}: <strong>{item.count}</strong>
            </p>
          ))}
          {metrics.data && (
            <p>
              Pending delivery intents: {metrics.data.pendingOutbox}
              <br />
              <small>Delivery worker is not implemented.</small>
            </p>
          )}
        </section>
      </div>
    </>
  );
}
