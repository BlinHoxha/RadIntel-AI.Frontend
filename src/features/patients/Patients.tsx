import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, UserRound } from 'lucide-react';
import { PageHeading, SearchField } from '../../app/App';
import { useAuth } from '../../shared/auth/Auth';
import { facilityPath, request } from '../../shared/api/client';
import { Empty, ErrorBox, Loading, Modal } from '../../shared/ui';
import { usePatients } from './queries';
const patientSchema = z.object({
  displayName: z.string().trim().min(1).max(200),
  identifier: z.string().trim().min(1).max(100),
  identifierIssuer: z.string().trim().min(1).max(100),
  birthDate: z.string(),
});
type Values = z.infer<typeof patientSchema>;
export function Patients({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (value: string) => void;
}) {
  const [page, setPage] = useState(1);
  const [adding, setAdding] = useState(false);
  const [pageSearch, setPageSearch] = useState(search);
  if (pageSearch !== search) {
    setPageSearch(search);
    setPage(1);
  }
  const query = usePatients(page, search);
  const auth = useAuth();
  const queries = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(patientSchema) });
  const create = useMutation({
    mutationFn: (values: Values) =>
      request(facilityPath(auth.facilityId, 'patients'), 'POST', {
        ...values,
        birthDate: values.birthDate || null,
      }),
    onSuccess: () => {
      void queries.invalidateQueries({ queryKey: [auth.facilityId, 'patients'] });
      setAdding(false);
    },
  });
  const visible = query.data?.items || [];
  return (
    <>
      <PageHeading
        eyebrow="PATIENT REGISTRY"
        title="Context for better care."
        description="Authorized patient records within your institution."
      >
        {!!(auth.roles & 3) && (
          <button className="primary desktop-action" onClick={() => setAdding(true)}>
            <Plus size={18} />
            Register patient
          </button>
        )}
      </PageHeading>
      <section className="panel">
        <div className="filterbar">
          <SearchField value={search} onChange={setSearch} />
          <span className="muted">
            Matching authorized records · {query.data?.total || 0} records
          </span>
        </div>
        {query.isPending ? (
          <Loading />
        ) : query.error ? (
          <ErrorBox error={query.error} />
        ) : (
          <div className="patient-grid">
            {visible.map((patient) => (
              <article className="patient-card" key={patient.id}>
                <span className="patient-avatar">
                  <UserRound size={22} />
                </span>
                <h2>{patient.displayName}</h2>
                <dl>
                  <dt>Patient ID</dt>
                  <dd>{patient.identifier}</dd>
                  <dt>Issuer</dt>
                  <dd>{patient.identifierIssuer}</dd>
                  <dt>Date of birth</dt>
                  <dd>{patient.birthDate || 'Not recorded'}</dd>
                </dl>
              </article>
            ))}
            {!visible.length && <Empty />}
          </div>
        )}
        <div className="table-footer">
          <span>Page {page}</span>
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
      {adding && (
        <Modal title="Register patient" onClose={() => setAdding(false)}>
          <form onSubmit={handleSubmit((values) => create.mutate(values))}>
            {(['displayName', 'identifier', 'identifierIssuer', 'birthDate'] as const).map(
              (name) => (
                <label key={name}>
                  {
                    {
                      displayName: 'Display name',
                      identifier: 'Patient identifier',
                      identifierIssuer: 'Identifier issuer',
                      birthDate: 'Date of birth',
                    }[name]
                  }
                  <input
                    type={name === 'birthDate' ? 'date' : 'text'}
                    max={name === 'birthDate' ? new Date().toISOString().slice(0, 10) : undefined}
                    {...register(name)}
                  />
                  {errors[name] && <span className="field-error">{errors[name]?.message}</span>}
                </label>
              ),
            )}
            {create.error && <ErrorBox error={create.error} />}
            <button className="primary" disabled={create.isPending}>
              Register patient
            </button>
          </form>
        </Modal>
      )}
    </>
  );
}
