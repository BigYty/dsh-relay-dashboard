#!/usr/bin/env python3
"""Read-only release gate. Findings contain locations/rule IDs, never matched values."""
import json
import re
import subprocess
import sys
import tarfile
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
EXPECTED = {
    'package/package.json', 'package/index.js', 'package/client.js',
    'package/cordis.patch.yml', 'package/icon.svg', 'package/locale/en.json',
    'package/locale/zh.json', 'package/README.md', 'package/README.zh-CN.md',
    'package/SECURITY.md', 'package/CHANGELOG.md',
}
PATTERNS = {
    'private-key': re.compile(rb'-----BEGIN (?:[A-Z ]+ )?PRIVATE KEY-----'),
    'github-token': re.compile(rb'\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b'),
    'service-key': re.compile(rb'\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b'),
    'aws-access-key': re.compile(rb'\b(?:AKIA|ASIA)[A-Z0-9]{16}\b'),
    'jwt': re.compile(rb'\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b'),
    'credential-literal': re.compile(rb'''(?i)\b(?:token|api[_-]?key|secret|password|passwd)\b\s*[:=]\s*["']([^"'\r\n]{12,})["']'''),
    'deployment-home': re.compile(rb'/(?:root|home)/[A-Za-z0-9_.-]+/'),
    'email-address': re.compile(rb'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'),
}
findings = []
counts = {'workingFiles': 0, 'historyObjects': 0, 'archives': 0, 'archiveFiles': 0}


def flag(label, rule, line=0):
    findings.append({'location': label, 'line': line, 'rule': rule})


def scan(label, data):
    for rule, pattern in PATTERNS.items():
        for match in pattern.finditer(data):
            if rule == 'email-address' and match.group().endswith((b'@example.invalid', b'@example.com')):
                continue
            flag(label, rule, data[:match.start()].count(b'\n') + 1)
    for match in re.finditer(rb'https?://[^\s\x22\x27<>`]+', data):
        value = match.group().decode('utf-8', 'ignore').rstrip('),;')
        try:
            url = urlsplit(value)
            host = url.hostname or ''
            if re.fullmatch(r'\$\{[A-Za-z_][A-Za-z0-9_]*\}', host):
                continue  # Source-code interpolation, not a configured endpoint.
            example = host in ('example.com', 'example.org', 'example.net') or host.endswith(('.example', '.invalid'))
            if (url.username or url.password) and not example:
                flag(label, 'url-credentials', data[:match.start()].count(b'\n') + 1)
            if host and not example and host not in ('www.w3.org', 'github.com'):
                flag(label, 'non-example-endpoint', data[:match.start()].count(b'\n') + 1)
        except ValueError:
            flag(label, 'malformed-url')


def git(*args):
    return subprocess.run(['git', '-C', str(ROOT), *args], capture_output=True, check=True).stdout


for path in sorted(ROOT.rglob('*')):
    relative = path.relative_to(ROOT)
    if any(part in ('.git', 'node_modules', 'dist', 'coverage') for part in relative.parts) or not path.is_file():
        continue
    if path.is_symlink():
        flag(str(relative), 'symlink')
        continue
    if path.name.startswith('.env') or path.suffix.lower() in ('.pem', '.key', '.p12', '.pfx', '.har', '.db', '.sqlite'):
        flag(str(relative), 'runtime-or-secret-file')
    scan(str(relative), path.read_bytes())
    counts['workingFiles'] += 1

if (ROOT / '.git').exists():
    refs = subprocess.run(['git', '-C', str(ROOT), 'rev-parse', '--verify', 'HEAD'], capture_output=True)
    if refs.returncode == 0:
        for entry in git('rev-list', '--objects', '--all').splitlines():
            oid = entry.split(b' ', 1)[0].decode('ascii')
            kind = git('cat-file', '-t', oid).strip()
            if kind in (b'blob', b'commit', b'tag'):
                scan('git-object:' + oid, git('cat-file', '-p', oid))
                counts['historyObjects'] += 1
    for entry in git('ls-files', '-z').split(b'\0'):
        if entry:
            name = entry.decode('utf-8')
            result = subprocess.run(['git', '-C', str(ROOT), 'check-ignore', '--no-index', name], capture_output=True)
            if result.returncode == 0:
                flag(name, 'tracked-ignored-file')

for argument in sys.argv[1:]:
    archive_path = Path(argument).resolve()
    with tarfile.open(archive_path, 'r:*') as archive:
        members = archive.getmembers()
        names = {member.name for member in members if member.isfile()}
        if names != EXPECTED:
            flag(archive_path.name, 'package-file-allowlist')
        for member in members:
            if member.issym() or member.islnk() or member.name.startswith('/') or '..' in Path(member.name).parts:
                flag(archive_path.name, 'unsafe-archive-member')
            if member.isfile():
                scan(archive_path.name + ':' + member.name, archive.extractfile(member).read())
                counts['archiveFiles'] += 1
    counts['archives'] += 1

print(json.dumps({'result': 'fail' if findings else 'pass', 'counts': counts, 'findings': findings}, indent=2))
sys.exit(1 if findings else 0)
