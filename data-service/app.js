const express = require('express'); 
const app = express(); 
const port = 4000; 
app.use(express.json());

const envVars = process.env;
const applicationVersion = process.env['APPLICATION_VERSION'] || 'unknown';
console.log(process.env);

app.get('/', (req, res) => { 
  res.status(200).json(
    {
      service: 'data-service',
      envVars
    });
});

app.get('/data', (req,res) => {
  res.status(200).json(
    {
      source: 'data-service',
      applicationVersion
    }
  )
})

app.listen(port, () => { 
  console.log(`Server started on port ${port}`); 
});
