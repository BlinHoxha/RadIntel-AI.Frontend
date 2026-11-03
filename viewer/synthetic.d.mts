import type { ViewerContext } from '../src/features/imaging/viewerTransport';
export function fixture(kind?: string): {
  kind: string;
  studyInstanceUid: string;
  patientIdentifier: string;
  issuer: string;
  instances: Record<string, { vr: string; Value: (string | number)[] }>[];
};
export function pixels(index?: number, kind?: string): Uint8Array<ArrayBuffer>;
export function demoContext(kind: string, studyId: string): ViewerContext;
