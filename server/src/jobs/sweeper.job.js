const cron = require('node-cron');
const constants = require('../config/constants');
const FileShare = require('../models/FileShare');
const storage = require('../storage');

// Safety net: deletes bucket objects that NO database record points to
// (e.g. an upload that finished after its share was discarded, or a DB
// record lost for any reason). Only looks inside this server's key prefix.
//
// Objects younger than the cutoff are never touched, so an upload that is
// still finishing is safe: cutoff > upload window + share lifetime.
const CUTOFF_MS =
  (constants.UPLOAD_WINDOW_MINUTES + constants.EXPIRY_MINUTES + 5) * 60 * 1000;

let running = false;

async function runOnce() {
  if (running) return;
  running = true;
  const startedAt = new Date().toISOString();
  let continuationToken;
  let scanned = 0;
  let deleted = 0;
  let errors = 0;

  try {
    do {
      let page;
      try {
        // eslint-disable-next-line no-await-in-loop
        page = await storage.listObjectsPage(continuationToken);
      } catch (err) {
        console.error(`[sweeper] list failed: ${err.message}`);
        return;
      }
      continuationToken = page.nextToken;

      const cutoff = Date.now() - CUTOFF_MS;
      const candidateKeys = page.objects
        .filter((o) => o.lastModified && new Date(o.lastModified).getTime() < cutoff)
        .map((o) => o.key);
      if (candidateKeys.length === 0) continue;
      scanned += candidateKeys.length;

      const referenced = new Set();
      try {
        // eslint-disable-next-line no-await-in-loop
        const docs = await FileShare.find(
          { 'files.key': { $in: candidateKeys } },
          { 'files.key': 1 }
        );
        for (const d of docs) for (const f of d.files) referenced.add(f.key);
      } catch (err) {
        console.error(`[sweeper] DB lookup failed, skipping page: ${err.message}`);
        errors += 1;
        continue;
      }

      for (const key of candidateKeys) {
        if (referenced.has(key)) continue;
        try {
          // eslint-disable-next-line no-await-in-loop
          await storage.deleteFile(key);
          deleted += 1;
          console.log(`[sweeper] deleted orphan object: ${key}`);
        } catch (err) {
          errors += 1;
          console.error(`[sweeper] delete failed for ${key}: ${err.message}`);
        }
      }
    } while (continuationToken);

    console.log(
      `[sweeper] ${startedAt}: old objects checked ${scanned}, orphans deleted ${deleted}, errors ${errors}`
    );
  } catch (err) {
    console.error(`[sweeper] FAILED at ${startedAt}: ${err.message}\n${err.stack}`);
  } finally {
    running = false;
  }
}

function startSweeperJob() {
  console.log(`[sweeper] registered (${constants.SWEEPER_SCHEDULE}), running once now`);
  runOnce();
  cron.schedule(constants.SWEEPER_SCHEDULE, runOnce);
}

module.exports = startSweeperJob;
