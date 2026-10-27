// npm run diag
// Proves whether Filebase really deletes objects: uploads a tiny test object,
// deletes it, then polls HEAD for up to 15 s and reports what happened.
const env = require('../src/config/env');
const storage = require('../src/storage');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const key = `${env.filebase.keyPrefix}diag-${Date.now()}.txt`;
  console.log(`endpoint=${env.filebase.endpoint} region=${env.filebase.region} bucket=${env.filebase.bucket}`);
  console.log(`test key: ${key}`);

  await storage.putTestObject(key, 'diag');
  console.log('1) upload OK, exists =', await storage.objectExists(key));

  // Raw delete (no verification) so we can time how long it takes to vanish.
  const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
  const s3 = new S3Client({
    endpoint: env.filebase.endpoint,
    region: env.filebase.region,
    forcePathStyle: true,
    credentials: { accessKeyId: env.filebase.accessKey, secretAccessKey: env.filebase.secretKey },
  });
  const t0 = Date.now();
  const res = await s3.send(new DeleteObjectCommand({ Bucket: env.filebase.bucket, Key: key }));
  console.log('2) DeleteObject returned HTTP', res.$metadata.httpStatusCode);

  for (let i = 0; i < 15; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await storage.objectExists(key);
    console.log(`3) +${((Date.now() - t0) / 1000).toFixed(1)}s exists =`, exists);
    if (!exists) {
      console.log('RESULT: delete works. If the dashboard still shows it, the dashboard is stale.');
      process.exit(0);
    }
    // eslint-disable-next-line no-await-in-loop
    await sleep(1000);
  }
  console.log('RESULT: object STILL EXISTS 15 s after a successful DeleteObject -> Filebase is not deleting.');
  process.exit(1);
})().catch((e) => {
  console.error('diag failed:', e.name, e.message);
  process.exit(1);
});
