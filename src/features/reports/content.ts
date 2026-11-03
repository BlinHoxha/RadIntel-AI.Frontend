import type { Content } from '../../shared/api/types';

type SavedContent = Omit<Content, 'indication' | 'technique'> & {
  indication?: string | null;
  technique?: string | null;
};

// Pick editable sections explicitly; server IDs, author and provenance never become form authority.
export function editableContent(value?: SavedContent): Content {
  return {
    examination: value?.examination ?? '',
    findings: value?.findings ?? '',
    impression: value?.impression ?? '',
    language: value?.language ?? 'en',
    indication: value?.indication ?? '',
    technique: value?.technique ?? '',
  };
}
