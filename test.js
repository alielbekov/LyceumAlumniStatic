

const graph = require('@microsoft/microsoft-graph-client');
require('isomorphic-fetch');

// Make sure to add your client ID, tenant ID, and client secret here
const clientId = "7be85991-19d2-425b-944b-9539fcc7f675";
const tenantId = "6de2cd9d-74b9-4554-9e41-919b4223ca14";
const clientSecret = "k6c8Q~O7rZHlVkejVtDerb1XIfgIFxZ3Sne9pb33";
const microsoftUserId= "fbbad5b4-3e65-4861-9b2a-83057307afab"

// Build the URL to get the token
const url = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`;

// Request options
const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: `client_id=${clientId}&scope=https%3A%2F%2Fgraph.microsoft.com%2F.default&client_secret=${clientSecret}&grant_type=client_credentials`
};

// Request an access token
fetch(url, options)
  .then(res => res.json())
  .then(json => {
    // Create a client
    const client = graph.Client.init({
      authProvider: (done) => {
        done(null, json.access_token); // Pass the access token to the Graph API
      }
    });

    // File to upload
    const file = {
      name: "test.txt",
      content: "Hello, OneDrive!"
    };

    // Upload the file

    client
    .api(`/users/${microsoftUserId}/drive/root:/Folder/test.txt:/content`)
    .put(file.content)
    .then((res) => {
      console.log('File uploaded successfully');
    })
    .catch((err) => {
      console.log(err);
    });
  

  })
  .catch(err => console.log(err));
