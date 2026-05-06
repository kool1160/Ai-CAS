import type { BackendReadyCorrectionRecord } from './correctionRecordTypes';

export type CorrectionRecordSyncStubResponse = {
  success: boolean;
  acceptedCount: number;
  rejectedCount: number;
  persisted: false;
  message: string;
  errors?: unknown;
};

export async function submitCorrectionRecordsToBackendStub(
  records: BackendReadyCorrectionRecord | BackendReadyCorrectionRecord[],
): Promise<CorrectionRecordSyncStubResponse> {
  const payload = Array.isArray(records) ? { records } : records;
  const response = await fetch('/api/correction-records', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseBody = await response.json();

  return {
    success: Boolean(responseBody?.success),
    acceptedCount: typeof responseBody?.acceptedCount === 'number' ? responseBody.acceptedCount : 0,
    rejectedCount: typeof responseBody?.rejectedCount === 'number' ? responseBody.rejectedCount : 0,
    persisted: false,
    message:
      typeof responseBody?.message === 'string'
        ? responseBody.message
        : response.ok
          ? 'Backend sync stub accepted records. No database persistence yet.'
          : 'Backend sync stub rejected records. No database persistence yet.',
    errors: responseBody?.errors,
  };
}
