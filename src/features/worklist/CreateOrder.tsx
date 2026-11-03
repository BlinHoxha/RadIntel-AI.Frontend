import { useState } from 'react';
import type { Patient } from '../../shared/api/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../shared/auth/Auth';
import { facilityPath, request } from '../../shared/api/client';
import { ErrorBox, Modal } from '../../shared/ui';
import { usePatients } from '../patients/queries';
const schema = z.object({
  patientId: z.string().uuid(),
  modality: z.string().min(1).max(20),
  bodyRegion: z.string().trim().min(1).max(100),
  referral: z.string().max(4000),
  priority: z.enum(['Routine', 'Urgent']),
});
type Values = z.infer<typeof schema>;
export function CreateOrder({ onClose }: { onClose: () => void }) {
  const { facilityId } = useAuth();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Patient>();
  const patients = usePatients(page, search);
  const queries = useQueryClient();
  const {
    register,
    watch,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { modality: 'CT', priority: 'Routine', referral: '' },
  });
  const mutation = useMutation({
    mutationFn: (values: Values) =>
      request(facilityPath(facilityId, 'imaging-orders'), 'POST', values),
    onSuccess: () => {
      void queries.invalidateQueries({ queryKey: [facilityId, 'worklist'] });
      onClose();
    },
  });
  return (
    <Modal title="Create imaging order" onClose={onClose}>
      <form onSubmit={handleSubmit((values) => mutation.mutate(values))}>
        <label>
          Find patient by name or ID
          <input
            maxLength={200}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>
        <label>
          Registered patient
          <select
            aria-label="Registered patient"
            value={watch('patientId') || ''}
            {...register('patientId', {
              onChange: (event) =>
                setSelected(
                  patients.data?.items.find((patient) => patient.id === event.target.value),
                ),
            })}
          >
            <option value="">Choose a patient</option>
            {selected && !patients.data?.items.some((patient) => patient.id === selected.id) && (
              <option value={selected.id}>
                {selected.displayName} - {selected.identifier}
              </option>
            )}
            {patients.data?.items.map((patient) => (
              <option key={patient.id} value={patient.id}>
                {patient.displayName} · {patient.identifier}
              </option>
            ))}
          </select>
          {errors.patientId && <span className="field-error">Choose a registered patient.</span>}
        </label>
        <div className="pagination">
          <button
            type="button"
            disabled={page === 1 || patients.isFetching}
            onClick={() => setPage(page - 1)}
          >
            Previous patients
          </button>
          <span>
            Page {page} - {patients.data?.total ?? 0} matches
          </span>
          <button
            type="button"
            disabled={!patients.data || page * 30 >= patients.data.total || patients.isFetching}
            onClick={() => setPage(page + 1)}
          >
            Next patients
          </button>
        </div>
        <label>
          Modality
          <select {...register('modality')}>
            {['CT', 'MR', 'XR', 'US'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          Body region
          <input maxLength={100} {...register('bodyRegion')} />
          {errors.bodyRegion && <span className="field-error">Body region is required.</span>}
        </label>
        <label>
          Referral
          <textarea maxLength={4000} {...register('referral')} />
        </label>
        <label>
          Priority
          <select {...register('priority')}>
            <option>Routine</option>
            <option>Urgent</option>
          </select>
        </label>
        {patients.error && <ErrorBox error={patients.error} />}{' '}
        {mutation.error && <ErrorBox error={mutation.error} />}
        <button className="primary" disabled={mutation.isPending || patients.isPending}>
          Create imaging order
        </button>
      </form>
    </Modal>
  );
}
