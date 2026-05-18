export type FinalOutputRouterContext = {
  operationNumber?: string;
  routerStepOperation?: string;
  affectedOperationEquipment?: string;
};

const FORBIDDEN_ROUTER_CONTEXT_PATTERNS = [
  /uploaded\s+router\s+step\s*\/\s*operation/gi,
  /uploaded\s+router\s+operation/gi,
  /uploaded\s+router\s+context/gi,
  /routerStepOperation/gi,
  /operationNumber/gi,
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function normalize(value?: string) {
  return value?.trim() ?? '';
}

function sameText(left?: string, right?: string) {
  return normalize(left).toLowerCase() === normalize(right).toLowerCase();
}

function replacementProcess(context: FinalOutputRouterContext) {
  return normalize(context.affectedOperationEquipment) || 'selected affected operation/equipment';
}

export function removeUploadedRouterContextFromFinalText(text: string, context: FinalOutputRouterContext = {}) {
  const routerStepOperation = normalize(context.routerStepOperation);
  const selectedOperation = normalize(context.affectedOperationEquipment);
  let sanitized = text
    .split('\n')
    .filter((line) => !FORBIDDEN_ROUTER_CONTEXT_PATTERNS.some((pattern) => {
      pattern.lastIndex = 0;
      return pattern.test(line);
    }))
    .join('\n');

  FORBIDDEN_ROUTER_CONTEXT_PATTERNS.forEach((pattern) => {
    sanitized = sanitized.replace(pattern, 'selected affected operation/equipment');
  });

  if (routerStepOperation && !sameText(routerStepOperation, selectedOperation)) {
    sanitized = sanitized.replace(new RegExp(escapeRegExp(routerStepOperation), 'gi'), replacementProcess(context));
  }

  return sanitized
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}
