
**Start of Prompt*

please refer to fixxitprd.md for overall system context first.

Always generate a tasklist, display the tasklist and maintain throughout the development.  

Review all of the existing code before any coding.

Develop a robust backend API based on the Apache LAMP stack with a MySQL database.

Select the best tool set to develope the api, probably React and Express.js but you can suggest a better altwernative.

The API must be designed to manage several types of data including text and images.

The API must be able to handle a standard user profile, this includes sign up, sign in, view profile, edit profile, delete profile, and any other standard user management endpoints. Usera may be members of the public or employees who will have to have additional profile data including employment information including internal teams, etc.

API must also have endpoints to accept incoming reporting on hazardous items or defects such as a tripping hazard in a street or or a potential blockage in the street. These are only simple examples. The incoming theater will include up to 3 photographs, a description of the hazard, a location which may include a description of the location and geo-coordinates, there may be additional information coming in which would include the user it may or may not already have a profile in the system, which means that the system should be able to accept anonymous reports. 

The API must also support the requirements of a backhand administrative dashboard which will include a real-time display of incoming reports and a work order, job allocation system which will attach a message and a reference to or copy of the report which is forwarded to a company user for a remediation.  This must also include the option to accept or reject the work order allocation, reallocation of the original report, acceptance of the work order, scheduling of the remediation, acceptance of the scheduling via the main dashboard, the mobile application will also be used by the remediator to document the work undertaken and to include photographs of the remediation or fix for the issue. So the API must have endpoints to allow all of this. activity 

Suggest the best approach to realtime monitoring / reporting for the admin dashboard, do not re-invent the wheel, use a tested system or a;roach.

In addition the API will have to have endpoints which will rely on reporting of both the incoming incidents and staff and remediation data, the API should also have endpoints to allow the system to be backed up from the dashboard 

The business of this back-end system is detailed below. 

You also need to conside how best to secure and provide backup for the code and data.  May include load balancing.

Please think as an experience system architect and as an experienced programmer use the best practices and as a first stage develop all of the tasks that are required to build this system, present the task list or write it into tasks.md file and then work through the tasks individually marking each task is complete when the task has been accepted us complete



**Requirements:**

1. **Framework & Language:**
   - Use React and Express.js.
   - Ensure the code adheres to best practices in PHP development.

2. **Database Design:**
   - Define and build all necessary database tables in MySQL.
   - Provide a schema outlining tables, relationships, and data types.

3. **Code Structure:**
   - The backend application should be designed for easy extensibility. Use a modular approach with clear separation of concerns.
   - Throughout the codebase, include comprehensive documentation within each module:
     - Use header sections to explain the intent and functionality of each part of the program.
     - Each function must be well-commented, detailing its purpose and functionality.

4. **Best Practices:**
   - Apply industry best practices in coding standards, security, performance optimization, and maintainability.
   - Think like a senior development architect/programmer to ensure high-quality code architecture.

5. **Output:** 
   - Provide well-structured, clean code that meets all the outlined requirements.
   - Ensure documentation facilitates understanding for future developers.

**End of Prompt*