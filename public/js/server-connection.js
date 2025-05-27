// Server connection and authentication test module

class ServerTester {
    constructor() {
        this.serverUrl = document.getElementById('serverUrl').value;
        this.token = null; // Initialize token property
        this.setupEventListeners();
        this.fetchUsers();
    }

    setupEventListeners() {
        document.getElementById('refreshUsersBtn').addEventListener('click', () => this.fetchUsers());
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
        document.getElementById('testUpdateBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.testUpdateUser();
        });
        document.getElementById('testDeleteBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.testDeleteUser();
        });
        document.getElementById('testSuspendBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.testSuspendUser();
        });
    }

    saveServerUrl() {
        this.serverUrl = document.getElementById('serverUrl').value;
        this.updateStatus('statusBox', 'Server URL updated', 'info');
        this.fetchUsers();
    }

    async fetchUsers() {
        try {
            const response = await fetch(`${this.serverUrl}/api/auth/users`, {
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.updateUserTable(data.users || []);
            } else {
                console.error('Failed to fetch users:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
        }
    }

    updateUserTable(users) {
        const tbody = document.getElementById('userTableBody');
        if (!tbody) {
            console.error('User table body element not found');
            return;
        }
        tbody.innerHTML = '';
        
        if (!Array.isArray(users)) {
            console.error('Invalid users data:', users);
            return;
        }

        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user?.id || 'N/A'}</td>
                <td>${user?.name || 'N/A'}</td>
                <td>${user?.email || 'N/A'}</td>
                <td>${user?.status || 'Active'}</td>
            `;
            tbody.appendChild(row);
        });
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

    async testUpdateUser() {
        const userEmail = document.getElementById('updateUserEmail').value;
        const name = document.getElementById('updateName').value;
        const newEmail = document.getElementById('updateEmail').value;

        if (!userEmail) {
            this.updateStatus('updateStatusBox', 'Please enter a user email', 'warning');
            return;
        }

        if (!name && !newEmail) {
            this.updateStatus('updateStatusBox', 'Please enter either a new name or email', 'warning');
            return;
        }

        const requestPayload = {};
        if (name) requestPayload.name = name;
        if (newEmail) requestPayload.email = newEmail;

        try {
sql to database display generated sql for testing            this.updateStatus('userManagementStatusBox', 'Updating user...', 'info');
            const response = await fetch(`${this.serverUrl}/api/auth/users/email/${encodeURIComponent(userEmail)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestPayload)
            });

            const data = await response.json();
            const statusDetails = `Status: ${response.status} ${response.statusText}\nFull Response: ${JSON.stringify(data, null, 2)}`;

            if (response.ok) {
                this.updateStatus('updateStatusBox', `User updated successfully\n${statusDetails}`, 'success');
            } else {
                this.updateStatus('updateStatusBox', `Update failed (${response.status})\n${statusDetails}`, 'error');
            }
        } catch (error) {
            this.updateStatus('updateStatusBox', `Update request failed: ${error.message}`, 'error');
            console.error('Update user error:', error);
        }
    }

    async testDeleteUser() {
        const userEmail = document.getElementById('deleteUserEmail').value;

        if (!userEmail) {
            this.updateStatus('deleteStatusBox', 'Please enter a user email', 'warning');
            return;
        }

        try {
            // Display the SQL query that would be generated
            const sqlQuery = `DELETE FROM users WHERE email = '${userEmail}';`;
            console.log('Generated SQL Query:', sqlQuery);
            this.updateStatus('deleteStatusBox', `Generated SQL Query: ${sqlQuery}\n\nDeleting user...`, 'info');
            const response = await fetch(`${this.serverUrl}/api/auth/users/email/${encodeURIComponent(userEmail)}`, {
                method: 'DELETE',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });

            if (!response.ok) {
                const contentType = response.headers.get('content-type');
                let errorMessage;
                if (contentType && contentType.includes('application/json')) {
                    const data = await response.json();
                    errorMessage = `Delete failed (${response.status}): ${data.message || 'Unknown error'}`;
                } else {
                    const text = await response.text();
                    errorMessage = `Delete failed (${response.status}): Server returned non-JSON response`;
                }
                this.updateStatus('deleteStatusBox', errorMessage, 'error');
                return;
            }

            const data = await response.json();
            this.updateStatus('deleteStatusBox', `User deleted successfully: ${data.message}`, 'success');
            this.fetchUsers(); // Refresh the user list
        } catch (error) {
            this.updateStatus('deleteStatusBox', `Delete request failed: ${error.message}`, 'error');
            console.error('Delete user error:', error);
        }
    }

    async testSuspendUser() {
        const userEmail = document.getElementById('suspendUserEmail').value;

        if (!userEmail) {
            this.updateStatus('suspendStatusBox', 'Please enter a user email', 'warning');
            return;
        }

        try {
            this.updateStatus('suspendStatusBox', 'Suspending user...', 'info');
            const response = await fetch(`${this.serverUrl}/api/auth/users/email/${encodeURIComponent(userEmail)}/suspend`, {
                method: 'PUT',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                }
            });

            const data = await response.json();
            const statusDetails = `Status: ${response.status} ${response.statusText}\nFull Response: ${JSON.stringify(data, null, 2)}`;

            if (response.ok) {
                this.updateStatus('suspendStatusBox', `User suspended successfully\n${statusDetails}`, 'success');
            } else {
                this.updateStatus('suspendStatusBox', `Suspend failed (${response.status})\n${statusDetails}`, 'error');
            }
        } catch (error) {
            this.updateStatus('suspendStatusBox', `Suspend request failed: ${error.message}`, 'error');
            console.error('Suspend user error:', error);
        }
    }
}

// Initialize the tester when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ServerTester();
});