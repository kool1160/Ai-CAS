import {
  CORRECTION_RECORD_SCHEMA_VERSION,
  CORRECTION_RECORD_SOURCE,
  type BackendReadyCorrectionRecord,
  type CorrectionRecordStatus,
  type CorrectionRecordType,
} from './correctionRecordTypes';

export type CorrectionRecordValidationResult = {
  valid: boolean;
  errors: string[];
};

const validRecordTypes: CorrectionRecordType[] = ['Draft', 'Sent', 'History'];
const validStatuses: CorrectionRecordStatus[] = ['Draft', 'Sent', 'Completed / Sent Placeholder'];

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function addRequiredStringError(errors: string[], record: Record<string, unknown>, key: string) {
  if (!stringValue(record[key])) {
    errors.push(`${key} is required.`);
  }
}

export function validateBackendReadyCorrectionRecord(value: unknown): CorrectionRecordValidationResult {
  const errors: string[] = [];

  if (!isObject(value)) {
    return {
      valid: false,
      errors: ['Record must be an object.'],
    };
  }

  addRequiredStringError(errors, value, 'recordId');
  addRequiredStringError(errors, value, 'createdTimestamp');
  addRequiredStringError(errors, value, 'workOrderNumber');
  addRequiredStringError(errors, value, 'partNumber');
  addRequiredStringError(errors, value, 'affectedArea');
  addRequiredStringError(errors, value, 'correctionType');
  addRequiredStringError(errors, value, 'reportText');
  addRequiredStringError(errors, value, 'emailDraftText');

  const recordType = stringValue(value.recordType);
  if (!validRecordTypes.includes(recordType as CorrectionRecordType)) {
    errors.push('recordType must be Draft, Sent, or History.');
  }

  const status = stringValue(value.status);
  if (!validStatuses.includes(status as CorrectionRecordStatus)) {
    errors.push('status must be Draft, Sent, or Completed / Sent Placeholder.');
  }

  if (!isObject(value.submittedBy)) {
    errors.push('submittedBy is required.');
  } else {
    addRequiredStringError(errors, value.submittedBy, 'displayName');
    addRequiredStringError(errors, value.submittedBy, 'emailOrEmployeeId');
  }

  if (value.source !== CORRECTION_RECORD_SOURCE) {
    errors.push(`source must be ${CORRECTION_RECORD_SOURCE}.`);
  }

  if (value.schemaVersion !== CORRECTION_RECORD_SCHEMA_VERSION) {
    errors.push(`schemaVersion must be ${CORRECTION_RECORD_SCHEMA_VERSION}.`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export function isBackendReadyCorrectionRecord(value: unknown): value is BackendReadyCorrectionRecord {
  return validateBackendReadyCorrectionRecord(value).valid;
}

export function normalizeCorrectionRecordPayload(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;

  if (isObject(payload) && Array.isArray(payload.records)) {
    return payload.records;
  }

  return [payload];
}
