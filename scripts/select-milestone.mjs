#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';

function fail(message) {
  console.error(`AI-CAS milestone error: ${message}`);
  process.exit(1);
}

function args(argv) {
  const result = { number: '', context: '', backlog: 'BACKLOG.md', validate: false };
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    if (key === '--validate') {
      result.validate = true;
      continue;
    }
    const value = argv[index + 1];
    if (!key?.startsWith('--') || value === undefined) fail(`invalid argument near ${key ?? '<end>'}`);
    if (key === '--number') result.number = value;
    else if (key === '--context') result.context = value;
    else if (key === '--backlog') result.backlog = value;
    else fail(`unknown option ${key}`);
    index += 1;
  }
  return result;
}

function parseMilestones(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const heading = /^## Milestone\s+(\d+)\s+-\s+(.+?)\s*$/;
  const milestones = [];
  for (let index = 0; index < lines.length; index += 1) {
    const match = lines[index].match(heading);
    if (!match) continue;
    let end = lines.length;
    for (let next = index + 1; next < lines.length; next += 1) {
      if (heading.test(lines[next])) { end = next; break; }
    }
    const block = lines.slice(index, end);
    const statusLine = block.find((line) => /^\*\*Status:\*\*/.test(line));
    if (!statusLine) fail(`Milestone ${match[1]} has no status line`);
    milestones.push({
      number: Number(match[1]),
      name: match[2].trim(),
      status: statusLine.replace(/^\*\*Status:\*\*\s*/, '').trim(),
      markdown: block.join('\n').trim(),
    });
    index = end - 1;
  }
  if (!milestones.length) fail('no milestones found');
  return milestones;
}

const options = args(process.argv.slice(2));
const backlogPath = path.resolve(options.backlog);
if (!fs.existsSync(backlogPath)) fail(`${options.backlog} does not exist`);
const milestones = parseMilestones(fs.readFileSync(backlogPath, 'utf8'));
if (options.validate) {
  const numbers = new Set();
  for (const milestone of milestones) {
    if (numbers.has(milestone.number)) fail(`duplicate milestone ${milestone.number}`);
    numbers.add(milestone.number);
  }
  console.log(`Validated ${milestones.length} AI-CAS milestones.`);
  process.exit(0);
}
const complete = (status) => /^complete\b/i.test(status);
const paused = (status) => /^(blocked|waiting|paused)\b/i.test(status);
let selected;
if (options.number) {
  const number = Number(options.number);
  selected = milestones.find((milestone) => milestone.number === number);
  if (!selected) fail(`Milestone ${options.number} was not found`);
  if (complete(selected.status)) fail(`Milestone ${options.number} is complete`);
} else {
  selected = milestones.find((milestone) => !complete(milestone.status) && !paused(milestone.status));
  if (!selected) fail('no eligible milestone found');
}

const context = `# Selected AI-CAS Milestone\n\n- Number: ${selected.number}\n- Name: ${selected.name}\n- Status: ${selected.status}\n\n## Authoritative milestone excerpt\n\n${selected.markdown}\n`;
if (options.context) {
  const output = path.resolve(options.context);
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, context);
}
console.log(`Selected Milestone ${selected.number}: ${selected.name}`);
