const express = require('express'); 
const axios = require('axios');
const app = express(); 
const  port = 3000; 
app.use(express.json());

const envVars = process.env;
console.log(process.env);

const dataSourceProtocol = process.env['DATA_SOURCE_PROTOCOL'] || 'http';
const dataSourceHost = process.env['DATA_SOURCE_HOST'] || 'data-source';
const dataSourcePort = process.env['DATA_SOURCE_PORT'] || '4000';
const dataSourceUrl = `${dataSourceProtocol}://${dataSourceHost}:${dataSourcePort}`;

const applicationVersion = process.env['APPLICATION_VERSION'] || 'unknown';

const getHeaderNames = (req) => Object.keys(req.headers);

app.get('/', (req, res) => { 
  res.status(200).json(
    {
      service: 'bff-service',
      envVars
    });
});

app.get('/data', async (req,res) => {

  const headerNames = getHeaderNames(req);
  console.log({headerNames});
  const bffHeaders = headerNames
    .filter(x => x.startsWith('bff-'))
    .reduce((acc, curr) => {
      acc[curr] = req.get(curr);
      return acc;
    }, {});




  const url = `${dataSourceUrl}/data`;
  const config = {headers: bffHeaders};
  console.log(`making request ${url}`, {config})
  const response = await axios.get(url, config);
  res.status(200).json(
    {
      service: 'bff-service',
      applicationVersion,
      dataSource: {
        url: url,
        responseData: response.data
      }
    }
  )
})

app.listen(port, () => { 
  console.log(`Server started on port ${port}, application version: ${applicationVersion}`); 
});
