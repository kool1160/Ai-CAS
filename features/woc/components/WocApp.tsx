'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  clearLocalRecordsStorage,
  loadDraftRecordsFromStorage,
  loadHistoryRecordsFromStorage,
  saveDraftRecordsToStorage,
  saveHistoryRecordsToStorage,
} from '../logic/localRecordsStorage';
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
  DraftRecord,
  ExtractedWorkOrderData,
  HistoryRecord,
  NavItem,
  Screen,
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
import { MoreScreen } from './MoreScreen';
import { ReviewSendScreen } from './ReviewSendScreen';

const bottomNav: NavItem[] = [
  { label: 'Home', screen: 'home' },
  { label: 'Capture', screen: 'capture' },
  { label: 'Drafts', screen: 'drafts' },
  { label: 'History', screen: 'history' },
  { label: 'More', screen: 'more' },
];

const workflow: WorkflowStep[] = [
  ['01', 'Capture Router', 'Take a photo, upload a file, or use manual entry.'],
  ['02', 'Extract + Confirm', 'Review work order data before it moves forward.'],
  ['03', 'Build Correction', 'Select the correction type and describe the issue.'],
  ['04', 'Generate Draft', 'Create the Engineering report and email draft.'],
  ['05', 'Confirm + Send', 'Review everything before copy/send controls unlock.'],
];

const stepLabels: Record<Screen, string> = {
  home: 'System Active',
  capture: 'Capture Work Order Data',
  confirm: 'Confirm Extracted Information',
  generate: 'Generate Correction Package',
  review: 'Review and Send',
  drafts: 'Drafts',
  history: 'History',
  more: 'More',
};

