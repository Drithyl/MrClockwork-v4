const fs = require("fs");
const es = require("event-stream");
const logger = require("../logger");

module.exports.parseFileByLines = function(filepath, lineProcessingFunction) {
    
    // Start measuring amount of ms to parse the whole file
    const start = performance.now();
    logger.general(logger.getLeanLevel(), `Parsing "${filepath}"...`);
    
    return new Promise((resolve, reject) => {
        // Start a read stream on file
        const stream = fs.createReadStream(filepath)
            // Use event-stream module to break up every stream chunk into a line
            .pipe(es.split())
            // Iterate through every line in the file
            .pipe(es.mapSync(async (line) => {
        
                // Pause the readstream
                stream.pause();

                // Perform processing for this line
                await lineProcessingFunction(line);
        
                // Resume the readstream to get the next line
                stream.resume();
            })
            .on("error", function(err){
                reject(err);
            })
            // Finished parsing whole file; do post-processing here
            .on("end", function(){
                const end = performance.now();
                logger.general(logger.getLeanLevel(), `Finished parsing lines. Total time taken: ${(end - start).toFixed(2)}ms.`);
                resolve();
            })
        );
    });
};
