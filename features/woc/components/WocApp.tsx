'use client';

import { useMemo, useState } from 'react';
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
import type { ActionFeedback, DraftRecord, HistoryRecord, NavItem, Screen, WorkflowStep } from '../types/wocSessionTypes';
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
  const [generatedPackage, setGeneratedPackage] = useState<GeneratedCorrectionPackage>(null);
  const [copyFeedback, setCopyFeedback] = useState<ActionFeedback>(null);
  const [saveFeedback, setSaveFeedback] = useState<ActionFeedback>(null);
  const [sendFeedback, setSendFeedback] = useState<ActionFeedback>(null);
  const [draftRecords, setDraftRecords] = useState<DraftRecord[]>([]);
  const [selectedDraftId, setSelectedDraftId] = useState<string | null>(null);
  const [historyRecords, setHistoryRecords] = useState<HistoryRecord[]>([]);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | null>(null);

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
      setSaveFeedback({ tone: 'success', message: `${draftId} saved for this session.` });
    } catch {
      setSaveFeedback({ tone: 'error', message: 'Draft could not be saved. Try again.' });
    }
  };

  const saveCompletedHistoryRecord = () => {
    if (!generatedPackage || !gateStatus.sendReady) {
      setSendFeedback({ tone: 'error', message: 'Final review is required before creating a completed history record.' });
      return;
    }

    try {
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
        status: 'Completed / Sent Placeholder',
      };

      setHistoryRecords((current) => [record, ...current]);
      setSelectedHistoryId(record.historyId);
      setSendFeedback({ tone: 'success', message: `${historyId} saved to History. Actual email sending is still placeholder only.` });
    } catch {
      setSendFeedback({ tone: 'error', message: 'History record could not be created. Try again.' });
    }
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
        {activeScreen === 'capture' && <CaptureScreen manualEntry={manualEntry} onManualEntryChange={setManualEntry} onCaptureRouter={goToConfirm} />}
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
            copyFeedback={copyFeedback}
            saveFeedback={saveFeedback}
            sendFeedback={sendFeedback}
            confirmations={confirmations}
            onCopyReport={() => copyTextToClipboard(generatedPackage?.reportPreview, 'Engineering report')}
            onCopyEmailDraft={() => copyTextToClipboard(generatedPackage?.emailPreview, 'Email draft')}
            onSaveDraft={saveCurrentDraft}
            onFinalReviewChange={setFinalReviewConfirmed}
            onSendPlaceholder={saveCompletedHistoryRecord}
          />
        )}
        {activeScreen === 'drafts' && <DraftsScreen draftRecords={draftRecords} selectedDraft={selectedDraft} onSelectDraft={setSelectedDraftId} />}
        {activeScreen === 'history' && <HistoryScreen historyRecords={historyRecords} selectedHistory={selectedHistory} onSelectHistory={setSelectedHistoryId} />}
        {activeScreen === 'more' && <MoreScreen />}
      </div>

      <BottomNav activeScreen={activeScreen} items={bottomNav} onNavigate={setActiveScreen} />
    </main>
  );
}
