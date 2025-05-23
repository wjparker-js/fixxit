// Server connection and authentication test module

class ServerTester {
    constructor() {
        this.serverUrl = document.getElementById('serverUrl').value;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('saveUrlBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.saveServerUrl();
        });
        document.getElementById('testConnectionBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.testConnection();
        });
        document.getElementById('testLoginBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.testLogin();
        });
        document.getElementById('testRegisterBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.testRegistration();
        });
    }

    saveServerUrl() {
        this.serverUrl = document.getElementById('serverUrl').value;
        this.updateStatus('statusBox', 'Server URL updated', 'info');
    }

    updateStatus(elementId, message, type) {
        const statusBox = document.getElementById(elementId);
        statusBox.textContent = message;
        statusBox.className = `status-box ${type}`;
    }

    async testConnection() {
        try {
            this.updateStatus('statusBox', 'Testing connection...', 'info');
            const response = await fetch(`${this.serverUrl}/api/health`);
            
            if (response.ok) {
                this.updateStatus('statusBox', 'Server is running and accessible', 'success');
            } else {
                this.updateStatus('statusBox', `Server error: ${response.status} ${response.statusText}`, 'error');
            }
        } catch (error) {
            this.updateStatus('statusBox', `Connection failed: ${error.message}`, 'error');
        }
    }

    async testLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.updateStatus('loginStatusBox', 'Please enter both email and password', 'warning');
            return;
        }

        const requestPayload = { email, password };
        console.log('Login Request Payload:', requestPayload);

        try {
            this.updateStatus('loginStatusBox', 'Testing login...', 'info');
            const response = await fetch(`${this.serverUrl}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(requestPayload)
            });

            let data;
            try {
                data = await response.json();
                console.log('Login Response Data:', data);
            } catch (parseError) {
                data = { error: 'Unable to parse server response' };
                console.error('Failed to parse login response:', parseError);
            }
            
            const errorDetails = data.error || data.message || 'No error details provided';
            const statusDetails = `Status: ${response.status} ${response.statusText}\nError: ${errorDetails}\nFull Response: ${JSON.stringify(data, null, 2)}`;

            if (response.ok) {
                this.updateStatus('loginStatusBox', `Login successful\n${statusDetails}`, 'success');
            } else {
                this.updateStatus('loginStatusBox', `Login failed (${response.status})\n${statusDetails}`, 'error');
            }
        } catch (error) {
            this.updateStatus('loginStatusBox', `Login request failed: ${error.message}`, 'error');
            console.error('Login request error:', error);
        }
    }

    async testRegistration() {
        console.log('Starting registration process...');
        const name = document.getElementById('regName').value;
        const email = document.getElementById('regEmail').value;
        const password = document.getElementById('regPassword').value;
        const confirmPassword = document.getElementById('regConfirmPassword').value;

        console.log('Validating registration input fields...');
        // Client-side validation
        if (!name || !email || !password || !confirmPassword) {
            console.log('Validation failed: Missing required fields');
            this.updateStatus('registerStatusBox', 'Please fill in all fields', 'warning');
            return;
        }

        if (name.length < 3) {
            this.updateStatus('registerStatusBox', 'Name must be at least 3 characters long', 'warning');
            return;
        }

        if (password !== confirmPassword) {
            this.updateStatus('registerStatusBox', 'Passwords do not match', 'warning');
            return;
        }

        if (password.length < 8) {
            this.updateStatus('registerStatusBox', 'Password must be at least 8 characters long', 'warning');
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.updateStatus('registerStatusBox', 'Please enter a valid email address', 'warning');
            return;
        }

        const requestPayload = { name, email, password };
        console.log('Registration Request Payload:', JSON.stringify(requestPayload, null, 2));
        console.log('Verifying name field:', { nameValue: name, nameInPayload: requestPayload.name });

        try {
            this.updateStatus('registerStatusBox', 'Creating new user...', 'info');
            console.log('Sending registration request to:', `${this.serverUrl}/api/auth/register`);
            const response = await fetch(`${this.serverUrl}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                mode: 'cors',
                credentials: 'include',
                body: JSON.stringify(requestPayload)
            });

            let data;
            try {
                console.log('Parsing registration response...');
                data = await response.json();
                console.log('Registration Response:', {
                    status: response.status,
                    statusText: response.statusText,
                    headers: Object.fromEntries(response.headers.entries()),
                    data: data
                });
            } catch (parseError) {
                console.error('Failed to parse registration response:', parseError);
                this.updateStatus('registerStatusBox', 'Server response format error', 'error');
                return;
            }

            const errorDetails = data.error || data.message || 'No error details provided';
            const statusDetails = `Status: ${response.status} ${response.statusText}\nError: ${errorDetails}\nFull Response: ${JSON.stringify(data, null, 2)}`;

            if (response.ok) {
                this.updateStatus('registerStatusBox', `Registration successful\n${statusDetails}`, 'success');
            } else {
                this.updateStatus('registerStatusBox', `Registration failed (${response.status})\n${statusDetails}`, 'error');
                console.error('Registration failed:', statusDetails);
            }
        } catch (error) {
            const errorMessage = `Network error during registration: ${error.message}`;
            this.updateStatus('registerStatusBox', errorMessage, 'error');
            console.error('Registration request error:', error);
        }
    }
}

// Initialize the tester when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ServerTester();
});