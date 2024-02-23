from flask import Flask, jsonify, request, render_template
import subprocess
from flask_mail import Mail, Message
from apscheduler.schedulers.background import BackgroundScheduler
from flask_cors import CORS
import configparser
import logging
import os

# Load configuration from config.ini
config = configparser.ConfigParser()
config.read('config.ini')

# Flask configuration
FLASK_PORT = int(config['Flask']['Port'])
DEBUG_MODE = config['Flask'].getboolean('debug_mode')

# Logging configuration
log_level = config['Logging'].get('Level', 'INFO')  # Read logging level from config.ini
log_level = getattr(logging, log_level.upper(), logging.INFO)  # Convert log level string to logging constant
log_file = os.path.join(os.path.dirname(__file__), 'app.log')  # Path to the log file in the app directory
logging.basicConfig(filename=log_file, level=log_level, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Email configuration
app.config.update(
    MAIL_SERVER=config['Email']['Server'],
    MAIL_PORT=int(config['Email']['Port']),
    MAIL_USE_TLS=config['Email'].getboolean('UseTLS'),
    MAIL_USE_SSL=config['Email'].getboolean('UseSSL'),
    MAIL_USERNAME=config['Email']['Username'],
    MAIL_PASSWORD=config['Email']['Password'],
    MAIL_DEFAULT_SENDER=config['Email']['DefaultSender']
)
mail = Mail(app)

# Dictionary to store service information
services = {}

def check_services_status():
    # Check the status of services by executing bash commands.
    global services
    bash_commands = """
        service_files=$(systemctl list-unit-files --type=service | awk '/service/{print $1}')

        # Initialize variable to store output
        output=""

        # Loop through each service file and check its status
        for service_file in $service_files; do
            # Remove the "@" symbol from the service name
            service_name="${service_file//@/}"
            status=$(systemctl is-active "$service_name")
            output="$output$service_name: $status\n"
        done

        # Output the collected data
        echo -n "$output"
    """

    # use try/except to handle the exceptions
    try:

        # get the service:status format from the bash commands
        commands_output = subprocess.run(['bash', '-c', bash_commands], shell=False, stdout=subprocess.PIPE,stderr=subprocess.PIPE)

        # use decode to convert Bytes to string
        service_data = commands_output.stdout.decode()

        # Split the output into arrays of lines (services)
        lines = service_data.strip().split('\n')

        
        for line in lines:

            # split each line to store service name and status of each service
            service_name, status = line.split(': ')

            # send email in case of any change in the service status comparing to the previous value in the dict
            if service_name in services and services[service_name] != status:
                send_email(service_name, status) 

            # store the new value in the dict    
            services[service_name] = status

        logger.info("Services check completed")

    except Exception as e:
        logger.error(f"Error checking services status: {e}")

def send_email(service_name, status):
    # Send email notification for service status changes.
    with app.app_context():
        try:
            subject = "Service Change Notification"

            # Render the HTML template with dynamic data
            html_content = render_template('email_template.html', service_name=service_name, status=status)

            # get the recipient value from config.ini
            recipient = config['Email']['recipient']
            
            # define the message details
            message = Message(subject, recipients=[recipient])
            message.html = html_content
            
            # send the email
            mail.send(message)

            logger.info(f"An email has been sent to {recipient} -- {service_name} is {status}")
        except Exception as e:
            logger.error(f"Error sending email: {e}")

def change_service_status(service_name, action):
    # Change the status of the specified service.
    try:
        subprocess.run(['sudo', 'systemctl', action, service_name], check=True)
        logger.info(f"Service status changed: {service_name}={action}")

    except subprocess.CalledProcessError as e:
        logger.error(f"Error changing service status: {e}")

# Call check_services_status() once when the application starts
check_services_status()

# Schedule the check_services_status function to run every configured (inside config.ini) interval
scheduler = BackgroundScheduler()
scheduler.add_job(check_services_status, 'interval', seconds=int(config['SCHEDULER']['Service_Check_Scheduer_Interval']))
scheduler.start()

@app.route('/services', methods=['GET'])
def get_services():
    check_services_status()
    # Endpoint to retrieve the status of all services.
    global services
    return jsonify(services)

@app.route('/services/<service_name>', methods=['POST'])
def control_service(service_name):
    # Endpoint to control the status of a specific service.
    action = request.json.get('action')
    logger.info(f"{action}")

    if action not in ['start', 'stop']:
        return jsonify({'error': 'Invalid action'}), 400

    change_service_status(service_name, action)
    return jsonify({'success': True})

# run the flask app
if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=DEBUG_MODE, port=FLASK_PORT)