export function WocApp() {
  const [activeScreen, setActiveScreen] = useState<Screen>('home');
  const [wocData, setWocData] = useState<WocCorrectionData>(defaultWocCorrectionData);
  const [confirmations, setConfirmations] = useState<WocConfirmationState>(defaultWocConfirmations);
  const [manualEntry, setManualEntry] = useState('');
  const [selectedUploadFile, setSelectedUploadFile] = useState<File | null>(null);
  const [uploadedFile, setUploadedFile] = useState<UploadedFileInfo | null>(null);
  const [uploadFeedback, setUploadFeedback] = useState<string | null>(null);
  const [extractionFeedback, setExtractionFeedback] = useState<ActionFeedback>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [generatedPackage, setGeneratedPackage] = useState<GeneratedCorrectionPackage>(null);
  const [copyFeedback, setCopyFeedback] = useState<ActionFeedback>(null);
  const [saveFeedback, setSaveFeedback] = useState<ActionFeedback>(null);
  const [sendFeedback, setSendFeedback] = useState<ActionFeedback>(null);
  const [isSending, setIsSending] = useState(false);
  const [draftRecords, setDraftRecords] = useState<DraftRecord[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);
  const [localRecordsLoaded, setLocalRecordsLoaded] = useState(false);
  const [localRecordsFeedback, setLocalRecordsFeedback] = useState<ActionFeedback>(null);

  useEffect(() => {
    return () => {
      if (uploadedFile?.previewUrl) {
        URL.revokeObjectURL(uploadedFile.previewUrl);
      }
    };
  }, [uploadedFile?.previewUrl]);

  useEffect(() => {
    const loadedDrafts = loadDraftRecordsFromStorage();
    const loadedHistory = loadHistoryRecordsFromStorage();

    setDraftRecords(loadedDrafts);
    setHistoryRecords(loadedHistory);
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

  const gateStatus = useMemo(
    () => getGateStatus(wocData, confirmations, generatedPackage),
    [confirmations, generatedPackage, wocData],
  );

  const selectedDraft = useMemo(
    () => draftRecords.find((draft) => draft.draftId === selectedDraftId) ?? null,
    [draftRecords, selectedDraftId],
  );

  const selectedHistory = useMemo(
    () => historyRecords.find((record) => record.historyId === selectedHistoryId) ?? null,
    [historyRecords, selectedHistoryId],
  );

  const updateWocData = (key: keyof WocCorrectionData, value: string) => {
    setWocData((current) => ({ ...current, [key]: value }));
    setConfirmations((current) => resetDependentConfirmations(current, key, value));
    setGeneratedPackage(null);
    setCopyFeedback(null);
    setSaveFeedback(null);
    setSendFeedback(null);
  };

  const updateAffectedArea = (value: string) => {
    setWocData((current) => ({
      ...current,
      affectedArea: value,
      customAffectedArea: value === otherAffectedAreaOption ? current.customAffectedArea : '',
    }));
    setConfirmations((current) => resetDependentConfirmations(current, 'affectedArea', value));
    setGeneratedPackage(null);
    setCopyFeedback(null);
    setSaveFeedback(null);
    setSendFeedback(null);
  };

  const handleUploadFile = (file: File | null) => {
    setUploadedFile((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }

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
          : `${file.name} selected. M9 extraction supports image files only; manual entry is still available.`,
      );

      return {
        name: file.name,
        type: file.type,
        size: file.size,
        previewUrl,
        isImage,
      };
    });
  };

  const clearUploadedFile = () => {
    setUploadedFile((current) => {
      if (current?.previewUrl) {
        URL.revokeObjectURL(current.previewUrl);
      }
      return null;
    });
    setSelectedUploadFile(null);
    setExtractionFeedback(null);
    setUploadFeedback('Uploaded file cleared.');
  };

  const applyExtractedData = (extracted: ExtractedWorkOrderData) => {
    setWocData((current) => ({
      ...current,
      workOrderNumber: extracted.workOrderNumber ?? '',
      partNumber: extracted.partNumber ?? '',
      revision: extracted.revision ?? '',
      customerOrJob: extracted.customerOrJob ?? '',
      quantity: extracted.quantity ?? '',
    }));
    setConfirmations((current) => ({
      ...current,
      workOrderDataConfirmed: false,
      partNumberConfirmed: false,
      finalReviewConfirmed: false,
    }));
    setGeneratedPackage(null);
    setCopyFeedback(null);
    setSaveFeedback(null);
    setSendFeedback(null);

    if (extracted.notes?.trim()) {
      setManualEntry(extracted.notes.trim());
    }
  };

  const extractUploadedData = async () => {
    if (!selectedUploadFile || !uploadedFile) {
      setExtractionFeedback({ tone: 'error', message: 'Upload an image before extracting data.' });
      return;
    }

    if (!uploadedFile.isImage) {
      setExtractionFeedback({ tone: 'error', message: 'M9 extraction supports uploaded image files only. Manual entry remains available.' });
      return;
    }

    setIsExtracting(true);
    setExtractionFeedback({ tone: 'success', message: 'Extracting work order data...' });

    try {
      const formData = new FormData();
      formData.append('file', selectedUploadFile);

      const response = await fetch('/api/extract-work-order', {
        method: 'POST',
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Extraction failed. Manual entry remains available.';
        setExtractionFeedback({ tone: 'error', message });
        return;
      }

      applyExtractedData(payload.extracted ?? {});
      setExtractionFeedback({ tone: 'success', message: 'Extraction completed. Review and confirm the extracted fields before continuing.' });
      setActiveScreen('confirm');
    } catch {
      setExtractionFeedback({ tone: 'error', message: 'Extraction could not be completed. Manual entry remains available.' });
    } finally {
      setIsExtracting(false);
    }
  };

  const confirmWorkOrderData = () => {
    setConfirmations((current) => ({
      ...current,
      workOrderDataConfirmed: Boolean(wocData.workOrderNumber.trim()),
      finalReviewConfirmed: false,
    }));
  };

  const confirmPartNumber = () => {
    setConfirmations((current) => ({
      ...current,
      partNumberConfirmed: Boolean(wocData.partNumber.trim()),
      finalReviewConfirmed: false,
    }));
  };

  const confirmAllRequiredData = () => {
    setConfirmations((current) => ({
      ...current,
      workOrderDataConfirmed: Boolean(wocData.workOrderNumber.trim()),
      partNumberConfirmed: Boolean(wocData.partNumber.trim()),
      finalReviewConfirmed: false,
    }));
  };

  const startCapture = () => {
    setActiveScreen('capture');
  };

  const goToConfirm = () => {
    setActiveScreen('confirm');
  };

  const goToGenerate = () => {
    if (!gateStatus.confirmReady) return;
    setActiveScreen('generate');
  };

  const generateDraft = () => {
    if (!gateStatus.generateReady) return;
    setGeneratedPackage(createGeneratedPackage(wocData));
    setConfirmations((current) => ({ ...current, finalReviewConfirmed: false }));
    setCopyFeedback(null);
    setSaveFeedback(null);
    setSendFeedback(null);
    setActiveScreen('review');
  };

  const setFinalReviewConfirmed = (confirmed: boolean) => {
    setConfirmations((current) => ({ ...current, finalReviewConfirmed: confirmed }));
    setSendFeedback(null);
  };

  const copyTextToClipboard = async (text: string | undefined, label: string) => {
    if (!text) {
      setCopyFeedback({ tone: 'error', message: `Generate a draft before copying the ${label}.` });
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback({ tone: 'success', message: `${label} copied to clipboard.` });
    } catch {
      setCopyFeedback({ tone: 'error', message: `${label} could not be copied. Use manual selection as fallback.` });
    }
  };

  const saveCurrentDraft = () => {
    if (!generatedPackage) {
      setSaveFeedback({ tone: 'error', message: 'Generate a draft before saving.' });
      return;
    }

    try {
      const createdTimestamp = new Date().toLocaleString();
      const nextDraftNumber = draftRecords.length + 1;
      const draftId = `DRAFT-${String(nextDraftNumber).padStart(4, '0')}`;
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
        status: 'Draft',
      };

      setDraftRecords((current) => [record, ...current]);
      setSelectedDraftId(record.draftId);
      setSaveFeedback({ tone: 'success', message: `${draftId} saved for this browser.` });
    } catch {
      setSaveFeedback({ tone: 'error', message: 'Draft could not be saved. Try again.' });
    }
  };

  const addSentHistoryRecord = (resendId: string | null) => {
    if (!generatedPackage) return;

    const completedTimestamp = new Date().toLocaleString();
    const nextHistoryNumber = historyRecords.length + 1;
    const historyId = `HISTORY-${String(nextHistoryNumber).padStart(4, '0')}`;
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

    setIsSending(true);
    setSendFeedback({ tone: 'success', message: 'Sending email...' });

    try {
      const response = await fetch('/api/send-correction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subjectLine: generatedPackage.subjectLine,
          reportText: generatedPackage.reportPreview,
          emailDraftText: generatedPackage.emailPreview,
          workOrderNumber: wocData.workOrderNumber,
          partNumber: wocData.partNumber,
          affectedArea: getEffectiveAffectedArea(wocData),
          correctionType: wocData.correctionType,
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        const message = typeof payload?.error === 'string' ? payload.error : 'Email send failed. Copy controls remain available.';
        setSendFeedback({ tone: 'error', message });
        return;
      }

      const resendId = typeof payload?.resendId === 'string' ? payload.resendId : null;
      const recipient = typeof payload?.recipient === 'string' ? payload.recipient : 'configured recipient';
      addSentHistoryRecord(resendId);
      setSendFeedback({ tone: 'success', message: `Email sent to ${recipient}.${resendId ? ` Resend ID: ${resendId}` : ''}` });
    } catch {
      setSendFeedback({ tone: 'error', message: 'Email send could not be completed. Copy controls remain available.' });
    } finally {
      setIsSending(false);
    }
  };

  const clearLocalRecords = () => {
    const confirmed = window.confirm('Clear all local Drafts and History from this browser? This cannot be undone.');

    if (!confirmed) return;

    clearLocalRecordsStorage();
    setDraftRecords([]);
    setHistoryRecords([]);
    setSelectedDraftId(null);
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

  return (
    <main className="app-shell">
      <div className="app-frame">
        <div className="screen-title">
          <span className="step-pill">REFAB CONNECT · {stepLabels[activeScreen]}</span>
        </div>

        {activeScreen === 'home' && <HomeScreen workflow={workflow} onStartCapture={startCapture} />}
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
            onCaptureRouter={goToConfirm}
          />
        )}
        {activeScreen === 'confirm' && (
          <ConfirmScreen
            wocData={wocData}
            confirmReady={gateStatus.confirmReady}
            getFieldConfirmed={getFieldConfirmed}
            onUpdateField={updateWocData}
            onConfirmField={confirmField}
            onConfirmRequired={confirmAllRequiredData}
            onContinue={goToGenerate}
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
            sendReady={gateStatus.sendReady}
            isSending={isSending}
            copyFeedback={copyFeedback}
            saveFeedback={saveFeedback}
            sendFeedback={sendFeedback}
            confirmations={confirmations}
            onCopyReport={() => copyTextToClipboard(generatedPackage?.reportPreview, 'Engineering report')}
            onCopyEmailDraft={() => copyTextToClipboard(generatedPackage?.emailPreview, 'Email draft')}
            onSaveDraft={saveCurrentDraft}
            onFinalReviewChange={setFinalReviewConfirmed}
            onSendEmail={sendCorrectionEmail}
          />
        )}
        {activeScreen === 'drafts' && <DraftsScreen draftRecords={draftRecords} selectedDraft={selectedDraft} onSelectDraft={setSelectedDraftId} />}
        {activeScreen === 'history' && <HistoryScreen historyRecords={historyRecords} selectedHistory={selectedHistory} onSelectHistory={setSelectedHistoryId} />}
        {activeScreen === 'more' && (
          <MoreScreen
            draftCount={draftRecords.length}
            historyCount={historyRecords.length}
            localRecordsFeedback={localRecordsFeedback}
            onClearLocalRecords={clearLocalRecords}
          />
        )}
      </div>

      <BottomNav activeScreen={activeScreen} items={bottomNav} onNavigate={setActiveScreen} />
    </main>
  );
}
