import { provideState, softUpdate } from 'freactal';
import sg from 'sg.js';
import call from 'sg.js/dist/effects/call';
import omit from 'lodash.omit';

import fetchState from './fetch/state';
import wrapWithLoading from './utils/wrapWithLoading';
import wrapWithErrorHandling from './utils/wrapWithErrorHandling';
import fetchConfig from './fetch/fetchConfig';
import updateConfig from './fetch/updateConfig';
import { decrypt, encrypt } from './utils/crypto';
import toFlat from './utils/toFlat';

// `null` and `undefined` are the only types that we cannot stringify
const isNullValue = value => value === null || value === undefined;

export const decryptConfig = (config, passphrase) =>
    Object.keys(config).reduce((acc, key) => {
        const value = config[key];

        if (!isNullValue(value)) {
            return {
                ...acc,
                [key]: decrypt(value.toString(), passphrase),
            };
        }

        return acc;
    }, {});

export const encryptConfig = (config, passphrase) =>
    Object.keys(config).reduce((acc, key) => {
        const value = config[key];

        if (!isNullValue(value)) {
            return {
                ...acc,
                [key]: encrypt(value.toString(), passphrase),
            };
        }

        return acc;
    }, {});

export const getConfigSaga = function*(effects, { passphrase, ...args }) {
    const config = yield call(fetchConfig, args);

    if (config) {
        const decryptedConfig = yield call(decryptConfig, config.body, passphrase);
        yield call(effects.setConfig, decryptedConfig);
        yield call(effects.setError, undefined);
    } else {
        yield call(effects.setError, 'Not found');
    }
};

export const removeConfigKeySaga = function*(effects, { passphrase, config, key, ...args }) {
    const newConfig = omit(config, key);
    const flatConfig = yield call(toFlat, newConfig);
    const encryptedConfig = yield call(encryptConfig, flatConfig, passphrase);
    yield call(updateConfig, { ...args, config: encryptedConfig });
    yield call(effects.setConfig, newConfig);
};

export const updateConfigSaga = function*(effects, { passphrase, config, ...args }) {
    const flatConfig = yield call(toFlat, config);
    const encryptedConfig = yield call(encryptConfig, flatConfig, passphrase);
    yield call(updateConfig, { ...args, config: encryptedConfig });
    yield call(effects.toggleEdition);
    yield call(effects.setConfig, config);
};

export const state = {
    initialState: () => ({
        ...fetchState.state,
        config: undefined,
        edition: false,
        error: undefined,
        loading: false,
    }),
    effects: {
        ...fetchState.effects,
        setConfig: softUpdate((state, config) => ({ config, newConfig: config })),
        toggleEdition: softUpdate(({ edition }) => ({ edition: !edition })),
        loadConfig: wrapWithErrorHandling(wrapWithLoading((effects, args) => sg(getConfigSaga)(effects, args))),
        removeConfigKey: wrapWithErrorHandling(
            wrapWithLoading((effects, args) => sg(removeConfigKeySaga)(effects, args)),
        ),
        saveConfig: wrapWithErrorHandling(wrapWithLoading((effects, args) => sg(updateConfigSaga)(effects, args))),
        setNewConfig: softUpdate((state, newConfig) => ({ newConfig: JSON.parse(newConfig) })),
    },
};

export default provideState(state);
