
const fs = require("fs");
const path = require("path");
const readline = require("readline");
const config = require("./config/config.json");
const exampleConfig = require("./config/example.config.json");


exports.buildDataPath = () =>
{
    if (config.dataPath.startsWith(".") === true)
        config.dataPath = path.resolve(__dirname, config.dataPath);

    return config;
};

exports.hasConfig = () => fs.existsSync("./config/config.json");

exports.askConfigQuestions = () =>
{
    var config = Object.assign({}, exampleConfig);

    return _promisifiedQuestion("Input bot's login token: ", (answer) =>
    {
        config.loginToken = answer;
    })
    .then(() => _promisifiedQuestion("Input root path to bot data (Enter for default): ", (answer) =>
    {
        if (answer === "")
            return Promise.resolve();

        if (fs.existsSync(answer) === false)
            return Promise.reject("Path does not exist: ");

        config.dataPath = answer;
    }))
    .then(() => _promisifiedQuestion("Input tmp download dir: ", (answer) =>
    {
        if (fs.existsSync(answer) === false)
            return Promise.reject("Path does not exist.");

        config.tmpDir = answer;
    }))
    .then(() => _promisifiedQuestion("Input Dom5 exe path: ", (answer) =>
    {
        if (fs.existsSync(answer) === false)
            return Promise.reject("Path does not exist.");

        config.pathToDom5Exe = answer;
    }))
    .then(() => fs.writeFileSync("./config/config.json", JSON.stringify(config, null, 2)));
};

function _promisifiedQuestion(question, onAnswerHandler)
{
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) =>
    {
        (function _askQuestion()
        {
            rl.question(question, (answer) =>
            {
                Promise.resolve(onAnswerHandler(answer))
                .then(() => resolve())
                .catch((err) => 
                {
                    console.log(err);
                    _askQuestion();
                });
            });
        })();
    });
}