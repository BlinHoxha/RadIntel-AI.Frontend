import type { components } from './generated';

// UI projections of generated wire models; server enums and member types have one source.
type Schemas = components['schemas'];
type Mutable<T> = { -readonly [K in keyof T]: T[K] };
type Model<K extends keyof Schemas> = Mutable<Schemas[K]>;
export type Entity = Pick<
  Model<'ImagingOrder'>,
  'id' | 'concurrencyToken' | 'createdAt' | 'facilityId'
>;
export type OrderStatus = Schemas['OrderStatus'];
export type Facility = Schemas['FacilityAccessResponse'];
export type Session = Schemas['SessionResponse'];
export type Patient = Entity &
  Pick<Model<'Patient'>, 'displayName' | 'identifier' | 'identifierIssuer' | 'birthDate'>;
export type Order = Entity &
  Pick<
    Model<'ImagingOrder'>,
    'patientId' | 'modality' | 'bodyRegion' | 'referral' | 'priority' | 'status' | 'assignedTo'
  >;
export type Content = Pick<Model<'ReportVersion'>, 'examination' | 'findings' | 'impression'> & {
  language: 'en' | 'sq';
  indication?: string;
  technique?: string;
};
export type Report = Entity &
  Pick<Model<'Report'>, 'orderId' | 'status' | 'currentVersion' | 'checkedTranscriptId' | 'kind'> &
  Partial<Pick<Model<'Report'>, 'amendmentReason' | 'parentReportId'>>;
export type Version = Entity &
  Omit<Content, 'indication' | 'technique'> &
  Pick<
    Model<'ReportVersion'>,
    | 'reportId'
    | 'number'
    | 'authorId'
    | 'contentSchemaVersion'
    | 'indication'
    | 'technique'
    | 'provenance'
  >;
export type Signature = Entity &
  Pick<Model<'Signature'>, 'reportVersionId' | 'signedBy' | 'contentHash'>;
export type ReportDetail = {
  report: Report;
  versions: Version[];
  signatures: Signature[];
  addenda: Report[];
};
export type Template = Entity &
  Pick<
    Model<'ReportTemplate'>,
    'name' | 'language' | 'modality' | 'bodyRegion' | 'structure' | 'version' | 'published'
  >;
export type Proposal = Entity &
  Pick<
    Model<'AIProposal'>,
    | 'findings'
    | 'provider'
    | 'modelVersion'
    | 'promptVersion'
    | 'schemaVersion'
    | 'sourcesJson'
    | 'status'
  >;
export type Study = Entity &
  Pick<Model<'ImagingStudy'>, 'archiveKey' | 'studyInstanceUid' | 'orderId'>;
export type Audit = Entity &
  Pick<Model<'AuditEvent'>, 'action' | 'actorId' | 'entityId' | 'reason'>;
export type Page<T> = Pick<Schemas['PatientPageResult'], 'page' | 'pageSize' | 'total'> & {
  items: T[];
};
export const Role = {
  Administrator: 1,
  Scheduler: 2,
  Technician: 4,
  Radiologist: 8,
  Auditor: 16,
} as const;

export type OrderContext = Omit<Model<'OrderContextResponse'>, 'order' | 'patient'> & {
  order: Order;
  patient: Patient | null;
};
