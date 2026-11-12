import { http, HttpResponse } from 'msw';
import { demoContext, fixture, pixels } from '../../../viewer/synthetic.mjs';
import type {
  Audit,
  Content,
  Order,
  OrderContext,
  Patient,
  Proposal,
  Report,
  ReportDetail,
  Signature,
  Template,
  Version,
} from '../../shared/api/types';
export const facilityId = '10000000-0000-4000-8000-000000000001';
// Opt-in viewer proof fixtures: CT chest and X-ray chest keep the original images; CT abdomen &
// pelvis shows the geometry study, CT head the identity mismatch and the X-ray wrist a frame in an
// unsupported transfer syntax.
const viewerKind = (order: Order) =>
  order.modality !== 'CT'
    ? order.bodyRegion === 'Left wrist'
      ? 'TSYNTAX'
      : 'DX'
    : order.bodyRegion === 'Abdomen & pelvis'
      ? 'GEO'
      : order.bodyRegion === 'Head'
        ? 'MISMATCH'
        : 'CT';
const userId = 'demo.radiologist';
const id = (n: number) => `20000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const entity = (n: number) => ({
  id: id(n),
  facilityId,
  concurrencyToken: crypto.randomUUID(),
  createdAt: Date.now() - n * 60000,
});
let orders: Order[];
let patients: Patient[];
let reports: Record<string, ReportDetail>;
let templates: Template[];
let audit: Audit[];
interface DemoTranscript {
  id: string;
  reportId: string;
  checkedText: string;
  language: string;
}
interface DemoProposal extends Proposal {
  reportId: string;
  transcriptId: string;
  templateId: string;
  baseVersion: number;
  baseConcurrencyToken: string;
  templateToken: string;
}
let transcripts: Record<string, DemoTranscript>;
let proposals: Record<string, DemoProposal>;
const signatureReplay = new Map<string, { reportId: string; signature: Signature }>();
export function resetDemo() {
  const names = [
    'Alex Morgan',
    'Sam Taylor',
    'Jordan Lee',
    'Robin Parker',
    'Casey Reed',
    'Jamie Quinn',
    'Drew Ellis',
    'Avery Blake',
  ];
  patients = names.map((name, index) => ({
    ...entity(100 + index),
    displayName: `Demo ${name}`,
    identifier: `SYN-${String(index + 1).padStart(4, '0')}`,
    identifierIssuer: 'SYNTHETIC',
    birthDate: `${1970 + index * 4}-04-12`,
  }));
  const states: Order['status'][] = [
    'Acquired',
    'ReportDraft',
    'InReview',
    'Acquired',
    'Signed',
    'CheckedIn',
    'Requested',
    'Scheduled',
  ];
  orders = names.map((_, index) => ({
    ...entity(index + 1),
    patientId: patients[index].id,
    modality: ['CT', 'MR', 'XR', 'CT', 'US', 'XR', 'MR', 'CT'][index],
    bodyRegion: [
      'Chest',
      'Brain',
      'Chest',
      'Abdomen & pelvis',
      'Abdomen',
      'Left wrist',
      'Lumbar spine',
      'Head',
    ][index],
    referral: 'Synthetic case for workflow demonstration. No clinical conclusions supplied.',
    priority: [0, 3].includes(index) ? 'Urgent' : 'Routine',
    status: states[index],
    assignedTo: ['ReportDraft', 'InReview', 'Signed'].includes(states[index]) ? userId : null,
  }));
  reports = {};
  for (const order of orders.filter((o) => o.status === 'ReportDraft' || o.status === 'Signed')) {
    const report: Report = {
      ...entity(300 + Number(order.id.slice(-2))),
      orderId: order.id,
      currentVersion: 1,
      status: order.status === 'Signed' ? 'Signed' : 'Draft',
      checkedTranscriptId: null,
      kind: 0,
    };
    const version = {
      ...entity(400 + Number(order.id.slice(-2))),
      reportId: report.id,
      number: 1,
      authorId: userId,
      contentSchemaVersion: 1,
      indication: null,
      technique: null,
      provenance: null,
      examination: `${order.modality} ${order.bodyRegion}`,
      findings: 'Synthetic observations for interface testing only.',
      impression: 'Demonstration report. Not for clinical use.',
      language: 'en' as const,
    };
    reports[report.id] = {
      report,
      versions: [version],
      signatures:
        report.status === 'Signed'
          ? [
              {
                ...entity(450 + Number(order.id.slice(-2))),
                reportVersionId: version.id,
                signedBy: userId,
                contentHash: 'SYNTHETIC-DEMO-DIGEST-NOT-A-REAL-SIGNATURE',
              },
            ]
          : [],
      addenda: [],
    };
  }
  templates = [
    {
      ...entity(502),
      name: 'Structured brain report',
      modality: 'MR',
      bodyRegion: 'Brain',
      language: 'en',
      structure: 'Examination\nFindings\nImpression',
      version: 1,
      published: true,
    },
    {
      ...entity(500),
      name: 'Structured chest report',
      modality: 'CT',
      bodyRegion: 'Chest',
      language: 'en',
      structure: 'Examination\nClinical indication\nFindings\nImpression',
      version: 1,
      published: true,
    },
    {
      ...entity(501),
      name: 'Raporti i kraharorit',
      modality: 'XR',
      bodyRegion: 'Chest',
      language: 'sq',
      structure: 'Ekzaminimi\nIndikacioni klinik\nGjetjet\nPërfundimi',
      version: 1,
      published: true,
    },
  ];
  audit = [
    {
      ...entity(600),
      actorId: userId,
      action: 'Demo.WorkspaceOpened',
      entityId: facilityId,
      reason: 'Synthetic environment initialized',
    },
  ];
  proposals = {};
  transcripts = {};
  signatureReplay.clear();
}
resetDemo();
const problem = (status: number) =>
  HttpResponse.json({ title: 'Request rejected', status }, { status });
function record(action: string, entityId: string) {
  audit.unshift({ ...entity(600 + audit.length), action, actorId: userId, entityId, reason: null });
}
function page<T>(items: T[], url: URL) {
  const page = Math.max(1, Number(url.searchParams.get('page')) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(url.searchParams.get('pageSize')) || 30));
  return HttpResponse.json({
    items: items.slice((page - 1) * pageSize, page * pageSize),
    page,
    pageSize,
    total: items.length,
  });
}
function context(order: Order, roles: number): OrderContext {
  const allowed = !!(roles & 7) || order.assignedTo === userId;
  const report = Object.values(reports).find(
    (item) => item.report.orderId === order.id && item.report.kind === 0,
  )?.report;
  return {
    order,
    patient: allowed ? patients.find((patient) => patient.id === order.patientId) || null : null,
    patientAccess: allowed ? 'Available' : 'ClaimRequired',
    originalReport:
      allowed && report
        ? {
            status: report.status,
            currentVersion: report.currentVersion,
            createdAt: report.createdAt,
          }
        : null,
    imaging: {
      state: 'Unknown',
      linkedStudyCount:
        allowed &&
        import.meta.env.VITE_ENABLE_VIEWER_PROOF === 'true' &&
        ['CT', 'DX', 'XR'].includes(order.modality)
          ? 1
          : 0,
      processingState: 'NotTracked',
    },
  };
}
function demoRevision(
  detail: ReportDetail,
  body: Record<string, unknown>,
  proposal?: DemoProposal,
): Version | null {
  const schema = Number(body.contentSchemaVersion ?? 1);
  const previous = detail.versions.at(-1);
  const indication = String(body.indication ?? '').trim() || null;
  const technique = String(body.technique ?? '').trim() || null;
  if (
    ![1, 2].includes(schema) ||
    (indication?.length ?? 0) > 4000 ||
    (technique?.length ?? 0) > 4000 ||
    (schema === 1 && (indication || technique || previous?.contentSchemaVersion === 2))
  )
    return null;
  const version: Version = {
    ...entity(3000 + audit.length),
    reportId: detail.report.id,
    number: detail.report.currentVersion + 1,
    authorId: userId,
    examination: String(body.examination),
    findings: String(body.findings),
    impression: String(body.impression),
    language: String(body.language) as Content['language'],
    contentSchemaVersion: schema,
    indication,
    technique,
    provenance: null,
  };
  if (schema === 2) {
    const fields = [
      'examination',
      'findings',
      'impression',
      'language',
      'indication',
      'technique',
    ] as const;
    version.provenance = {
      schema: 'radintel-report-provenance-v1',
      method: proposal ? 'AcceptedProposal' : 'Manual',
      actorId: userId,
      baseVersionId: previous?.id ?? null,
      sections: fields.map((section) => ({
        section,
        sourceVersionId: previous?.id ?? null,
        origin:
          version[section] === null
            ? 'NotRecorded'
            : proposal && section === 'findings'
              ? 'AcceptedCheckedTextProposal'
              : proposal && section === 'language'
                ? 'CheckedTranscript'
                : !previous
                  ? 'ManualSubmission'
                  : previous[section] === version[section]
                    ? 'RetainedFromPreviousRevision'
                    : 'ManualEdit',
      })),
      proposalId: proposal?.id ?? null,
      transcriptId: proposal?.transcriptId ?? null,
      templateId: proposal?.templateId ?? null,
      provider: proposal?.provider ?? null,
      modelVersion: proposal?.modelVersion ?? null,
      promptVersion: proposal?.promptVersion ?? null,
      proposalSchemaVersion: proposal?.schemaVersion ?? null,
    };
    for (const section of version.provenance.sections)
      if (
        ['NotRecorded', 'AcceptedCheckedTextProposal', 'CheckedTranscript'].includes(section.origin)
      )
        section.sourceVersionId = null;
  }
  return version;
}

export const handlers = [
  http.all('/api/v1/*', async ({ request, params }) => {
    const token = request.headers.get('Authorization');
    if (!token?.startsWith('Bearer synthetic-demo')) return problem(401);
    const roles = token.endsWith('-technician') ? 4 : token.endsWith('-auditor') ? 16 : 15;
    const url = new URL(request.url);
    const path = String(params[0]);
    const method = request.method;
    if (path === 'session')
      return HttpResponse.json({
        userId,
        organizationId: id(999),
        canProvision: false,
        hasRecentMfa: true,
        facilities: [{ id: facilityId, name: 'Prishtina · Demo Imaging Center', roles }],
      });
    if (!path.startsWith(`facilities/${facilityId}/`)) return problem(404);
    const route = path.slice(`facilities/${facilityId}/`.length);
    const body = method === 'GET' ? {} : ((await request.json()) as Record<string, unknown>);
    const clinical = !!(roles & 8);
    const admin = !!(roles & 1);
    const visibleOrders = orders.filter(
      (order) =>
        !!(roles & 7) ||
        order.assignedTo === userId ||
        (order.status === 'Acquired' && !order.assignedTo),
    );
    const visiblePatients = patients.filter(
      (patient) =>
        !!(roles & 7) ||
        orders.some((order) => order.patientId === patient.id && order.assignedTo === userId),
    );
    if (route === 'patients/search' || route === 'worklist/search') {
      if (!(roles & 15)) return problem(403);
      const current = Number(body.page ?? 1),
        size = Number(body.pageSize ?? 30);
      if (
        current < 1 ||
        current > 10000 ||
        size < 1 ||
        size > 100 ||
        String(body.search || '').length > 200
      )
        return problem(400);
      const term = String(body.search || '')
        .trim()
        .toLowerCase();
      const paging = new URL(url);
      paging.searchParams.set('page', String(current));
      paging.searchParams.set('pageSize', String(size));
      if (route === 'patients/search')
        return page(
          visiblePatients
            .filter((patient) =>
              `${patient.displayName} ${patient.identifier} ${patient.identifierIssuer}`
                .toLowerCase()
                .includes(term),
            )
            .sort((a, b) => a.displayName.localeCompare(b.displayName) || a.id.localeCompare(b.id)),
          paging,
        );
      if (body.createdFrom && body.createdTo && String(body.createdFrom) >= String(body.createdTo))
        return problem(400);
      const result = visibleOrders
        .map((order) => context(order, roles))
        .filter(
          ({ order, patient }) =>
            (!body.status || order.status === body.status) &&
            (!body.modality || order.modality === body.modality) &&
            (!body.priority || order.priority === body.priority) &&
            (body.assignment !== 'Mine' || order.assignedTo === userId) &&
            (body.assignment !== 'Unassigned' || !order.assignedTo) &&
            (body.assignment !== 'Assigned' || !!order.assignedTo) &&
            (!body.assignedTo || order.assignedTo === body.assignedTo) &&
            (!body.createdFrom || order.createdAt >= Date.parse(String(body.createdFrom))) &&
            (!body.createdTo || order.createdAt < Date.parse(String(body.createdTo))) &&
            (!term ||
              order.id.toLowerCase() === term ||
              `${order.bodyRegion} ${order.modality}`.toLowerCase().includes(term) ||
              (patient &&
                `${patient.displayName} ${patient.identifier} ${patient.identifierIssuer}`
                  .toLowerCase()
                  .includes(term))),
        )
        .sort(
          (a, b) =>
            (body.sort === 'UrgentFirst'
              ? Number(b.order.priority === 'Urgent') - Number(a.order.priority === 'Urgent')
              : 0) ||
            (body.sort === 'CreatedAsc'
              ? a.order.createdAt - b.order.createdAt
              : b.order.createdAt - a.order.createdAt) ||
            a.order.id.localeCompare(b.order.id),
        );
      return page(result, paging);
    }
    if (route.startsWith('patients/') && method === 'GET') {
      if (!(roles & 15)) return problem(403);
      const patient = visiblePatients.find((value) => value.id === route.split('/')[1]);
      return patient ? HttpResponse.json(patient) : problem(404);
    }
    if (route.endsWith('/context') && route.startsWith('imaging-orders/') && method === 'GET') {
      if (!(roles & 15)) return problem(403);
      const order = visibleOrders.find((value) => value.id === route.split('/')[1]);
      return order ? HttpResponse.json(context(order, roles)) : problem(404);
    }
    if (route === 'patients') {
      if (!(roles & 15)) return problem(403);
      if (method === 'GET') return page(patients, url);
      if (!(roles & 3)) return problem(403);
      const value = { ...entity(1000 + patients.length), ...body } as Patient;
      patients.unshift(value);
      record('Patient.Created', value.id);
      return HttpResponse.json(value, { status: 201 });
    }
    if (route === 'worklist') {
      if (!(roles & 15)) return problem(403);
      return page(
        orders.filter(
          (o) => !url.searchParams.get('status') || o.status === url.searchParams.get('status'),
        ),
        url,
      );
    }
    if (route === 'imaging-orders' && method === 'POST') {
      if (!(roles & 3)) return problem(403);
      if (!patients.some((patient) => patient.id === body.patientId) || !body.bodyRegion)
        return problem(400);
      const order: Order = {
        ...entity(8000 + orders.length),
        patientId: String(body.patientId),
        modality: String(body.modality),
        bodyRegion: String(body.bodyRegion),
        referral: String(body.referral || ''),
        priority: String(body.priority || 'Routine'),
        status: 'Requested',
        assignedTo: null,
      };
      orders.unshift(order);
      record('Order.Created', order.id);
      return HttpResponse.json(order, { status: 201 });
    }
    if (route === 'templates') {
      if (!(roles & 9)) return problem(403);
      if (method === 'GET') return HttpResponse.json(templates);
      if (!admin) return problem(403);
      const value = { ...entity(1500 + templates.length), ...body, published: false } as Template;
      templates.push(value);
      record('Template.Created', value.id);
      return HttpResponse.json(value, { status: 201 });
    }
    if (route.startsWith('templates/')) {
      if (!admin || !clinical) return problem(403);
      const template = templates.find((t) => t.id === route.split('/')[1]);
      if (!template) return problem(404);
      if (body.expectedToken !== template.concurrencyToken) return problem(409);
      template.published = route.endsWith('/publish');
      template.concurrencyToken = crypto.randomUUID();
      record('Template.PublicationChanged', template.id);
      return HttpResponse.json(template);
    }
    if (route === 'audit') {
      if (!(roles & 17)) return problem(403);
      return page(audit, url);
    }
    if (route === 'metrics') {
      if (!admin) return problem(403);
      return HttpResponse.json({
        ordersByStatus: [...new Set(orders.map((o) => o.status))].map((status) => ({
          status,
          count: orders.filter((o) => o.status === status).length,
        })),
        pendingOutbox: 0,
      });
    }
    if (route === 'memberships' || route === 'equipment') {
      if (!admin) return problem(403);
      if (route === 'memberships' && (body.userId === userId || !body.roles)) return problem(400);
      record('Administration.Changed', facilityId);
      return HttpResponse.json({ ...entity(9999), ...body });
    }
    if (route === 'archives') {
      if (!(roles & 12)) return problem(403);
      return HttpResponse.json([]);
    }
    if (route.startsWith('studies/') && import.meta.env.VITE_ENABLE_VIEWER_PROOF === 'true') {
      const [, studyId, action] = route.split('/');
      const order = orders.find((item) => id(8000 + Number(item.id.slice(-4))) === studyId);
      if (!order) return problem(404);
      if (!(roles & 4) && !(clinical && order.assignedTo === userId)) return problem(403);
      const kind = viewerKind(order);
      const context = demoContext(kind, studyId);
      if (action === 'dicomweb') return HttpResponse.json(fixture(kind).instances);
      if (action === 'viewer-frames' && method === 'POST') {
        // Mirrors the backend rejecting a frame in an unsupported transfer syntax.
        if (fixture(kind).transferSyntax) return problem(503);
        const index = context.instances.findIndex(
          (entry) =>
            entry.sopInstanceUid === body.sopInstanceUid &&
            entry.seriesInstanceUid === body.seriesInstanceUid,
        );
        if (index < 0 || body.frameNumber !== 1 || body.expectedMetadataHash !== 'A'.repeat(64))
          return problem(409);
        return new HttpResponse(pixels(index, kind).buffer as ArrayBuffer, {
          headers: { 'Content-Type': 'application/octet-stream' },
        });
      }
      return problem(404);
    }
    if (route.startsWith('imaging-orders/')) {
      const [, orderId, action] = route.split('/');
      const order = orders.find((o) => o.id === orderId);
      if (!order) return problem(404);
      if (action === 'viewer-context' && import.meta.env.VITE_ENABLE_VIEWER_PROOF === 'true') {
        if (!(roles & 4) && !(clinical && order.assignedTo === userId)) return problem(403);
        const studyId = id(8000 + Number(order.id.slice(-4)));
        if (body.studyId !== studyId || !['CT', 'DX', 'XR'].includes(order.modality))
          return problem(404);
        return HttpResponse.json(demoContext(viewerKind(order), studyId));
      }
      if (action === 'studies') {
        if (!(roles & 4) && !(clinical && order.assignedTo === userId)) return problem(403);
        return method === 'GET'
          ? HttpResponse.json(
              import.meta.env.VITE_ENABLE_VIEWER_PROOF === 'true' &&
                ['CT', 'DX', 'XR'].includes(order.modality)
                ? [
                    {
                      ...entity(8000 + Number(order.id.slice(-4))),
                      orderId: order.id,
                      archiveKey: 'SYNTHETIC-VIEWER-PROOF',
                      studyInstanceUid: fixture(viewerKind(order)).studyInstanceUid,
                      verifiedBy: userId,
                    },
                  ]
                : [],
            )
          : problem(503);
      }
      if (action === 'reports' && method === 'GET') {
        if (!clinical || order.assignedTo !== userId) return problem(403);
        return HttpResponse.json(
          Object.values(reports)
            .filter((d) => d.report.orderId === orderId)
            .map((d) => d.report),
        );
      }
      if (body.expectedToken !== order.concurrencyToken) return problem(409);
      if (action === 'claim') {
        if (!clinical) return problem(403);
        if (order.status !== 'Acquired' || order.assignedTo) return problem(409);
        order.status = 'InReview';
        order.assignedTo = userId;
      } else if (action === 'reports') {
        if (!clinical || order.assignedTo !== userId) return problem(403);
        if (order.status !== 'InReview') return problem(409);
        const report: Report = {
          ...entity(2000 + Object.keys(reports).length),
          orderId,
          status: 'Draft',
          currentVersion: 0,
          checkedTranscriptId: null,
          kind: 0,
        };
        reports[report.id] = { report, versions: [], signatures: [], addenda: [] };
        order.status = 'ReportDraft';
        order.concurrencyToken = crypto.randomUUID();
        record('Report.Created', report.id);
        return HttpResponse.json(report, { status: 201 });
      } else if (action === 'transition') {
        const next = String(body.status);
        const allowed =
          (roles & 3 &&
            ['Requested', 'Scheduled'].includes(order.status) &&
            ['CheckedIn', 'Cancelled'].includes(next)) ||
          (roles & 4 && order.status === 'CheckedIn' && next === 'Acquired');
        if (!allowed) return problem(403);
        order.status = next as Order['status'];
      } else return problem(404);
      order.concurrencyToken = crypto.randomUUID();
      record(`Order.${action}`, order.id);
      return HttpResponse.json(order);
    }
    if (route.startsWith('reports/')) {
      if (!clinical) return problem(403);
      const [, reportId, action, proposalId] = route.split('/');
      const detail = reports[reportId];
      if (!detail) return problem(404);
      const { report } = detail;
      const order = orders.find((o) => o.id === report.orderId)!;
      if (order.assignedTo !== userId) return problem(403);
      if (!action && method === 'GET') {
        record('Report.Viewed', report.id);
        return HttpResponse.json(detail);
      }
      if (action === 'export') {
        if (report.status !== 'Signed') return problem(409);
        record('Report.Exported', report.id);
        const content = detail.versions.at(-1)!;
        return new HttpResponse(
          'SIGNED SYNTHETIC REPORT\n' +
            content.examination +
            '\n' +
            (content.indication || '') +
            '\n' +
            (content.technique || '') +
            '\n' +
            content.findings +
            '\n' +
            content.impression,
          { headers: { 'Content-Type': 'text/plain' } },
        );
      }
      if (action === 'sign' && signatureReplay.has(String(body.requestKey))) {
        const prior = signatureReplay.get(String(body.requestKey))!;
        return prior.reportId === reportId ? HttpResponse.json(prior.signature) : problem(409);
      }
      if (action !== 'transcripts' && body.expectedToken !== report.concurrencyToken)
        return problem(409);
      if (action === 'addenda') {
        if (report.status !== 'Signed' || report.kind !== 0) return problem(409);
        const value: Report = {
          ...entity(2000 + Object.keys(reports).length),
          orderId: report.orderId,
          status: 'Draft',
          currentVersion: 0,
          checkedTranscriptId: null,
          kind: 1,
          amendmentReason: String(body.reason),
        };
        reports[value.id] = { report: value, versions: [], signatures: [], addenda: [] };
        detail.addenda.push(value);
        record('Report.AddendumCreated', value.id);
        return HttpResponse.json(value, { status: 201 });
      }
      if (report.status === 'Signed') return problem(409);
      if (action === 'drafts') {
        if (
          !body.examination ||
          !body.findings ||
          !body.impression ||
          !['en', 'sq'].includes(String(body.language))
        )
          return problem(400);
        const version = demoRevision(detail, body);
        if (!version) return problem(400);
        report.currentVersion++;
        report.status = 'Draft';
        detail.versions.push(version);
      } else if (action === 'submit') {
        if (report.status !== 'Draft' || !report.currentVersion) return problem(409);
        report.status = 'PendingReview';
      } else if (action === 'sign') {
        if (report.status !== 'PendingReview') return problem(409);
        report.status = 'Signed';
        order.status = 'Signed';
        const signature = {
          ...entity(4000 + audit.length),
          reportVersionId: detail.versions.at(-1)!.id,
          signedBy: userId,
          contentHash: 'SYNTHETIC-DEMO-DIGEST-NOT-A-REAL-SIGNATURE',
        };
        detail.signatures.push(signature);
        signatureReplay.set(String(body.requestKey), { reportId, signature });
        report.concurrencyToken = crypto.randomUUID();
        record('Report.Signed', reportId);
        return HttpResponse.json(signature);
      } else if (action === 'transcripts') {
        if (
          !body.confirmedByRadiologist ||
          !body.originalText ||
          !body.checkedText ||
          !['en', 'sq'].includes(String(body.language))
        )
          return problem(400);
        const transcript = {
          ...entity(5000 + audit.length),
          id: id(5000 + audit.length),
          reportId,
          originalText: String(body.originalText),
          checkedText: String(body.checkedText),
          language: String(body.language),
          checkedBy: userId,
        };
        transcripts[transcript.id] = transcript;
        report.checkedTranscriptId = transcript.id;
        report.concurrencyToken = crypto.randomUUID();
        record('Transcript.Checked', reportId);
        return HttpResponse.json(transcript, { status: 201 });
      } else if (action === 'ai-draft') {
        if (!report.checkedTranscriptId || body.transcriptId !== report.checkedTranscriptId)
          return problem(409);
        const transcript = transcripts[String(body.transcriptId)];
        const template = templates.find((t) => t.id === body.templateId && t.published);
        if (!transcript || transcript.reportId !== reportId || !template) return problem(404);
        if (
          template.modality !== order.modality ||
          template.bodyRegion !== order.bodyRegion ||
          template.language !== transcript.language
        )
          return problem(400);
        const proposal: DemoProposal = {
          ...entity(6000 + audit.length),
          reportId,
          transcriptId: transcript.id,
          templateId: template.id,
          baseVersion: report.currentVersion,
          baseConcurrencyToken: report.concurrencyToken,
          templateToken: template.concurrencyToken,
          findings: transcript.checkedText,
          provider: 'verbatim-assistant',
          modelVersion: '1.0',
          promptVersion: 'report-v1',
          schemaVersion: '1',
          sourcesJson: JSON.stringify([
            {
              DocumentId: template.id,
              Id: `${template.id}:v${template.version}`,
              TemplateVersion: template.version,
              TemplateToken: template.concurrencyToken,
            },
          ]),
          status: 'PendingReview',
        };
        proposals[proposal.id] = proposal;
        record('Proposal.Generated', reportId);
        return HttpResponse.json(proposal);
      } else if (action === 'proposals') {
        const proposal = proposals[proposalId];
        if (!proposal || proposal.reportId !== reportId) return problem(404);
        if (proposal.status !== 'PendingReview') return problem(409);
        if (body.accept) {
          const template = templates.find((t) => t.id === proposal.templateId && t.published);
          if (
            proposal.baseVersion !== report.currentVersion ||
            proposal.baseConcurrencyToken !== report.concurrencyToken ||
            !template ||
            template.concurrencyToken !== proposal.templateToken
          )
            return problem(409);
          if (!body.examination || !body.impression) return problem(400);
          const version = demoRevision(
            detail,
            {
              ...body,
              findings: proposal.findings,
              language: transcripts[proposal.transcriptId].language,
            },
            proposal,
          );
          if (!version) return problem(400);
          report.currentVersion++;
          report.status = 'Draft';
          detail.versions.push(version);
          report.concurrencyToken = crypto.randomUUID();
        }
        proposal.status = body.accept ? 'Accepted' : 'Rejected';
        record('Proposal.Reviewed', reportId);
        return HttpResponse.json({ report, proposal });
      } else return problem(404);
      report.concurrencyToken = crypto.randomUUID();
      record(`Report.${action}`, reportId);
      return HttpResponse.json(report);
    }
    return problem(404);
  }),
];
