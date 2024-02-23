# RHEL 9 Service Status Monitoring & Management System

An advanced system designed to monitor and manage service statuses on Red Hat Enterprise Linux 9.

## Overview

This project comprises a sophisticated architecture combining a Node.js application for the frontend and a Flask backend. The frontend leverages HTML, CSS, and JavaScript to provide a seamless user experience, while the backend seamlessly interfaces with the RHEL system to obtain comprehensive data on services and their statuses. Additionally, it offers robust functionality, including email notifications for service status changes and the ability to control services (start/stop) directly from the frontend.

## Technologies Used

- Node.js
- Express js
- Bootstrap
- JQuery
- Flask
- python
- HTML/CSS/JavaScript

## Installation

Ensure you have npm and Python3 installed on your system.

To install npm, follow the instructions on the official npm website. 

To install Python 3, you can download it from the official Python website.

1. Clone the repository:
```
git clone https://github.com/ghassanolabi/rhel9-service-management-system.git
```


### For the Node.js frontend:

1. Navigate to the frontend directory.
2. Run the following command to install dependencies:
```
npm install
```

4. Create a .env file with the following configurations:
```
IP_ADDRESS=192.168.0.34
PORT=5001
NODE_PORT=5000
```

### For the Flask backend:

1. Navigate to the backend directory.
2. Run the following command to install dependencies:

``` 
pip install -r requirements.txt
```

3. Create a config.ini file with the following configurations:

```
[Email]
Server = example_smtp_server # SMTP server address
Port = 123 # Mail server Port number
UseTLS = True # Whether to use TLS
UseSSL = False # Whether to use SSL
Username = example_username # Your email username
Password = example_password # Your email password
DefaultSender = example_sender@example.com # Default sender email address
Recipient = example_recipient@example.com # Recipient email address

[Flask]
Port = 5001 # Port number for Flask application
DebugMode = False # Debug mode for Flask application

[Logging]
Level = INFO # Logging level

[SCHEDULER]
ServiceCheckSchedulerInterval = 30 # Interval for service check scheduler (in seconds)
```

4. Run the Flask backend (from backend directory):
```
python3 app.py
```

6. Run the Node.js frontend(from frontend directory):
```
node server.js
```

## Usage
Access the frontend dashboard:

Open a web browser and navigate to http://<IP_ADDRESS>:<PORT>, where <IP_ADDRESS> is the IP address configured for the Node.js frontend and <PORT> is the configured port number. Utilize the intuitive interface to efficiently monitor service statuses and exercise precise control over services (start/stop) as needed.

## Contributing

We welcome contributions to enhance this project. Follow these guidelines:

1. Fork the repository
2. Create a new branch (git checkout -b feature/fooBar)
3. Implement your changes
4. Commit your modifications (git commit -am 'Add some fooBar')
5. Push to the branch (git push origin feature/fooBar)
6. Open a Pull Request
