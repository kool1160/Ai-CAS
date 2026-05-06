import {
  loadDraftRecordsFromStorage,
  loadHistoryRecordsFromStorage,
  saveDraftRecordsToStorage,
  saveHistoryRecordsToStorage,
} from '../logic/localRecordsStorage';
import type { DraftRecord, HistoryRecord } from '../types/wocSessionTypes';
import {
  draftsToBackendReadyCorrectionRecords,
  historyToBackendReadyCorrectionRecords,
} from './correctionRecordAdapter';
import type { CorrectionRecordStoreSnapshot } from './correctionRecordTypes';

export type LocalCorrectionRecordStore = {
  loadDrafts: () => DraftRecord[];
  saveDrafts: (records: DraftRecord[]) => void;
  loadHistory: () => HistoryRecord[];
  saveHistory: (records: HistoryRecord[]) => void;
  loadBackendReadySnapshot: () => CorrectionRecordStoreSnapshot;
};

export const localCorrectionRecordStore: LocalCorrectionRecordStore = {
  loadDrafts: loadDraftRecordsFromStorage,
  saveDrafts: saveDraftRecordsToStorage,
  loadHistory: loadHistoryRecordsFromStorage,
  saveHistory: saveHistoryRecordsToStorage,
  loadBackendReadySnapshot: () => {
    const drafts = loadDraftRecordsFromStorage();
    const history = loadHistoryRecordsFromStorage();

    return {
      drafts: draftsToBackendReadyCorrectionRecords(drafts),
      history: historyToBackendReadyCorrectionRecords(history),
    };
  },
};
