#!/usr/bin/env node
import { ConnectEnv } from '@aurora-is-near/engine';
declare global {
    namespace NodeJS {
        interface ProcessEnv extends ConnectEnv {
            CF_API_TOKEN?: string;
            CF_ACCOUNT_ID?: string;
            CF_LIST_ID?: string;
        }
    }
}
