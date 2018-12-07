const express = require('express');
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const app = express();
const EventEmitter = require('events');

class DataEmitter extends EventEmitter {}
const dataEmitter = new DataEmitter();

app.get('/api/sse', (req,res) => {
    const tenant = req.query.tenant;
    res.status(200).set({
        "connection": "kepp-alive",
        "cache-control": "no-cache",
        "content-type": "text/event-stream"
    });

    dataEmitter.on('data', data => {
        if(tenant === data.tenant) {
            res.write('A data event occured! ' + JSON.stringify(data.event) + '\n\n');
        }
    })

    req.on('end', () => {
        console.log('client closed');
    })
});

app.post('/api',jsonParser, (req, res) => {
    const body = req.body;
    dataEmitter.emit('data', body);
    res.status(200).send();
});

app.listen(3000, () => console.log('Listening on port 3000'));