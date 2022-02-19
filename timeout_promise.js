
const { TimeoutError } = require("./errors/custom_errors");

module.exports = TimeoutPromise;

function TimeoutPromise(handler, timeout)
{
    return new Promise((resolve, reject) =>
    {
        const _timeout = timeout ?? 60000;
        var _wasSettled = false;

        // Introduce a timeout mechanism in case the process hangs for too long
        setTimeout(() =>
        {
            if (_wasSettled === false)
            {
                reject(new TimeoutError(`Promise timed out`));
                _wasSettled = true;
            }

        }, _timeout);

        handler(_resolve, _reject);

        function _resolve(returnVal)
        {
            if (_wasSettled === false)
                resolve(returnVal);
            
            _wasSettled = true
        }

        function _reject(err)
        {
            if (_wasSettled === false)
                reject(err);
            
            _wasSettled = true
        }
    });
}