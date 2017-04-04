import λ from './utils/λ';
import checkEventPermission from './utils/checkEventPermission';

import getConfiguration from '../domain/configurations/get';
import getHistory from '../domain/configurations/history';
import addConfiguration from '../domain/configurations/add';

const create = λ(async (event) => {
    const { id: projectId, environmentName, configName, tagName } = event.pathParameters;
    await checkEventPermission(event, projectId, 'write');

    // create new configuration with entries
    return addConfiguration(projectId, environmentName, configName, tagName, event.body);
});

const update = λ(async (event) => {
    //
});

const remove = λ(async (event) => {
    // remove a configuration
});

const get = λ(async (event) => {
    const { id: projectId, environmentName, selector, configName, tagName } = event.pathParameters;
    await checkEventPermission(event, projectId, 'read');

    return getConfiguration(projectId, environmentName, selector, configName, tagName);
});

const history = λ(async (event) => {
    const { id: projectId, environmentName, configName } = event.pathParameters;
    await checkEventPermission(event, projectId, 'read');
    const all = event.queryStringParameters && Object.keys(event.queryStringParameters).includes('all');

    return getHistory(projectId, environmentName, configName, all);
});

export default {
    create,
    update,
    remove,
    get,
    history,
};
