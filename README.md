# Fixxit Application

## Database Configuration

### Connecting to a Remote MySQL Server

To connect the Fixxit application to a remote MySQL server, follow these steps:

1. **Set Environment Variables**

   Before starting the application, set the following environment variables:

   ```bash
   # Windows Command Prompt
   set DB_HOST=remote-server-address
   set DB_PORT=3306
   set DB_NAME=fixxit
   set DB_USER=remote_username
   set DB_PASS=your_password
   
   # Optional: Enable SSL for secure connections
   set DB_SSL=true
   ```

   ```bash
   # PowerShell
   $env:DB_HOST = "remote-server-address"
   $env:DB_PORT = "3306"
   $env:DB_NAME = "fixxit"
   $env:DB_USER = "remote_username"
   $env:DB_PASS = "your_password"
   
   # Optional: Enable SSL for secure connections
   $env:DB_SSL = "true"
   ```

2. **Create a .env File (Alternative Method)**

   You can also create a `.env` file in the project root with the following content:

   ```
   DB_HOST=remote-server-address
   DB_PORT=3306
   DB_NAME=fixxit
   DB_USER=remote_username
   DB_PASS=your_password
   DB_SSL=false
   ```

3. **Verify Remote MySQL Server Requirements**

   - Ensure the remote MySQL server is running and accessible
   - Verify the MySQL user has appropriate permissions
   - Check that the necessary database exists on the remote server
   - Confirm any firewall rules allow connections on the MySQL port (typically 3306)

4. **Start the Application**

   Once the environment variables are set, start the application as usual.

## Troubleshooting Connection Issues

- **Connection Refused**: Check if the MySQL server is running and the port is open
- **Access Denied**: Verify username and password are correct
- **Host Not Found**: Confirm the hostname or IP address is correct
- **Timeout**: Check network connectivity and firewall settings