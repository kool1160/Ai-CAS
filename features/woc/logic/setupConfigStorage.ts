import type { SetupConfig } from '../types/wocSessionTypes';

export const SETUP_CONFIG_STORAGE_KEY = 'refab-connect-setup-config';

export const defaultSetupConfig: SetupConfig = {
  companyName: '',
  engineeringRecipientEmail: '',
  senderDisplayName: 'REFAB Connect',
  defaultSubmittedByName: '',
  defaultSubmittedByEmail: '',
};

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : '';
}

export function sanitizeSetupConfig(value: unknown): SetupConfig {
  if (!isObject(value)) return defaultSetupConfig;

  return {
    companyName: stringValue(value.companyName),
    engineeringRecipientEmail: stringValue(value.engineeringRecipientEmail),
    senderDisplayName: stringValue(value.senderDisplayName) || defaultSetupConfig.senderDisplayName,
    defaultSubmittedByName: stringValue(value.defaultSubmittedByName),
    defaultSubmittedByEmail: stringValue(value.defaultSubmittedByEmail),
  };
}

export function loadSetupConfigFromStorage(): SetupConfig {
  try {
    const raw = window.localStorage.getItem(SETUP_CONFIG_STORAGE_KEY);
    if (!raw) return defaultSetupConfig;
    return sanitizeSetupConfig(JSON.parse(raw));
  } catch {
    return defaultSetupConfig;
  }
}

export function saveSetupConfigToStorage(config: SetupConfig) {
  window.localStorage.setItem(SETUP_CONFIG_STORAGE_KEY, JSON.stringify(sanitizeSetupConfig(config)));
}
