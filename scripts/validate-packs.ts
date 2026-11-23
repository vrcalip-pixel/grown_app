import { listPackFiles, readRawPack } from "../src/pack/load";
import { validatePack } from "../src/pack/validate";

// Runs before every build. Any error here stops the build.
let failed = false;
for (const file of listPackFiles()) {
  const { errors, warnings, pack } = validatePack(readRawPack(file), file);
  for (const w of warnings) console.warn(`warn  ${w}`);
  for (const e of errors) console.error(`ERROR ${e}`);
  if (errors.length) failed = true;
  else console.log(`ok    ${file} (${pack?.status}, v${pack?.version})`);
}
if (failed) {
  console.error("\nGuide packs failed validation. Nothing ships until every rule has a source and a date.");
  process.exit(1);
}
