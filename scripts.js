const { PublicClientApplication } = require('@azure/msal-node');
const fetch = require('node-fetch');

const clientId = '';
const clientSecret = '';
const tenantId = '';
const scope = 'https://graph.microsoft.com/.default'; // Use appropriate scope for the desired API endpoint

async function main() {
    // Create MSAL PublicClientApplication instance
    const pca = new PublicClientApplication({
        auth: {
            clientId,
            authority: `https://login.microsoftonline.com/${tenantId}`
        }
    });

    // Acquire a token using client credentials
    const tokenResponse = await pca.acquireTokenByClientCredential({
        scopes: [scope],
        clientSecret
    });

    if (!tokenResponse || !tokenResponse.accessToken) {
        console.log('Failed to acquire access token.');
        return;
    }

    // Make a request to the Microsoft Graph API using the acquired access token
    const graphEndpoint = 'https://graph.microsoft.com/v1.0/me'; // Replace with the desired API endpoint
    const response = await fetch(graphEndpoint, {
        headers: {
            Authorization: `Bearer ${tokenResponse.accessToken}`
        }
    });

    if (!response.ok) {
        console.log('API request failed:', response.statusText);
        return;
    }

    const data = await response.json();
    console.log('API response:', data);
}

main().catch((error) => {
    console.log('An error occurred:', error);
});
