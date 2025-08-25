#!/usr/bin/env node
import { execSync } from 'node:child_process'

execSync('vtex switch samsungbr', { stdio: 'inherit' })
execSync('yarn build:checkout', { stdio: 'inherit' })
execSync('vtex publish', { stdio: 'inherit' })
