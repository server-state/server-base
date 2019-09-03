const express = require('express');
const app = express();
const port = 8080;

app.get('/stats', async (/*req, res*/) => {
    
});

console.log('Listening on port: ', port);
app.listen(port);
