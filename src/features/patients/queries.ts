import { useDebounced } from '../../shared/useDebounced';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../shared/auth/Auth';
import { facilityPath, request } from '../../shared/api/client';
import type { Page, Patient } from '../../shared/api/types';

export function usePatients(page = 1, search = '') {
  const { facilityId } = useAuth();
  const term = useDebounced(search);
  return useQuery({
    queryKey: [facilityId, 'patients', page, term],
    queryFn: ({ signal }) =>
      request<Page<Patient>>(
        facilityPath(facilityId, 'patients/search'),
        'POST',
        { page, pageSize: 30, search: term },
        signal,
      ),
  });
}
