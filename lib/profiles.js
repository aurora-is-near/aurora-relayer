/* This is free and unencumbered software released into the public domain. */
import crypto from 'crypto';
import fs from 'fs';
import { connect, StringCodec, credsAuthenticator, } from 'nats';
import { QuotaReached } from './errors.js';
export class Profiles {
    constructor(config) {
        this.config = config;
        this.config = config;
    }
    async connect() {
        if (this.config.natsUrl && this.config.profilesChannel) {
            try {
                const opts = {
                    servers: this.config.natsUrl,
                    name: this.config.profilesChannel,
                };
                if (this.config.natsCreds) {
                    const data = fs.readFileSync(this.config.natsCreds);
                    opts.authenticator = credsAuthenticator(data);
                }
                this.nc = await connect(opts);
                this.js = await this.nc.jetstream();
            }
            catch (error) {
                console.error(`Nats connection can not be established: ${error.message}.`);
            }
        }
    }
    async startServer() {
        if (this.nc == undefined) {
            return;
        }
        const sc = StringCodec();
        const msub = this.nc.subscribe(`${this.config.profilesChannel}.*`);
        (async (sub) => {
            for await (const m of sub) {
                const chunks = m.subject.split('.');
                switch (chunks[1]) {
                    case 'signup':
                        try {
                            const payload = JSON.parse(sc.decode(m.data));
                            const token = crypto.randomBytes(22).toString('hex');
                            await this.addToken(token, payload);
                            await m.respond(sc.encode(JSON.stringify({ email: payload.email, token: token })));
                        }
                        catch (error) {
                            m.respond(sc.encode(JSON.stringify({ code: 400, message: error.message })));
                        }
                        break;
                    case 'profile':
                        try {
                            const payload = JSON.parse(sc.decode(m.data));
                            const token = payload.token;
                            const t = await this.getToken(token, true);
                            if (t.token == token) {
                                m.respond(sc.encode(JSON.stringify(t)));
                            }
                            else {
                                m.respond(sc.encode(JSON.stringify({ code: 404, message: 'Token not found' })));
                            }
                        }
                        catch (error) {
                            m.respond(sc.encode(JSON.stringify({ code: 400, message: error.message })));
                        }
                        break;
                }
            }
        })(msub);
    }
    async addToken(token, payload) {
        if (this.js == undefined) {
            return;
        }
        try {
            const email = payload.email;
            const quota = payload.quota || 50;
            const kv = await this.js.views.kv(this.tokenBucketName());
            const sc = StringCodec();
            kv.put(token, sc.encode(JSON.stringify({ email: email, quota: quota })));
        }
        catch (error) {
            return;
        }
    }
    async signupKeys(token, payload) {
        if (this.js == undefined) {
            return;
        }
        const kv = await this.js.views.kv(this.tokenBucketName());
        const keys = await kv.keys();
        await (async () => {
            for await (const k of keys) {
                console.log(k);
            }
        })();
    }
    async tokenQuota(token) {
        const t = await this.getToken(token);
        return t.quota || -1;
    }
    async getToken(token, withUsedQuota) {
        if (this.js == undefined) {
            return {};
        }
        try {
            const kv = await this.js.views.kv(this.tokenBucketName());
            const kv_entry = await kv.get(token);
            const sc = StringCodec();
            if (kv_entry) {
                const tokenData = JSON.parse(sc.decode(kv_entry.value));
                const t = {
                    token: token,
                    email: tokenData.email,
                    quota: tokenData.quota,
                };
                if (withUsedQuota)
                    t.used = await this.usedQuota(token);
                return t;
            }
        }
        catch (error) {
            return {};
        }
        return {};
    }
    async usedQuota(token) {
        if (this.js == undefined) {
            return 0;
        }
        try {
            const kv = await this.js.views.kv(this.quotaBucketName(token));
            const status = await kv.status();
            return status.values;
        }
        catch (error) {
            return 0;
        }
    }
    async storeTransaction(token, key, gasPrice) {
        if (this.js == undefined) {
            return;
        }
        if ((gasPrice || 0) > 0) {
            return;
        }
        try {
            const t = await this.getToken(token);
            if (t.token == token) {
                const kv = await this.js.views.kv(this.quotaBucketName(token));
                const sc = StringCodec();
                kv.put(key, sc.encode(JSON.stringify({})));
            }
        }
        catch (error) {
            return;
        }
    }
    async validateTransactionGasPrice(token, gasPrice) {
        if (this.js == undefined) {
            return;
        }
        const allowedQuota = await this.tokenQuota(token);
        if (allowedQuota == -1 &&
            (gasPrice || 0) < (this.config.defaultGasPrice || 0)) {
            throw new QuotaReached('Gas price too low.');
        }
        const usedQuota = await this.usedQuota(token);
        if (allowedQuota > 0 && usedQuota >= allowedQuota) {
            throw new QuotaReached(`Free transactions quota reached.`);
        }
    }
    quotaBucketName(token) {
        const date = new Date();
        return `${this.config.profilesChannel}-quota-${date.getFullYear() + String(date.getMonth() + 1).padStart(2, '0')}-${token}`;
    }
    tokenBucketName() {
        return `${this.config.profilesChannel}-tokens`;
    }
}
