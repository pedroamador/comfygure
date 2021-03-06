import co from 'co';
import logger from '../../logger';

export default handler => (event, context) => {
    co(function* () {
        const body = yield handler({
            ...event,
            body: event.body ? JSON.parse(event.body) : null,
        });

        context.succeed({
            statusCode: 200,
            body: JSON.stringify(body),
        });
    })
    .catch((error) => {
        logger.error('ERROR', error.message);
        logger.error('ERR. STACK', error.stack);

        context.succeed({
            statusCode: error.statusCode || 500,
            body: JSON.stringify({
                message: error.toString(),
                error,
            }),
        });
    });
};
