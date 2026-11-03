import { useDebounced } from '../../shared/useDebounced';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowDown,
  ArrowRight,
  CheckCheck,
  Clock3,
  ClipboardList,
  RefreshCw,
  SlidersHorizontal,
  Zap,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../shared/auth/Auth';
import { useI18n } from '../../shared/i18n';
import { facilityPath, request } from '../../shared/api/client';
import type { Order, OrderContext, Page } from '../../shared/api/types';
import { Badge, Empty, ErrorBox, Loading } from '../../shared/ui';
import { PageHeading, SearchField } from '../../app/App';
import { CreateOrder } from './CreateOrder';
export const statuses = [
  'Requested',
  'Scheduled',
  'CheckedIn',
  'Acquired',
  'InReview',
  'ReportDraft',
  'Signed',
  'Cancelled',
];
export function statusLabel(status: string) {
  return status.replace(/([a-z])([A-Z])/g, '$1 $2');
}
export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      tone={
        status === 'Signed'
          ? 'green'
          : status === 'ReportDraft'
            ? 'purple'
            : status === 'InReview'
              ? 'blue'
              : ''
      }
    >
      {statusLabel(status)}
    </Badge>
  );
}
export function Worklist({
  overview = false,
  onOpen,
  search,
  setSearch,
}: {
  overview?: boolean;
  onOpen: (order: Order) => void;
  search: string;
  setSearch: (value: string) => void;
}) {
  const { facilityId, session, roles } = useAuth();
  const [creating, setCreating] = useState(false);
  const { t, locale } = useI18n();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [modality, setModality] = useState('');
  const [view, setView] = useState('all');
  const [sort, setSort] = useState('urgent');
  const [createdFrom, setCreatedFrom] = useState('');
  const [createdTo, setCreatedTo] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const settledSearch = useDebounced(search);
  const settledAssignee = useDebounced(assignedTo);
  const filters = {
    search: settledSearch,
    status,
    modality,
    assignment: view === 'mine' ? 'Mine' : view === 'unassigned' ? 'Unassigned' : 'All',
    priority: view === 'urgent' ? 'Urgent' : null,
    sort: sort === 'urgent' ? 'UrgentFirst' : 'CreatedDesc',
    assignedTo: settledAssignee || null,
    createdFrom: createdFrom ? `${createdFrom}T00:00:00Z` : null,
    createdTo: createdTo ? `${createdTo}T00:00:00Z` : null,
  };
  const filterKey = JSON.stringify(filters);
  const [pageFilter, setPageFilter] = useState(filterKey);
  if (pageFilter !== filterKey) {
    setPageFilter(filterKey);
    setPage(1);
  }
  const query = useQuery({
    queryKey: [facilityId, 'worklist', page, filters],
    queryFn: ({ signal }) =>
      request<Page<OrderContext>>(
        facilityPath(facilityId, 'worklist/search'),
        'POST',
        { ...filters, page, pageSize: 20 },
        signal,
      ),
  });
  const visible = query.data?.items || [];
  const rows = visible.map((item) => item.order);
  return (
    <>
      <PageHeading
        eyebrow={overview ? 'YOUR DAY AT A GLANCE' : 'IMAGING OPERATIONS'}
        title={overview ? t.dashboardTitle : t.worklistTitle}
        description={overview ? t.dashboardSub : t.worklistSub}
      >
        <div className="heading-actions">
          {!!(roles & 3) && (
            <button className="primary desktop-action" onClick={() => setCreating(true)}>
              <Plus size={16} />
              New imaging order
            </button>
          )}
          <button
            className="secondary"
            onClick={() => {
              void query.refetch();
            }}
          >
            <RefreshCw size={16} />
            {t.refresh}
          </button>
        </div>
      </PageHeading>
      {creating && <CreateOrder onClose={() => setCreating(false)} />}
      {overview && (
        <>
          <div className="stats-grid">
            {[
              {
                label: 'Studies in queue',
                value: query.data?.total,
                caption: 'Across your permitted worklist',
                icon: ClipboardList,
                color: 'teal',
              },
              {
                label: 'Urgent on this page',
                value: rows.filter((o) => o.priority === 'Urgent').length,
                caption: 'Prioritize clinical attention',
                icon: Zap,
                color: 'orange',
              },
              {
                label: 'Assigned to you',
                value: rows.filter((o) => o.assignedTo === session?.userId).length,
                caption: 'On the current worklist page',
                icon: Clock3,
                color: 'blue',
              },
              {
                label: 'Signed on this page',
                value: rows.filter((o) => o.status === 'Signed').length,
                caption: 'Physician-reviewed reports',
                icon: CheckCheck,
                color: 'purple',
              },
            ].map(({ label, value, caption, icon: Icon, color }) => (
              <section className="stat-card" key={label}>
                <div>
                  <span>{label}</span>
                  <span className={`stat-icon ${color}`}>
                    <Icon size={19} />
                  </span>
                </div>
                <strong>{query.isSuccess ? value : '—'}</strong>
                <small>{caption}</small>
              </section>
            ))}
          </div>
          <div className="day-banner">
            <span className="banner-icon">
              <ActivityMark />
            </span>
            <div>
              <strong>Your expertise. A more connected workflow.</strong>
              <p>Pick up a study, review the evidence, and move care forward.</p>
            </div>
            <span className="banner-label">
              Physician-led reporting
              <ArrowRight size={16} />
            </span>
          </div>
        </>
      )}
      <section className="panel">
        <div className="panel-header">
          <div>
            <h2>
              {overview ? 'Your study queue' : t.worklist}
              <span className="count">{query.data?.total ?? '—'}</span>
            </h2>
            <p>Facility-scoped studies · Most recent first within each priority</p>
          </div>
          <div className="view-tabs" aria-label="Worklist view">
            {[
              ['all', 'All studies'],
              ['mine', 'Assigned to me'],
              ['urgent', t.urgent],
              ['unassigned', 'Unassigned'],
            ].map(([id, label]) => (
              <button
                key={id}
                aria-pressed={view === id}
                className={view === id ? 'selected' : ''}
                onClick={() => setView(id)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="filterbar">
          <SearchField value={search} onChange={setSearch} />
          <select
            aria-label="Filter status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
          >
            <option value="">{t.all}</option>
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Filter modality"
            value={modality}
            onChange={(event) => setModality(event.target.value)}
          >
            <option value="">All modalities</option>
            {['CT', 'MR', 'XR', 'US'].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
          <select
            aria-label="Sort worklist"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            <option value="urgent">Urgent first</option>
            <option value="newest">Newest first</option>
          </select>
          <label>
            Created from (UTC)
            <input
              type="date"
              value={createdFrom}
              onChange={(event) => setCreatedFrom(event.target.value)}
            />
          </label>
          <label>
            Created before (UTC)
            <input
              type="date"
              value={createdTo}
              onChange={(event) => setCreatedTo(event.target.value)}
            />
          </label>
          {!!(roles & 7) && (
            <label>
              Assigned user ID
              <input
                maxLength={200}
                value={assignedTo}
                onChange={(event) => setAssignedTo(event.target.value)}
              />
            </label>
          )}
          <SlidersHorizontal className="filter-icon" size={18} />
        </div>
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorBox error={query.error} retry={() => void query.refetch()} />
        ) : (
          <>
            <div className="table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>{t.patient}</th>
                    <th>{t.study}</th>
                    <th>{t.priority}</th>
                    <th>{t.status}</th>
                    <th>{t.assigned}</th>
                    <th>Report / images</th>
                    <th>
                      Created <ArrowDown size={12} />
                    </th>
                    <th>
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {visible.map(({ order, patient, originalReport, imaging, patientAccess }) => {
                    return (
                      <tr key={order.id}>
                        <td>
                          <div className="patient-cell">
                            <span className="patient-avatar">
                              {patient?.displayName
                                .split(' ')
                                .map((s) => s[0])
                                .slice(0, 2)
                                .join('') || '—'}
                            </span>
                            <div>
                              <strong>
                                {patient?.displayName ||
                                  (patientAccess === 'ClaimRequired'
                                    ? 'Claim to view patient'
                                    : 'Patient details unavailable')}
                              </strong>
                              <small>
                                {patient?.identifier || 'Open study for authorized context'}
                              </small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="study-cell">
                            <span className={`modality ${order.modality.toLowerCase()}`}>
                              {order.modality}
                            </span>
                            <div>
                              <strong>{order.bodyRegion}</strong>
                              <small>Order · {order.id.slice(0, 8)}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Badge tone={order.priority === 'Urgent' ? 'orange' : ''}>
                            {order.priority === 'Urgent' && <Zap size={11} />} {order.priority}
                          </Badge>
                        </td>
                        <td>
                          <StatusBadge status={order.status} />
                        </td>
                        <td>
                          {order.assignedTo === session?.userId ? (
                            <span className="assigned-you">You</span>
                          ) : (
                            order.assignedTo || <span className="muted">Unassigned</span>
                          )}
                        </td>
                        <td>
                          <small>
                            {originalReport
                              ? `${originalReport.status} - Rev ${originalReport.currentVersion}`
                              : 'No accessible original report'}
                          </small>
                          <small>
                            Images: {imaging.state} - {imaging.linkedStudyCount} linked
                          </small>
                          <small>Processing: not tracked</small>
                        </td>
                        <td className="date-cell">
                          {new Date(order.createdAt).toLocaleDateString(locale)}
                          <small>
                            {new Date(order.createdAt).toLocaleTimeString(locale, {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: false,
                            })}
                          </small>
                        </td>
                        <td>
                          <button
                            className="row-open"
                            aria-label={`${t.open}: ${order.bodyRegion} ${patient?.displayName || ''}`}
                            onClick={() => onOpen(order)}
                          >
                            <ArrowRight size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {!visible.length && <Empty />}
          </>
        )}
        <div className="table-footer">
          <span>
            {visible.length} shown · Page {page} · {query.data?.total || 0} matching. Filters and
            sort apply across your authorized worklist.
          </span>
          <div className="pagination">
            <button disabled={page === 1 || query.isFetching} onClick={() => setPage((p) => p - 1)}>
              {t.previous}
            </button>
            <span>{page}</span>
            <button
              disabled={!query.data || page * 20 >= query.data.total || query.isFetching}
              onClick={() => setPage((p) => p + 1)}
            >
              {t.next}
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
function ActivityMark() {
  return <ClipboardList size={26} />;
}
