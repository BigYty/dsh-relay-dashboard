#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { isAbsolute, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function parseArgs(args) {
  let profile;
  let bundle;
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === '--profile' && !profile) {
      profile = args[++index];
      if (!profile || profile.startsWith('-')) throw new Error('--profile requires a profile name');
    } else if (argument === '--bundle' && !bundle) {
      bundle = args[++index];
      if (!bundle || bundle.startsWith('-')) throw new Error('--bundle requires a local package directory or archive');
    } else {
      throw new Error(`Unexpected argument: ${argument}`);
    }
  }
  if (!profile) throw new Error('Usage: node scripts/import-profile.mjs --profile <name> --bundle <path>');
  if (!bundle) throw new Error('--bundle is required');
  if (!/^[a-zA-Z0-9][a-zA-Z0-9_-]{0,63}$/.test(profile)) throw new Error('Profile name must contain only letters, numbers, _ or -');
  return { profile, bundle: resolve(bundle) };
}

export function buildCommand({ profile, bundle }) {
  const executable = process.platform === 'win32' ? 'dsh.cmd' : 'dsh';
  return { executable, args: ['plugin', '--profile', profile, 'add', isAbsolute(bundle) ? bundle : resolve(bundle)] };
}

export function install({ profile, bundle }, runner = spawnSync) {
  const command = buildCommand({ profile, bundle });
  const result = runner(command.executable, command.args, { stdio: 'inherit', shell: process.platform === 'win32' });
  if (result.error) throw new Error(`Could not start DSH plugin installer: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`DSH plugin installer failed with exit status ${result.status ?? 'unknown'}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    install(parseArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
