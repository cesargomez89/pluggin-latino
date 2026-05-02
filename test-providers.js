const fs = require('fs');
const path = require('path');

const manifest = JSON.parse(fs.readFileSync('./manifest.json', 'utf8'));

const args = process.argv.slice(2);

let providerFilter = null;
let remainingArgs = args;

const providerIndex = args.indexOf('--provider');
if (providerIndex !== -1) {
  providerFilter = args[providerIndex + 1];
  remainingArgs = [...args.slice(0, providerIndex), ...args.slice(providerIndex + 2)];
}

const tmdbId = remainingArgs[0];
const mediaType = remainingArgs[1] || 'movie';
const season = remainingArgs[2] ? parseInt(remainingArgs[2]) : undefined;
const episode = remainingArgs[3] ? parseInt(remainingArgs[3]) : undefined;

if (!tmdbId) {
  console.log('Usage:');
  console.log('  node test-providers.js <tmdbId> [mediaType] [season] [episode]');
  console.log('  node test-providers.js --provider <providerId> <tmdbId> [mediaType]');
  console.log('\nExamples:');
  console.log('  node test-providers.js 872585 movie');
  console.log('  node test-providers.js 456 tv 1 5');
  console.log('  node test-providers.js --provider xupalace 872585 movie');
  process.exit(1);
}

console.log(`Testing providers for TMDB ID: ${tmdbId}, Type: ${mediaType}${season ? `, S${season}E${episode}` : ''}${providerFilter ? ` [Provider: ${providerFilter}]` : ''}\n`);

let providersToTest;
if (providerFilter) {
  const provider = manifest.scrapers.find(p => p.id === providerFilter && p.enabled);
  if (!provider) {
    console.log(`Provider '${providerFilter}' not found or not enabled in manifest.json`);
    process.exit(1);
  }
  providersToTest = [provider];
} else {
  providersToTest = manifest.scrapers.filter(p => p.enabled);
}

const results = [];
let completed = 0;

providersToTest.forEach(provider => {
  const providerPath = path.resolve('./', provider.filename);

  if (!fs.existsSync(providerPath)) {
    results.push({ id: provider.id, name: provider.name, status: 'FILE_NOT_FOUND', streams: 0 });
    console.log(`[${provider.id}] FILE NOT FOUND`);
    completed++;
    checkDone();
    return;
  }

  try {
    const { getStreams } = require(providerPath);

    const streamPromise = season != null
      ? getStreams(tmdbId, mediaType, season, episode)
      : getStreams(tmdbId, mediaType);

    const timeoutMs = 30000;
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('TIMEOUT')), timeoutMs)
    );

    Promise.race([streamPromise, timeoutPromise])
      .then(streams => {
        const count = Array.isArray(streams) ? streams.length : 0;
        results.push({ id: provider.id, name: provider.name, status: count > 0 ? 'OK' : 'EMPTY', streams: count });
        console.log(`[${provider.id}] ${count > 0 ? 'OK' : 'EMPTY'} (${count} streams)`);
      })
      .catch(err => {
        let status = 'ERROR';
        if (err.message.includes('Cannot find module')) status = 'MISSING_DEP';
        else if (err.message.includes('not defined')) status = 'UNDEFINED_VAR';
        else if (err.message === 'TIMEOUT') status = 'TIMEOUT';

        results.push({ id: provider.id, name: provider.name, status, streams: 0, error: err.message });
        console.log(`[${provider.id}] ${status}: ${err.message.split('\n')[0]}`);
      })
      .finally(() => {
        completed++;
        checkDone();
      });
  } catch (err) {
    results.push({ id: provider.id, name: provider.name, status: 'LOAD_ERROR', streams: 0, error: err.message });
    console.log(`[${provider.id}] LOAD ERROR: ${err.message}`);
    completed++;
    checkDone();
  }
});

function checkDone() {
  if (completed === providersToTest.length) {
    printSummary();
  }
}

function printSummary() {
  console.log('\n=== SUMMARY ===\n');

  const grouped = {
    OK: results.filter(r => r.status === 'OK'),
    EMPTY: results.filter(r => r.status === 'EMPTY'),
    TIMEOUT: results.filter(r => r.status === 'TIMEOUT'),
    MISSING_DEP: results.filter(r => r.status === 'MISSING_DEP'),
    UNDEFINED_VAR: results.filter(r => r.status === 'UNDEFINED_VAR'),
    LOAD_ERROR: results.filter(r => r.status === 'LOAD_ERROR'),
    FILE_NOT_FOUND: results.filter(r => r.status === 'FILE_NOT_FOUND'),
    ERROR: results.filter(r => r.status === 'ERROR')
  };

  if (grouped.OK.length > 0) {
    console.log('[OK] Working providers:');
    grouped.OK.forEach(r => console.log(`  ✓ ${r.name}: ${r.streams} streams`));
  }

  if (grouped.EMPTY.length > 0) {
    console.log('\n[EMPTY] No streams returned:');
    grouped.EMPTY.forEach(r => console.log(`  ○ ${r.name}`));
  }

  if (grouped.TIMEOUT.length > 0) {
    console.log('\n[TIMEOUT] Timed out:');
    grouped.TIMEOUT.forEach(r => console.log(`  ⏱ ${r.name}`));
  }

  if (grouped.MISSING_DEP.length > 0) {
    console.log('\n[MISSING_DEP] Missing npm packages (axios, cheerio):');
    grouped.MISSING_DEP.forEach(r => console.log(`  ⚠ ${r.name}`));
  }

  if (grouped.UNDEFINED_VAR.length > 0) {
    console.log('\n[UNDEFINED_VAR] Missing runtime globals (UA_POOL, etc):');
    grouped.UNDEFINED_VAR.forEach(r => console.log(`  ? ${r.name}`));
  }

  if (grouped.LOAD_ERROR.length > 0) {
    console.log('\n[LOAD_ERROR] Failed to load:');
    grouped.LOAD_ERROR.forEach(r => console.log(`  ✗ ${r.name}`));
  }

  if (grouped.ERROR.length > 0) {
    console.log('\n[ERROR] Other errors:');
    grouped.ERROR.forEach(r => console.log(`  ✗ ${r.name}: ${r.error}`));
  }

  console.log('\n-------------------');
  console.log(`Total: ${results.length} | OK: ${grouped.OK.length} | Issues: ${results.length - grouped.OK.length}`);
}