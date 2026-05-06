import { NextResponse } from 'next/server';
import {
  normalizeCorrectionRecordPayload,
  validateBackendReadyCorrectionRecord,
} from '../../../features/woc/persistence/correctionRecordValidation';

const MAX_STUB_BATCH_SIZE = 25;

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        acceptedCount: 0,
        rejectedCount: 1,
        persisted: false,
        message: 'Invalid JSON payload. Backend sync stub only. No database persistence yet.',
        errors: ['Request body must be valid JSON.'],
      },
      { status: 400 },
    );
  }

  const records = normalizeCorrectionRecordPayload(payload);

  if (records.length === 0) {
    return NextResponse.json(
      {
        success: false,
        acceptedCount: 0,
        rejectedCount: 0,
        persisted: false,
        message: 'No records were provided. Backend sync stub only. No database persistence yet.',
        errors: ['At least one correction record is required.'],
      },
      { status: 400 },
    );
  }

  if (records.length > MAX_STUB_BATCH_SIZE) {
    return NextResponse.json(
      {
        success: false,
        acceptedCount: 0,
        rejectedCount: records.length,
        persisted: false,
        message: 'Batch is too large for the M18 backend sync stub. No database persistence yet.',
        errors: [`Maximum stub batch size is ${MAX_STUB_BATCH_SIZE} records.`],
      },
      { status: 413 },
    );
  }

  const validationResults = records.map((record, index) => ({
    index,
    ...validateBackendReadyCorrectionRecord(record),
  }));
  const rejected = validationResults.filter((result) => !result.valid);
  const acceptedCount = records.length - rejected.length;

  if (rejected.length > 0) {
    return NextResponse.json(
      {
        success: false,
        acceptedCount,
        rejectedCount: rejected.length,
        persisted: false,
        message: 'One or more correction records failed validation. Backend sync stub only. No database persistence yet.',
        errors: rejected.map((result) => ({
          index: result.index,
          errors: result.errors,
        })),
      },
      { status: 400 },
    );
  }

  return NextResponse.json({
    success: true,
    acceptedCount,
    rejectedCount: 0,
    persisted: false,
    message: 'Backend sync stub only. No database persistence yet.',
  });
}
