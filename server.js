const express = require('express');
const fs = require('fs');
const http = require('http');
const cors = require('cors');
const WebSocket = require('ws');

const NodeCache = require('node-cache');
const myCache = new NodeCache();
const ws = new WebSocket('wss://dexternominations.space');
const bodyParser = require('body-parser');
const axios = require('axios');
const path = require('path');

require('dotenv').config();

const wsPort = process.env.NEXT_PUBLIC_WS_PORT;
const webPort = process.env.NEXT_PUBLIC_WEB_PORT;
const siteDomain = process.env.NEXT_PUBLIC_SITE_DOMAIN;

const app = express();
const PORT = process.env.PORT || wsPort;

app.use(
  cors({
    origin: [siteDomain, '*'],
  }),
);

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Create an HTTP server
const server = http.createServer(app);

// Create a WebSocket server
const wss = new WebSocket.Server({ server });

// Current connection handler
wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
  //  console.log('received: %s', message);

    try {
      const jsonMessage = JSON.parse(message); // Parse the received message
      // Handle the JSON message as needed
    //  console.log('Received JSON message:', jsonMessage);

      // Broadcast the JSON message to all clients
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(jsonMessage)); // Send the JSON message as a string
        }
      });
    } catch (error) {
      console.error('Error parsing message as JSON:', error);
      // Handle the non-JSON message separately
    }
  });

  // ws.send('something');
});

ws.on('open', () => {
  //console.log('Connected to the WebSocket server');

  setInterval(async () => {
    try {
      const response = await axios.get(`${siteDomain}${webPort}/api/newvotes`);
      const data = response.data;

      // Get the previously cached data
      const oldData = myCache.get('data');
    //  console.log('CACHE!!!!!!!!!!!!!!!!!!!!!!!!!!!');
      // If data has changed, cache the new data and send a WebSocket message
      if (JSON.stringify(data) !== JSON.stringify(oldData)) {
        myCache.set('data', data);
        console.log('!!DIFFFF');
        // Send the updated data to the WebSocket server
        if (ws.readyState === WebSocket.OPEN) {
          const wsData = {
            message: 'results',
            command: 'data_reload',
          };
          ws.send(JSON.stringify(wsData));
        }
      }
    } catch (error) {
      console.error(error);
    }
  }, 8000); // Check every 8 seconds
});

ws.on('error', (error) => {
  console.error(`Could not connect to WebSocket server: ${error}`);
});

server.listen(PORT, () => {
  console.log(`HTTP and WebSocket server is running on port ${PORT}`);
});
