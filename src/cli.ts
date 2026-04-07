#!/usr/bin/env bun
import { run } from './tui';

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
