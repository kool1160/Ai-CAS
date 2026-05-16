import { PHOTO_EVIDENCE_STORAGE_KEY } from './wocStorageKeys';

export const ACCEPTED_FUTURE_EVIDENCE_ATTACHMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const MAX_FUTURE_EVIDENCE_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export type AcceptedFutureEvidenceAttachmentType = (typeof ACCEPTED_FUTURE_EVIDENCE_ATTACHMENT_TYPES)[number];

export type EvidenceAttachmentMetadata = {
  evidenceAttached: boolean;
  evidenceFileName?: string;
  evidenceFileType?: string;
  evidenceFileSize?: number;
};

export type EvidenceAttachmentPreparation = {
  evidenceAttached: boolean;
  evidenceFileName: string;
  evidenceFileType: string;
  evidenceFileSize: number;
  evidenceAttachmentReady: boolean;
  evidenceAttachmentIncluded: false;
  evidenceAttachmentStatus: string;
};

export function formatEvidenceFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return 'unknown size';
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function isAcceptedFutureEvidenceAttachmentType(fileType: string) {
  return ACCEPTED_FUTURE_EVIDENCE_ATTACHMENT_TYPES.includes(fileType as AcceptedFutureEvidenceAttachmentType);
}

export function isWithinFutureEvidenceAttachmentSizeLimit(fileSize: number) {
  return Number.isFinite(fileSize) && fileSize > 0 && fileSize <= MAX_FUTURE_EVIDENCE_ATTACHMENT_BYTES;
}

export function prepareEvidenceAttachment(metadata: EvidenceAttachmentMetadata | null | undefined): EvidenceAttachmentPreparation {
  if (!metadata?.evidenceAttached) {
    return {
      evidenceAttached: false,
      evidenceFileName: '',
      evidenceFileType: '',
      evidenceFileSize: 0,
      evidenceAttachmentReady: false,
      evidenceAttachmentIncluded: false,
      evidenceAttachmentStatus: 'No photo evidence attached. Photo evidence is not attached to this email.',
    };
  }

  const evidenceFileName = metadata.evidenceFileName?.trim() || 'Photo evidence image';
  const evidenceFileType = metadata.evidenceFileType?.trim() || 'unknown image type';
  const evidenceFileSize = typeof metadata.evidenceFileSize === 'number' ? metadata.evidenceFileSize : 0;
  const acceptedType = isAcceptedFutureEvidenceAttachmentType(evidenceFileType);
  const acceptedSize = isWithinFutureEvidenceAttachmentSizeLimit(evidenceFileSize);
  const evidenceAttachmentReady = acceptedType && acceptedSize;

  let readinessNote = 'Evidence metadata captured. Evidence image available locally during session.';

  if (!acceptedType) {
    readinessNote = `Evidence metadata captured. Future attachment type is not ready because ${evidenceFileType} is not one of the accepted future types.`;
  } else if (!acceptedSize) {
    readinessNote = `Evidence metadata captured. Future attachment size is not ready because ${formatEvidenceFileSize(evidenceFileSize)} exceeds or does not meet the future attachment size rule.`;
  }

  return {
    evidenceAttached: true,
    evidenceFileName,
    evidenceFileType,
    evidenceFileSize,
    evidenceAttachmentReady,
    evidenceAttachmentIncluded: false,
    evidenceAttachmentStatus: `${readinessNote} Email attachment support is not active yet. Photo evidence is not attached to this email.`,
  };
}

export function buildPhotoEvidenceStatusLine(metadata: EvidenceAttachmentMetadata | null | undefined) {
  const preparation = prepareEvidenceAttachment(metadata);

  if (!preparation.evidenceAttached) {
    return preparation.evidenceAttachmentStatus;
  }

  return `Photo evidence attached: ${preparation.evidenceFileName} (${preparation.evidenceFileType}, ${formatEvidenceFileSize(preparation.evidenceFileSize)}). ${preparation.evidenceAttachmentStatus}`;
}

export function loadPhotoEvidenceMetadataFromSession(): EvidenceAttachmentMetadata | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(PHOTO_EVIDENCE_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<EvidenceAttachmentMetadata>;
    if (!parsed.evidenceAttached || typeof parsed.evidenceFileName !== 'string' || !parsed.evidenceFileName.trim()) return null;

    return {
      evidenceAttached: true,
      evidenceFileName: parsed.evidenceFileName.trim(),
      evidenceFileType: typeof parsed.evidenceFileType === 'string' ? parsed.evidenceFileType : '',
      evidenceFileSize: typeof parsed.evidenceFileSize === 'number' ? parsed.evidenceFileSize : 0,
    };
  } catch {
    return null;
  }
}
