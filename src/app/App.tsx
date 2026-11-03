import { useEffect, useState } from 'react';
import {
  NavLink,
  Navigate,
  Route,
  Routes,
  useBlocker,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  Building2,
  ChevronRight,
  ClipboardList,
  FileText,
  LayoutDashboard,
  LogOut,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  Stethoscope,
} from 'lucide-react';
import { useAuth, demoMode } from '../shared/auth/Auth';
import { useI18n } from '../shared/i18n';
import { ErrorBox } from '../shared/ui';
import type { Order } from '../shared/api/types';
import { Worklist } from '../features/worklist/Worklist';
import { StudyWorkspace } from '../features/reports/StudyWorkspace';
import { Patients } from '../features/patients/Patients';
import { Administration, AuditTrail, Templates } from '../features/administration/Administration';

export function App() {
  const auth = useAuth();
  const { t, locale, setLocale } = useI18n();
  const [selected, setSelected] = useState<Order | null>(null);
  const [dirty, setDirty] = useState(false);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const blocker = useBlocker(dirty);
  useEffect(() => {
    if (blocker.state === 'blocked') {
      if (window.confirm('Discard your unsaved report changes?')) {
        setDirty(false);
        blocker.proceed();
      } else blocker.reset();
    }
  }, [blocker]);
  useEffect(() => {
    if (!auth.session) {
      setSelected(null);
      setDirty(false);
    }
  }, [auth.session]);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    setSearch('');
    document.getElementById('page-title')?.focus();
  }, [location.pathname]);
  useEffect(() => {
    const warn = (event: BeforeUnloadEvent) => {
      if (dirty) event.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);
  const leave = () => !dirty || window.confirm('Discard your unsaved report changes?');
  if (!auth.session) return <Login />;
  const nav = [
    { path: '/', label: t.overview, icon: LayoutDashboard, allow: 15 },
    { path: '/worklist', label: t.worklist, icon: ClipboardList, allow: 15 },
    { path: '/patients', label: t.patients, icon: Users, allow: 15 },
    { path: '/templates', label: t.templates, icon: FileText, allow: 9 },
    { path: '/audit', label: t.audit, icon: ShieldCheck, allow: 17 },
    { path: '/administration', label: t.administration, icon: Settings2, allow: 1 },
  ];
  const openStudy = (order: Order) => {
    if (!leave()) return;
    setDirty(false);
    setSelected(order);
    navigate('/study');
  };
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">
            <Activity size={24} />
          </span>
          radintel<span className="brand-dot">.</span>
        </div>
        <div className="sidebar-label">{t.workspace}</div>
        <nav aria-label="Main navigation">
          {nav
            .filter((item) => auth.roles & item.allow)
            .map(({ path, label, icon: Icon }) => (
              <NavLink key={path} aria-label={label} to={path} end={path === '/'}>
                <Icon size={19} />
                <span>{label}</span>
              </NavLink>
            ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="workspace-note">
            <ShieldCheck size={20} />
            <strong>Clinician in control</strong>
            <p>Every final report requires explicit physician review.</p>
          </div>
          <button
            className="logout"
            aria-label={t.signout}
            onClick={() => {
              if (leave()) {
                setDirty(false);
                setSelected(null);
                auth.disconnect();
                navigate('/');
              }
            }}
          >
            <LogOut size={18} />
            {t.signout}
          </button>
        </div>
      </aside>
      <div className="main-shell">
        <header className="topbar">
          <div className="institution">
            <Building2 size={19} />
            <label className="sr-only" htmlFor="facility">
              {t.facility}
            </label>
            <select
              id="facility"
              value={auth.facilityId}
              onChange={(event) => {
                if (leave()) {
                  setDirty(false);
                  setSelected(null);
                  auth.chooseFacility(event.target.value);
                  navigate('/');
                }
              }}
            >
              {auth.session.facilities.map((f) => (
                <option value={f.id} key={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          </div>
          <div className="topbar-right">
            <span className={`connection ${demoMode ? 'demo' : ''}`}>
              <span />
              {demoMode ? 'Demo workspace' : t.connected}
            </span>
            <label className="sr-only" htmlFor="locale">
              {t.language}
            </label>
            <select id="locale" value={locale} onChange={(event) => setLocale(event.target.value)}>
              <option value="en">EN</option>
              <option value="sq">SQ</option>
            </select>
            <span className="avatar" aria-label={auth.session.userId}>
              {auth.session.userId.slice(0, 2).toUpperCase()}
            </span>
          </div>
        </header>
        <div className="contextbar">
          <span>{t.workspace}</span>
          <ChevronRight size={14} />
          <span>
            {location.pathname === '/study'
              ? t.report
              : nav.find((item) => item.path === location.pathname)?.label || t.overview}
          </span>
          <span className="context-right">{demoMode ? t.demo : 'Facility-scoped access'}</span>
        </div>
        <main id="main">
          <div className="mobile-note">{t.readOnly}</div>
          {auth.facilityId ? (
            <Routes>
              <Route
                path="/"
                element={
                  auth.roles & 15 ? (
                    <Worklist overview onOpen={openStudy} search={search} setSearch={setSearch} />
                  ) : (
                    <Navigate to="/audit" replace />
                  )
                }
              />
              <Route
                path="/worklist"
                element={
                  auth.roles & 15 ? (
                    <Worklist onOpen={openStudy} search={search} setSearch={setSearch} />
                  ) : (
                    <Forbidden />
                  )
                }
              />
              <Route
                path="/patients"
                element={
                  auth.roles & 15 ? (
                    <Patients search={search} setSearch={setSearch} />
                  ) : (
                    <Forbidden />
                  )
                }
              />
              <Route
                path="/study"
                element={
                  selected && auth.roles & 15 ? (
                    <StudyWorkspace
                      key={`${auth.facilityId}:${selected.id}`}
                      order={selected}
                      onDirty={setDirty}
                    />
                  ) : (
                    <Navigate to="/worklist" replace />
                  )
                }
              />
              <Route path="/templates" element={auth.roles & 9 ? <Templates /> : <Forbidden />} />
              <Route path="/audit" element={auth.roles & 17 ? <AuditTrail /> : <Forbidden />} />
              <Route
                path="/administration"
                element={auth.roles & 1 ? <Administration /> : <Forbidden />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <div className="empty">
              No authorized facility membership. Ask your institution administrator to grant access.
            </div>
          )}
        </main>
        <footer className="app-footer">
          <span>
            <Activity size={14} /> RadIntel workspace
          </span>
          <span>
            {demoMode
              ? 'Synthetic environment · Changes reset on reload'
              : 'Clinical actions are authorized and audited by the server'}
          </span>
        </footer>
      </div>
    </div>
  );
}
function Forbidden() {
  return <ErrorBox error={new Error('You do not have access to this module.')} />;
}
function Login() {
  const { connect, development, configurationError, configurationLoading } = useAuth();
  const [token, setToken] = useState('');
  const [userId, setUserId] = useState('');
  const [organizationId, setOrganizationId] = useState('');
  const [simulateMfa, setSimulateMfa] = useState(false);
  const [error, setError] = useState<unknown>();
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    setError(undefined);
    try {
      const value = token;
      setToken('');
      await connect(
        demoMode ? 'synthetic-demo' : value,
        development ? { userId, organizationId, simulateMfa } : undefined,
      );
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="login">
      <div className="login-story">
        <div className="brand">
          <Activity size={32} />
          radintel.
        </div>
        <div>
          <span className="eyebrow">THE CLINICAL WORKSPACE</span>
          <h1>
            Clarity at every
            <br />
            step of care.
          </h1>
          <p>
            A connected imaging workflow.
            <br />A considered report. A clinician in control.
          </p>
          <div className="login-orbit">
            <Stethoscope size={86} strokeWidth={1} />
          </div>
        </div>
        <small>Imaging workflow & physician-reviewed reporting</small>
      </div>
      <main className="login-form">
        <div className="eyebrow">RADIOLOGY, CONNECTED</div>
        <h2>Welcome to your workspace</h2>
        <p>
          {demoMode
            ? 'Explore the complete reporting workflow with synthetic cases.'
            : 'Connect using a short-lived access token issued by your institution.'}
        </p>
        {demoMode && (
          <div className="info-box">
            Synthetic demo only. No real patient data or live clinical services.
          </div>
        )}
        {development && (
          <div className="info-box">
            Local Development authentication. Use synthetic data only. Roles come from backend
            facility memberships.
          </div>
        )}
        {configurationError && <ErrorBox error={new Error(configurationError)} />}
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void submit();
          }}
        >
          {!demoMode && (
            <label>
              Access token
              <input
                autoComplete="off"
                type="password"
                required
                value={token}
                onChange={(event) => setToken(event.target.value)}
              />
            </label>
          )}
          {development && (
            <fieldset disabled={busy}>
              <label>
                Development user ID
                <input
                  required
                  maxLength={200}
                  autoComplete="off"
                  value={userId}
                  onChange={(event) => setUserId(event.target.value)}
                />
              </label>
              <label>
                Organization UUID
                <input
                  required
                  autoComplete="off"
                  value={organizationId}
                  onChange={(event) => setOrganizationId(event.target.value)}
                />
              </label>
              {development.simulatedMfaAllowed && (
                <label className="check-label">
                  <input
                    type="checkbox"
                    checked={simulateMfa}
                    onChange={(event) => setSimulateMfa(event.target.checked)}
                  />
                  Simulate recent MFA for local workflow tests
                </label>
              )}
            </fieldset>
          )}
          {error ? <ErrorBox error={error} /> : null}
          <button
            className="primary wide"
            disabled={busy || configurationLoading || !!configurationError}
          >
            {busy ? 'Connecting…' : demoMode ? 'Explore demo workspace' : 'Connect to institution'}
            <ArrowRight size={18} />
          </button>
        </form>
        <p className="fine-print">
          {demoMode
            ? 'Demo changes are held in memory and reset when you reload.'
            : 'Credentials are kept in memory. Sessions disconnect after 15 minutes of inactivity.'}
        </p>
      </main>
    </div>
  );
}
export function PageHeading({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <span className="eyebrow">{eyebrow}</span>
        <h1 id="page-title" tabIndex={-1}>
          {title}
        </h1>
        <p>{description}</p>
      </div>
      {children}
    </div>
  );
}
export function SearchField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="search-field">
      <Search size={18} />
      <input
        maxLength={200}
        aria-label={t.search}
        placeholder={t.search}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}
