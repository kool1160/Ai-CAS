'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  clearCurrentUserFromStorage,
  createCurrentUser,
  getSubmittedByLabel,
  loadCurrentUserFromStorage,
  saveCurrentUserToStorage,
} from '../logic/currentUserStorage';
import {
  clearLocalRecordsStorage,
  loadDraftRecordsFromStorage,
  loadHistoryRecordsFromStorage,
  saveDraftRecordsToStorage,
  saveHistoryRecordsToStorage,
} from '../logic/localRecordsStorage';
import {
  defaultSetupConfig,
  loadSetupConfigFromStorage,
  saveSetupConfigToStorage,
} from '../logic/setupConfigStorage';
import { buildLocalEngineeringAnalyticsSummary } from '../persistence/correctionRecordAnalytics';
import {
  createGeneratedPackage,
  defaultWocConfirmations,
  defaultWocCorrectionData,
  getEffectiveAffectedArea,
  getGateStatus,
  otherAffectedAreaOption,
  resetDependentConfirmations,
  type GeneratedCorrectionPackage,
  type WocConfirmationState,
  type WocCorrectionData,
} from '../state/wocDataModel';
import type {
  ActionFeedback,
  CurrentUser,
  DraftRecord,
  ExtractedWorkOrderData,
  ExtractionDebugMetadata,
  HistoryRecord,
  NavItem,
  Screen,
  SetupConfig,
  UploadedFileInfo,
  WorkflowStep,
} from '../types/wocSessionTypes';
import { BottomNav } from './BottomNav';
import { CaptureScreen } from './CaptureScreen';
import { ConfirmScreen } from './ConfirmScreen';
import { DraftsScreen } from './DraftsScreen';
import { GenerateScreen } from './GenerateScreen';
import { HistoryScreen } from './HistoryScreen';
import { HomeScreen } from './HomeScreen';
import { LoginScreen } from './LoginScreen';
import { MoreScreen } from './MoreScreen';
import { ReviewSendScreen } from './ReviewSendScreen';

const bottomNav: NavItem[] = [
  { label: 'Home', screen: 'home' },
  { label: 'Capture Issue', screen: 'capture' },
  { label: 'Drafts', screen: 'drafts' },
  { label: 'History', screen: 'history' },
  { label: 'More', screen: 'more' },
];

const workflow: WorkflowStep[] = [
  ['01', 'Capture Issue', 'Take a photo, upload a file, or use manual entry.'],
  ['02', 'Extract + Confirm', 'Review work order data before it moves forward.'],
  ['03', 'Build Correction', 'Select the correction type and describe the issue.'],
  ['04', 'Generate Draft', 'Create the corrective-action report and draft language.'],
  ['05', 'Confirm + Save', 'Review everything before save or future controlled release actions unlock.'],
];

const stepLabels: Record<Screen, string> = {
  home: 'Home',
  capture: 'Capture Issue',
  confirm: 'Extract + Confirm',
  generate: 'Build Correction',
  review: 'Confirm + Save',
  drafts: 'Drafts',
  history: 'History',
  more: 'More',
};

function buildSendSetupPayload(setupConfig: SetupConfig, currentUser: CurrentUser | null) {
  return {
    recipientEmail: setupConfig.engineeringRecipientEmail,
    senderDisplayName: setupConfig.senderDisplayName,
    submittedByName: currentUser?.displayName || setupConfig.defaultSubmittedByName,
    submittedByEmail: currentUser?.emailOrEmployeeId || setupConfig.defaultSubmittedByEmail,
    companyName: setupConfig.companyName,
  };
}

function normalizePin(value: string) {
  return value.replace(/\D/g, '').slice(0, 4);
}

function safeStringArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];
}

function safeFieldSourceNotes(value: unknown) {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return {};

  return Object.entries(value).reduce<Record<string, string>>((notes, [key, note]) => {
    if (typeof note === 'string') notes[key] = note;
    return notes;
  }, {});
}

