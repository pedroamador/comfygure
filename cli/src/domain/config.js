const { toFlat } = require('../format');
const { encrypt, decrypt } = require('../crypto');

module.exports = (client, ui) => {
    const list = function* (project, env, config, all = false) {
        let url = config ?
            `${project.origin}/projects/${project.id}/environments/${env}/configurations/${config}/history` :
            `${project.origin}/projects/${project.id}/environments/${env}/configurations/history`;

        if (all) {
            url += '?all';
        }

        try {
            return yield client.get(url, client.buildAuthorization(project));
        } catch (error) {
            ui.printRequestError(error);
            ui.exit(1);
        }
    };

    const add = function* (project, env, content, { configName, tag, defaultFormat }) {
        // TODO: Send the default format to the API
        const body = toFlat(content);

        Object.keys(body).forEach((key) => {
            body[key] = encrypt(body[key], project.privateKey, project.hmacKey);
        });

        const url = `${project.origin}/projects/${project.id}/environments/${env}/configurations/${configName}/${tag}`;

        try {
            yield client.post(url, body, client.buildAuthorization(project));
        } catch (error) {
            ui.printRequestError(error);
            ui.exit(1);
        }
    };

    const get = function* (project, env, { configName = 'default', tag }) {
        let url = `${project.origin}/projects/${project.id}/environments/${env}/configurations`;

        if (configName && tag) {
            url += `/${configName}/${tag}`;
        } else if (configName || tag) {
            url += `/${configName || tag}`;
        }

        let response;
        try {
            response = yield client.get(url, client.buildAuthorization(project));
        } catch (error) {
            ui.printRequestError(error);
            ui.exit(1);
        }

        const { body } = response;

        Object.keys(body).forEach((key) => {
            body[key] = decrypt(body[key], project.privateKey, project.hmacKey);
        });

        return { body };
    };

    return { list, add, get };
};
