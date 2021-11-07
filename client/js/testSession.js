
    // test for the sessionID in local storage and then scope it to a variable to be used later
    let testSessionID = localStorage.getItem("sessionId");
    
    // going to keep this if/then here until we are 100% certain how we are going to code this.
    if (testSessionID !== null) {
        
        // one was stored so source that to the const
        const sessionIdValue = testSessionID;

        console.log(`Stored sessionId is ${localStorage.getItem("sessionId")}`);
        
    } else {
        
        // there isn't a session ID 
        console.log(`No session ID`);
        
        const sessionIdValue = null;
        
    }
    
    // now create a variable that we can access when we need to look for the sessionID
    let userSessionID = {id: testSessionID};