export function WocApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [currentUserLoaded, setCurrentUserLoaded] = useState(false);
  const [appUnlocked, setAppUnlocked] = useState(false);
  const [loginDisplayName, setLoginDisplayName] = useState('');
  const [loginEmailOrEmployeeId, setLoginEmailOrEmployeeId] = useState('');
  const [appUnlockPin, setAppUnlockPin] = useState('');
  const [loginFeedback, setLoginFeedback] = useState<ActionFeedback>(null);

  const [wocData, setWocData] = useState<WocCorrectionData>(defaultWocCorrectionData);
  const [confirmations, setConfirmations] = useState<WocConfirmationState>(defaultWocConfirmations);
  const [manualEntry, setManualEntry] = useState('');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [extractionFeedback, setExtractionFeedback] = useState<ActionFeedback>(null);
  const [extractionDebug, setExtractionDebug] = useState<ExtractionDebugMetadata>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const [generatedPackage, setGeneratedPackage] = useState<GeneratedCorrectionPackage>(null);
  const [saveFeedback, setSaveFeedback] = useState<ActionFeedback>(null);
  const [sendFeedback, setSendFeedback] = useState<ActionFeedback>(null);
  const [isSending, setIsSending] = useState(false);
  const [sendPin, setSendPin] = useState('');

  const [draftRecords, setDraftRecords] = useState<DraftRecord[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [draftFinalReviewConfirmed, setDraftFinalReviewConfirmed] = useState(false);
  const [draftActionFeedback, setDraftActionFeedback] = useState<ActionFeedback>(null);
  const [isSendingDraft, setIsSendingDraft] = useState(false);
  const [draftSendPin, setDraftSendPin] = useState('');

  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [localRecordsLoaded, setLocalRecordsLoaded] = useState(false);
  const [localRecordsFeedback, setLocalRecordsFeedback] = useState<ActionFeedback>(null);

  const [setupConfig, setSetupConfig] = useState<SetupConfig>(defaultSetupConfig);
  const [setupCodeInput, setSetupCodeInput] = useState('');
  const [setupUnlocked, setSetupUnlocked] = useState(false);
  const [setupFeedback, setSetupFeedback] = useState<ActionFeedback>(null);

  useEffect(() => {
    return () => {
      if (uploadedFile?.previewUrl) {
        URL.revokeObjectURL(uploadedFile.previewUrl);
      }
    };
  }, [uploadedFile?.previewUrl]);

  useEffect(() => {
    setCurrentUser(loadCurrentUserFromStorage());
    setCurrentUserLoaded(true);
    setDraftRecords(loadDraftRecordsFromStorage());
    setHistoryRecords(loadHistoryRecordsFromStorage());
    setSetupConfig(loadSetupConfigFromStorage());
    setLocalRecordsLoaded(true);
  }, []);

  useEffect(() => {
    if (!localRecordsLoaded) return;
    saveDraftRecordsToStorage(draftRecords);
  }, [draftRecords, localRecordsLoaded]);

  useEffect(() => {
    if (!localRecordsLoaded) return;
    saveHistoryRecordsToStorage(historyRecords);
  }, [historyRecords, localRecordsLoaded]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }, [activeScreen]);

  useEffect(() => {
    if (activeScreen === 'more') return;
    setSetupUnlocked(false);
    setSetupCodeInput('');
  }, [activeScreen]);

  const submittedByLabel = useMemo(() => getSubmittedByLabel(currentUser), [currentUser]);
  const gateStatus = useMemo(() => getGateStatus(wocData, confirmations, generatedPackage), [wocData, confirmations, generatedPackage]);
  const selectedDraft = useMemo(() => draftRecords.find((draft) => draft.draftId === selectedDraftId) ?? null, [draftRecords, selectedDraftId]);
  const selectedHistory = useMemo(() => historyRecords.find((record) => record.historyId === selectedHistoryId) ?? null, [historyRecords, selectedHistoryId]);
  const analyticsSummary = useMemo(
    () => buildLocalEngineeringAnalyticsSummary(draftRecords, historyRecords),
    [draftRecords, historyRecords],
  );

  const clearGeneratedOutput = () => {
    setGeneratedPackage(null);
    setSaveFeedback(null);
    setSendFeedback(null);
    setSendPin('');
  };

  const handleSetupUser = () => {
    if (!loginDisplayName.trim() || !loginEmailOrEmployeeId.trim()) {
      setLoginFeedback({ tone: 'error', message: 'Enter a user name and email or employee ID.' });
      return;
    }

    if (appUnlockPin.length !== 4) {
      setLoginFeedback({ tone: 'error', message: 'Set a 4-digit App PIN.' });
      return;
    }

    const nextUser = createCurrentUser(loginDisplayName, loginEmailOrEmployeeId, appUnlockPin);
    saveCurrentUserToStorage(nextUser);
    setCurrentUser(nextUser);
    setAppUnlocked(true);
    setLoginDisplayName('');
    setLoginEmailOrEmployeeId('');
    setAppUnlockPin('');
    setLoginFeedback(null);
    setActiveScreen('home');
  };

  const handleUnlockApp = () => {
    if (!currentUser) return;

    if (appUnlockPin !== currentUser.appUnlockPin) {
      setLoginFeedback({ tone: 'error', message: 'Incorrect App PIN.' });
      setAppUnlockPin('');
      return;
    }

    setAppUnlocked(true);
    setAppUnlockPin('');
    setLoginFeedback(null);
    setActiveScreen('home');
  };

  const handleResetUser = () => {
    const confirmed = window.confirm('Reset the saved local user? You will need to enter name, ID, and a new App PIN again.');
    if (!confirmed) return;

    clearCurrentUserFromStorage();
    setCurrentUser(null);
    setAppUnlocked(false);
    setAppUnlockPin('');
    setLoginDisplayName('');
    setLoginEmailOrEmployeeId('');
    setLoginFeedback(null);
    setActiveScreen('home');
  };

  const handleLockApp = () => {
    setAppUnlocked(false);
    setAppUnlockPin('');
    setSetupUnlocked(false);
    setSetupCodeInput('');
    setSendPin('');
    setDraftSendPin('');
    setActiveScreen('home');
  };

  const updateWocData = (key: keyof WocCorrectionData, value: string) => {
    setWocData((current) => ({ ...current, [key]: value }));
    setConfirmations((current) => resetDependentConfirmations(current, key, value));
    clearGeneratedOutput();
  };

  const updateAffectedArea = (value: string) => {
    setWocData((current) => ({
      ...current,
      affectedArea: value,
      customAffectedArea: value === otherAffectedAreaOption ? current.customAffectedArea : '',
    }));
    setConfirmations((current) => resetDependentConfirmations(current, 'affectedArea', value));
    clearGeneratedOutput();
  };

  const handleUploadFile = (file: File | null) => {
    setUploadedFile((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);

      setExtractionDebug(null);

      if (!file) {
        setSelectedUploadFile(null);
        setUploadFeedback('No file selected.');
        setExtractionFeedback(null);
        return null;
      }

      const isImage = file.type.startsWith('image/');
      const previewUrl = isImage ? URL.createObjectURL(file) : null;

      setSelectedUploadFile(file);
      setExtractionFeedback(null);
      setUploadFeedback(
        isImage
          ? `${file.name} selected. Ready for Extract Text / Data.`
          : `${file.name} selected. M9 extraction supports uploaded image files only; manual entry is still available.`,
      );

      return { name: file.name, type: file.type, size: file.size, previewUrl, isImage };
    });
  };

  const clearUploadedFile = () => {
    setUploadedFile((current) => {
      if (current?.previewUrl) URL.revokeObjectURL(current.previewUrl);
      return null;
    });
    setSelectedUploadFile(null);
    setExtractionFeedback(null);
    setExtractionDebug(null);
    setUploadFeedback('Uploaded file cleared.');
  };

  const applyExtractedData = (extracted: ExtractedWorkOrderData) => {
    setWocData((current) => ({
      ...current,
      workOrderNumber: extracted.workOrderNumber ?? '',
      partNumber: extracted.partNumber ?? '',
      revision: extracted.revision ?? '',
      partDescription: extracted.partDescription ?? '',
      customerOrJob: extracted.customerOrJob ?? '',
      operationNumber: extracted.operationNumber ?? '',
      routerStepOperation: extracted.routerStepOperation ?? '',
      quantity: extracted.quantity ?? '',
      quantityAffected: extracted.quantityAffected ?? extracted.quantity ?? '',
      dueDateShipDate: extracted.dueDateShipDate ?? '',
      foundAtDepartment: extracted.foundAtDepartment ?? current.foundAtDepartment,
      suspectedFailurePoint: extracted.suspectedFailurePoint ?? current.suspectedFailurePoint,
      shortIssueDescription: extracted.shortIssueDescription ?? current.shortIssueDescription,
      detailedIssueNotes: extracted.detailedIssueNotes ?? current.detailedIssueNotes,
    }));
    setConfirmations((current) => ({
      ...current,
      workOrderDataConfirmed: false,
      partNumberConfirmed: false,
      finalReviewConfirmed: false,
    }));
    clearGeneratedOutput();

    if (extracted.notes?.trim()) {
      setManualEntry(extracted.notes.trim());
    }
  };

  const extractUploadedData = async () => {
    if (!selectedUploadFile || !uploadedFile) {
      setExtractionFeedback({ tone: 'error', message: 'Upload an image before extracting data.' });
      setExtractionDebug(null);
      return;
    }

    if (!uploadedFile.isImage) {
      setExtractionFeedback({ tone: 'error', message: 'M9 extraction supports uploaded image files only. Manual entry remains available.' });
      setExtractionDebug(null);
      return;
    }

    setIsExtracting(true);
    setExtractionDebug(null);
    setExtractionFeedback({ tone: 'success', message: 'Extracting work order data...' });

    try {
      const formData = new FormData();
      formData.append('file', selectedUploadFile);

      const response = await fetch('/api/extract-work-order', { method: 'POST', body: formData });
      const payload = await response.json();

      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Extraction failed. Manual entry remains available.';
        setExtractionFeedback({ tone: 'error', message });
        setExtractionDebug(null);
        return;
      }

      applyExtractedData(payload.extracted ?? {});
      setExtractionDebug({
        extractionSource: typeof payload?.extractionSource === 'string' ? payload.extractionSource : 'unknown',
        extractedKeys: safeStringArray(payload?.extractedKeys),
        missingExpectedFields: safeStringArray(payload?.missingExpectedFields),
        fieldSourceNotes: safeFieldSourceNotes(payload?.fieldSourceNotes),
      });
      setExtractionFeedback({ tone: 'success', message: 'Extraction completed. Review and confirm the extracted fields before continuing.' });
      setActiveScreen('confirm');
    } catch {
      setExtractionFeedback({ tone: 'error', message: 'Extraction could not be completed. Manual entry remains available.' });
      setExtractionDebug(null);
    } finally {
      setIsExtracting(false);
    }
  };

  const confirmWorkOrderData = () => {
    setConfirmations((current) => ({ ...current, workOrderDataConfirmed: Boolean(wocData.workOrderNumber.trim()), finalReviewConfirmed: false }));
  };

  const confirmPartNumber = () => {
    setConfirmations((current) => ({ ...current, partNumberConfirmed: Boolean(wocData.partNumber.trim()), finalReviewConfirmed: false }));
  };

  const confirmAllRequiredData = () => {
    setConfirmations((current) => ({
      ...current,
      workOrderDataConfirmed: Boolean(wocData.workOrderNumber.trim()),
      partNumberConfirmed: Boolean(wocData.partNumber.trim()),
      finalReviewConfirmed: false,
    }));
  };

  const generateDraft = () => {
    if (!gateStatus.generateReady) return;
    setGeneratedPackage(createGeneratedPackage(wocData, submittedByLabel));
    setConfirmations((current) => ({ ...current, finalReviewConfirmed: false }));
    setSaveFeedback(null);
    setSendFeedback(null);
    setSendPin('');
    setActiveScreen('review');
  };

  const setFinalReviewConfirmed = (confirmed: boolean) => {
    setConfirmations((current) => ({ ...current, finalReviewConfirmed: confirmed }));
    setSendFeedback(null);
    setSendPin('');
  };

  const copyTextToClipboard = async (text: string | undefined, label: string, setFeedback: (feedback: ActionFeedback) => void) => {
    if (!text) {
      setFeedback({ tone: 'error', message: `Generate or open a draft before copying the ${label}.` });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setFeedback({ tone: 'success', message: `${label} copied to clipboard.` });
    } catch {
      setFeedback({ tone: 'error', message: `${label} could not be copied. Use manual selection as fallback.` });
    }
  };

  const saveCurrentDraft = () => {
    if (!generatedPackage) {
      setSaveFeedback({ tone: 'error', message: 'Generate a draft before saving.' });
      return;
    }

    try {
      const createdTimestamp = new Date().toLocaleString();
      const draftId = `DRAFT-${String(draftRecords.length + 1).padStart(4, '0')}`;
      const record: DraftRecord = {
        draftId,
        createdTimestamp,
        subjectLine: generatedPackage.subjectLine,
        workOrderNumber: wocData.workOrderNumber,
        partNumber: wocData.partNumber,
        affectedArea: getEffectiveAffectedArea(wocData),
        correctionType: wocData.correctionType,
        reportText: generatedPackage.reportPreview,
        emailDraftText: generatedPackage.emailPreview,
        submittedBy: submittedByLabel,
        submittedById: currentUser?.userId,
        status: 'Draft',
      };

      setDraftRecords((current) => [record, ...current]);
      setSelectedDraftId(record.draftId);
      setDraftFinalReviewConfirmed(false);
      setDraftSendPin('');
      setDraftActionFeedback(null);
      setSaveFeedback({ tone: 'success', message: `${draftId} saved for this browser.` });
    } catch {
      setSaveFeedback({ tone: 'error', message: 'Draft could not be saved. Try again.' });
    }
  };

  const addSentHistoryRecord = (resendId: string | null) => {
    if (!generatedPackage) return;

    const completedTimestamp = new Date().toLocaleString();
    const historyId = `HISTORY-${String(historyRecords.length + 1).padStart(4, '0')}`;
    const record: HistoryRecord = {
      historyId,
      completedTimestamp,
      subjectLine: generatedPackage.subjectLine,
      workOrderNumber: wocData.workOrderNumber,
      partNumber: wocData.partNumber,
      affectedArea: getEffectiveAffectedArea(wocData),
      correctionType: wocData.correctionType,
      reportText: generatedPackage.reportPreview,
      emailDraftText: generatedPackage.emailPreview,
      submittedBy: submittedByLabel,
      submittedById: currentUser?.userId,
      resendId,
      status: 'Sent',
    };

    setHistoryRecords((current) => [record, ...current]);
    setSelectedHistoryId(record.historyId);
  };

  const addSentHistoryRecordFromDraft = (draft: DraftRecord, resendId: string | null) => {
    const completedTimestamp = new Date().toLocaleString();
    const historyId = `HISTORY-${String(historyRecords.length + 1).padStart(4, '0')}`;
    const record: HistoryRecord = {
      historyId,
      completedTimestamp,
      subjectLine: draft.subjectLine,
      workOrderNumber: draft.workOrderNumber,
      partNumber: draft.partNumber,
      affectedArea: draft.affectedArea,
      correctionType: draft.correctionType,
      reportText: draft.reportText,
      emailDraftText: draft.emailDraftText,
      submittedBy: draft.submittedBy || submittedByLabel,
      submittedById: draft.submittedById || currentUser?.userId,
      resendId,
      status: 'Sent',
    };

    setHistoryRecords((current) => [record, ...current]);
    setSelectedHistoryId(record.historyId);
  };

  const sendCorrectionEmail = async () => {
    if (!generatedPackage || !gateStatus.sendReady) {
      setSendFeedback({ tone: 'error', message: 'Final review is required before sending email.' });
      return;
    }

    if (sendPin.length !== 4) {
      setSendFeedback({ tone: 'error', message: 'Enter the 4-digit Send PIN before sending.' });
      return;
    }

    setIsSending(true);
    setSendFeedback({ tone: 'success', message: 'Sending email...' });

    try {
      const response = await fetch('/api/send-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectLine: generatedPackage.subjectLine,
          reportText: generatedPackage.reportPreview,
          emailDraftText: generatedPackage.emailPreview,
          workOrderNumber: wocData.workOrderNumber,
          partNumber: wocData.partNumber,
          affectedArea: getEffectiveAffectedArea(wocData),
          correctionType: wocData.correctionType,
          sendPin,
          ...buildSendSetupPayload(setupConfig, currentUser),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Email send failed. Copy controls remain available.';
        setSendFeedback({ tone: 'error', message });
        setSendPin('');
        return;
      }

      const resendId = typeof payload?.resendId === 'string' ? payload.resendId : null;
      const recipient = typeof payload?.recipient === 'string' ? payload.recipient : 'configured recipient';
      addSentHistoryRecord(resendId);
      setSendFeedback({ tone: 'success', message: `Email sent to ${recipient}.${resendId ? ` Resend ID: ${resendId}` : ''}` });
      setSendPin('');
    } catch {
      setSendFeedback({ tone: 'error', message: 'Email send could not be completed. Copy controls remain available.' });
      setSendPin('');
    } finally {
      setIsSending(false);
    }
  };

  const selectDraft = (draftId: string) => {
    setSelectedDraftId(draftId);
    setDraftFinalReviewConfirmed(false);
    setDraftSendPin('');
    setDraftActionFeedback(null);
  };

  const sendSelectedDraftEmail = async () => {
    if (!selectedDraft) {
      setDraftActionFeedback({ tone: 'error', message: 'Open a saved draft before sending.' });
      return;
    }

    if (!draftFinalReviewConfirmed) {
      setDraftActionFeedback({ tone: 'error', message: 'Final review is required before sending this saved draft.' });
      return;
    }

    if (draftSendPin.length !== 4) {
      setDraftActionFeedback({ tone: 'error', message: 'Enter the 4-digit Send PIN before sending.' });
      return;
    }

    setIsSendingDraft(true);
    setDraftActionFeedback({ tone: 'success', message: 'Sending saved draft email...' });

    try {
      const response = await fetch('/api/send-correction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subjectLine: selectedDraft.subjectLine,
          reportText: selectedDraft.reportText,
          emailDraftText: selectedDraft.emailDraftText,
          workOrderNumber: selectedDraft.workOrderNumber,
          partNumber: selectedDraft.partNumber,
          affectedArea: selectedDraft.affectedArea,
          correctionType: selectedDraft.correctionType,
          sendPin: draftSendPin,
          ...buildSendSetupPayload(setupConfig, currentUser),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Saved draft email send failed. Copy controls remain available.';
        setDraftActionFeedback({ tone: 'error', message });
        setDraftSendPin('');
        return;
      }

      const resendId = typeof payload?.resendId === 'string' ? payload.resendId : null;
      const recipient = typeof payload?.recipient === 'string' ? payload.recipient : 'configured recipient';
      addSentHistoryRecordFromDraft(selectedDraft, resendId);
      setDraftActionFeedback({ tone: 'success', message: `Saved draft sent to ${recipient}.${resendId ? ` Resend ID: ${resendId}` : ''}` });
      setDraftFinalReviewConfirmed(false);
      setDraftSendPin('');
    } catch {
      setDraftActionFeedback({ tone: 'error', message: 'Saved draft email send could not be completed. Copy controls remain available.' });
      setDraftSendPin('');
    } finally {
      setIsSendingDraft(false);
    }
  };

  const lockSetup = (feedbackMessage = 'Setup/Admin locked.') => {
    setSetupUnlocked(false);
    setSetupCodeInput('');
    setSetupFeedback({ tone: 'success', message: feedbackMessage });
  };

  const unlockSetup = async () => {
    setSetupFeedback(null);

    try {
      const response = await fetch('/api/setup/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: setupCodeInput }),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Setup unlock failed.';
        setSetupFeedback({ tone: 'error', message });
        return;
      }

      setSetupUnlocked(true);
      setSetupCodeInput('');
      setSetupFeedback({ tone: 'success', message: 'Setup unlocked for this editing session.' });
    } catch {
      setSetupFeedback({ tone: 'error', message: 'Setup unlock could not be completed.' });
    }
  };

  const updateSetupConfig = (key: keyof SetupConfig, value: string) => {
    setSetupConfig((current) => ({ ...current, [key]: value }));
    setSetupFeedback(null);
  };

  const saveSetupConfig = () => {
    saveSetupConfigToStorage(setupConfig);
    lockSetup('Setup config saved and locked. Re-enter the master code to edit again.');
  };

  const clearLocalRecords = () => {
    const confirmed = window.confirm('Clear all local Drafts and History from this browser? This cannot be undone.');
    if (!confirmed) return;

    clearLocalRecordsStorage();
    setDraftRecords([]);
    setHistoryRecords([]);
    setSelectedDraftId(null);
    setDraftFinalReviewConfirmed(false);
    setDraftSendPin('');
    setDraftActionFeedback(null);
    setSelectedHistoryId(null);
    setLocalRecordsFeedback({ tone: 'success', message: 'Drafts and History were cleared from this browser.' });
  };

  const getFieldConfirmed = (key: keyof WocCorrectionData) => {
    if (key === 'workOrderNumber') return confirmations.workOrderDataConfirmed;
    if (key === 'partNumber') return confirmations.partNumberConfirmed;
    return Boolean(wocData[key].trim());
  };

  const confirmField = (key: keyof WocCorrectionData) => {
    if (key === 'workOrderNumber') confirmWorkOrderData();
    if (key === 'partNumber') confirmPartNumber();
  };

  if (!currentUserLoaded) return null;

  if (!currentUser || !appUnlocked) {
    return (
      <LoginScreen
        savedUser={currentUser}
        displayName={loginDisplayName}
        emailOrEmployeeId={loginEmailOrEmployeeId}
        appUnlockPin={appUnlockPin}
        loginFeedback={loginFeedback}
        onDisplayNameChange={(value) => {
          setLoginDisplayName(value);
          setLoginFeedback(null);
        }}
        onEmailOrEmployeeIdChange={(value) => {
          setLoginEmailOrEmployeeId(value);
          setLoginFeedback(null);
        }}
        onAppUnlockPinChange={(value) => {
          setAppUnlockPin(normalizePin(value));
          setLoginFeedback(null);
        }}
        onSetupUser={handleSetupUser}
        onUnlockApp={handleUnlockApp}
        onResetUser={handleResetUser}
      />
    );
  }

  return (
    <main className="app-shell">
      <div className="app-frame">
        <div className="screen-title">
          <span className="step-pill">AI-CAS · {stepLabels[activeScreen]}</span>
        </div>

        {activeScreen === 'home' && <HomeScreen workflow={workflow} onStartCapture={() => setActiveScreen('capture')} />}
        {activeScreen === 'capture' && (
          <CaptureScreen
            manualEntry={manualEntry}
            uploadedFile={uploadedFile}
            uploadFeedback={uploadFeedback}
            extractionFeedback={extractionFeedback}
            isExtracting={isExtracting}
            onManualEntryChange={setManualEntry}
            onUploadFile={handleUploadFile}
            onClearUpload={clearUploadedFile}
            onExtractData={extractUploadedData}
            onCaptureRouter={() => setActiveScreen('confirm')}
          />
        )}
        {activeScreen === 'confirm' && (
          <ConfirmScreen
            wocData={wocData}
            confirmReady={gateStatus.confirmReady}
            extractionDebug={extractionDebug}
            getFieldConfirmed={getFieldConfirmed}
            onUpdateField={updateWocData}
            onConfirmField={confirmField}
            onConfirmRequired={confirmAllRequiredData}
            onContinue={() => {
              if (gateStatus.confirmReady) setActiveScreen('generate');
            }}
          />
        )}
        {activeScreen === 'generate' && (
          <GenerateScreen
            wocData={wocData}
            generateReady={gateStatus.generateReady}
            onUpdateField={updateWocData}
            onUpdateAffectedArea={updateAffectedArea}
            onGenerateDraft={generateDraft}
          />
        )}
        {activeScreen === 'review' && (
          <ReviewSendScreen
            generatedPackage={generatedPackage}
            submittedBy={submittedByLabel}
            sendReady={gateStatus.sendReady}
            isSending={isSending}
            sendPin={sendPin}
            saveFeedback={saveFeedback}
            sendFeedback={sendFeedback}
            confirmations={confirmations}
            onSaveDraft={saveCurrentDraft}
            onFinalReviewChange={setFinalReviewConfirmed}
            onSendPinChange={(value) => {
              setSendPin(normalizePin(value));
              setSendFeedback(null);
            }}
            onSendEmail={sendCorrectionEmail}
          />
        )}
        {activeScreen === 'drafts' && (
          <DraftsScreen
            draftRecords={draftRecords}
            selectedDraft={selectedDraft}
            draftFinalReviewConfirmed={draftFinalReviewConfirmed}
            isSendingDraft={isSendingDraft}
            draftSendPin={draftSendPin}
            draftActionFeedback={draftActionFeedback}
            onSelectDraft={selectDraft}
            onCopyDraftReport={() => copyTextToClipboard(selectedDraft?.reportText, 'Saved draft report', setDraftActionFeedback)}
            onCopyDraftEmail={() => copyTextToClipboard(selectedDraft?.emailDraftText, 'Saved draft email', setDraftActionFeedback)}
            onDraftFinalReviewChange={(confirmed) => {
              setDraftFinalReviewConfirmed(confirmed);
              setDraftSendPin('');
              setDraftActionFeedback(null);
            }}
            onDraftSendPinChange={(value) => {
              setDraftSendPin(normalizePin(value));
              setDraftActionFeedback(null);
            }}
            onSendDraftEmail={sendSelectedDraftEmail}
          />
        )}
        {activeScreen === 'history' && <HistoryScreen historyRecords={historyRecords} selectedHistory={selectedHistory} onSelectHistory={setSelectedHistoryId} />}
        {activeScreen === 'more' && (
          <MoreScreen
            currentUser={currentUser}
            draftCount={draftRecords.length}
            historyCount={historyRecords.length}
            analyticsSummary={analyticsSummary}
            localRecordsFeedback={localRecordsFeedback}
            setupConfig={setupConfig}
            setupCodeInput={setupCodeInput}
            setupUnlocked={setupUnlocked}
            setupFeedback={setupFeedback}
            onSetupCodeChange={setSetupCodeInput}
            onUnlockSetup={unlockSetup}
            onLockSetup={() => lockSetup()}
            onUpdateSetupConfig={updateSetupConfig}
            onSaveSetupConfig={saveSetupConfig}
            onClearLocalRecords={clearLocalRecords}
            onLogout={handleLockApp}
          />
        )}
      </div>

      <BottomNav activeScreen={activeScreen} items={bottomNav} onNavigate={setActiveScreen} />
    </main>
  );
}
