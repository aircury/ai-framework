#!/usr/bin/env node
import { run } from "./tui";

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
