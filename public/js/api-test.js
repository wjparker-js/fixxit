// Version tracking
const VERSION = '1.0.0';

document.addEventListener('DOMContentLoaded', function() {
    // Display version
    document.getElementById('versionDisplay').textContent = `v${VERSION}`;
    console.log('API Tester initialized - Version:', VERSION);

    // Load saved server URL
    const savedServerUrl = localStorage.getItem('fixxitServerUrl');
    if (savedServerUrl) {
        document.getElementById('serverUrl').value = savedServerUrl;
    } else {
        // Default to localhost if no saved URL
        document.getElementById('serverUrl').value = 'http://localhost:3000';
        localStorage.setItem('fixxitServerUrl', 'http://localhost:3000');
    }
    
    // Load saved token
    const savedToken = localStorage.getItem('fixxitAuthToken');
    if (savedToken) {
        document.getElementById('authToken').value = savedToken;
        document.getElementById('tokenStatus').style.display = 'inline';
    }
    
    // Initialize event listeners
    function initializeEventListeners() {
        // SQL Log buttons
        document.getElementById('refreshLogsBtn').addEventListener('click', fetchSqlLogs);
        document.getElementById('clearLogsBtn').addEventListener('click', clearSqlLogs);
        
        // Clear token button
        document.getElementById('clearTokenBtn').addEventListener('click', function() {
            document.getElementById('authToken').value = '';
            localStorage.removeItem('fixxitAuthToken');
            document.getElementById('tokenStatus').style.display = 'none';
        });

        // Test buttons event listeners
        document.querySelectorAll('.btn-primary[data-endpoint]').forEach(button => {
            button.addEventListener('click', () => testEndpoint(button.dataset.endpoint));
        });
    }

    // Call initialize function
    initializeEventListeners();
    
    // Initialize additional event listeners
    document.getElementById('saveServerUrlBtn').addEventListener('click', saveServerUrl);
    document.getElementById('testConnectionBtn').addEventListener('click', checkServerStatus);
    
    // Check server status
    checkServerStatus();
    
    // Test API availability
    testApiAvailability();
});

// Function to test API availability
async function testApiAvailability() {
    console.log('Testing API availability...');
    const serverUrl = localStorage.getItem('fixxitServerUrl') || 'http://localhost:3000';
    const statusElement = document.getElementById('serverStatus');
    
    try {
        // Try to connect to the API health endpoint
        const response = await fetch(`${serverUrl}/api/health`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000),
            mode: 'cors',
            credentials: 'same-origin'
        });
        
        if (response.ok) {
            console.log('API is available');
            statusElement.innerHTML += `<div class="mt-2 small text-success">✓ API endpoints are accessible</div>`;
        } else {
            console.warn('API returned non-OK status:', response.status);
            statusElement.innerHTML += `<div class="mt-2 small text-warning">⚠️ API returned status ${response.status}</div>`;
        }
    } catch (error) {
        console.error('API availability test failed:', error);
        statusElement.innerHTML += `<div class="mt-2 small text-danger">✗ API endpoints may not be accessible: ${error.message}</div>`;
    }
}

// Function to save server URL
function saveServerUrl() {
    console.log('Saving server URL...');
    const serverUrl = document.getElementById('serverUrl').value.trim();
    if (serverUrl) {
        localStorage.setItem('fixxitServerUrl', serverUrl);
        alert('Server URL saved successfully!');
        checkServerStatus();
    } else {
        alert('Please enter a valid server URL');
    }
}

// Function to check server status
async function checkServerStatus() {
    console.log('Checking server status...');
    const statusElement = document.getElementById('serverStatus');
    const serverUrl = localStorage.getItem('fixxitServerUrl') || 'http://localhost:3000';
    
    statusElement.className = 'alert alert-info';
    statusElement.innerHTML = `<strong>Server Status:</strong> Connecting to ${serverUrl}...`;
    
    try {
        console.log('Checking server status for:', serverUrl);
        
        // First try to connect to the API health endpoint
        const startTime = performance.now();
        const response = await fetch(`${serverUrl}/api/health`, {
            method: 'GET',
            headers: { 
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-API-Tester': 'true'
            },
            signal: AbortSignal.timeout(5000),
            mode: 'cors',
            credentials: 'include',
            cache: 'no-cache'
        });
        
        const endTime = performance.now();
        const responseTime = (endTime - startTime).toFixed(2);
        
        console.log('API health endpoint response:', response.status, response.statusText);
        
        if (response.ok) {
            const data = await response.json();
            console.log('API health data:', data);
            
            statusElement.className = 'alert alert-success';
            statusElement.innerHTML = `
                <div>
                    <strong>Server Status:</strong> <span class="connection-success">✓ Connected</span>
                    <div class="request-info mt-2">
                        <div>URL: ${serverUrl}/api/health</div>
                        <div>Response Time: ${responseTime}ms</div>
                        <div>Response Body:</div>
                        <pre>${JSON.stringify(data, null, 2)}</pre>
                    </div>
                </div>`;
        } else {
            let errorDetails = `
                <div class="request-info mt-2">
                    <div>Status: ${response.status} ${response.statusText}</div>
                    <div>URL: ${serverUrl}/api/health</div>
                    <div>Response Time: ${responseTime}ms</div>
                </div>`;
            
            try {
                const errorData = await response.json();
                errorDetails += `
                    <div class="request-info mt-2">
                        <div>Response Body:</div>
                        <pre>${JSON.stringify(errorData, null, 2)}</pre>
                    </div>`;
            } catch (e) {
                errorDetails += `
                    <div class="request-info mt-2">
                        <div>No JSON response body available</div>
                    </div>`;
            }
            
            statusElement.className = 'alert alert-danger';
            statusElement.innerHTML = `
                <div>
                    <strong>Server Status:</strong> <span class="connection-error">✗ Connection failed</span>
                    ${errorDetails}
                </div>`;
            
            // Try fallback endpoint for additional debugging
            try {
                console.log('Trying API auth endpoint as fallback');
                const fallbackResponse = await fetch(`${serverUrl}/api/auth/status`, {
                    method: 'GET',
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(5000)
                });
                
                if (fallbackResponse.ok) {
                    statusElement.innerHTML += `
                        <div class="alert alert-warning mt-2">
                            <strong>Note:</strong> Health endpoint failed but auth endpoint is responding.
                            This might indicate a partial service availability.
                        </div>`;
                }
            } catch (fallbackError) {
                console.error('Fallback endpoint also failed:', fallbackError);
            }
        }
    } catch (error) {
        console.error('Server status check failed:', error);
        
        statusElement.className = 'alert alert-danger';
        statusElement.innerHTML = `
            <div>
                <strong>Server Status:</strong> <span class="connection-error">✗ Connection failed</span>
                <div class="request-info mt-2">
                    <div>Error: ${error.message}</div>
                    <div>URL: ${serverUrl}/api/health</div>
                </div>
            </div>`;
    }
}