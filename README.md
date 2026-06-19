TEAM - NEXUS CARE
CardioTrack

CardioTrack is a university project developed as part of my Health Informatics studies. It is a real time health monitoring system that collects vital signs from a pulse oximeter sensor, stores the data in MongoDB, and displays the readings on a web based dashboard.

The project was built to explore how patient related sensor data can be collected, transmitted, stored, visualized, and exported for further analysis.

Overview

CardioTrack simulates a basic remote patient monitoring workflow. Sensor readings are collected from hardware, sent to a backend server, stored in a database, and shown on a live dashboard.

The system displays key vital signs such as:

* Heart rate
* Average heart rate
* Blood oxygen level
* Estimated blood pressure
* Timestamped measurement records

The application also includes an admin data view where stored measurements can be filtered and downloaded for analysis.

Tech Stack

Backend

* Node.js
* Express.js
* WebSocket
* REST API
* Mongoose

Database

* MongoDB Atlas
* MongoDB data modelling with Mongoose schemas

Frontend

* HTML
* CSS
* JavaScript
* Real time dashboard interface
* Data visualization for vital signs

Hardware and Data Collection

* Arduino
* MAX30102 pulse oximeter sensor
* Serial communication
* Local hardware server using Node.js and SerialPort

Deployment and Development

* GitHub Codespaces
* Docker
* Docker Compose
* Environment configuration

Main Features

* Real time vital signs monitoring
* WebSocket based live data transmission
* REST API for storing vital sign records
* MongoDB storage for historical measurements
* Dashboard for heart rate, oxygen level, blood pressure, and average heart rate
* Admin view for stored health data
* Data export in JSON and CSV format
* Basic login protection for the dashboard
* Hardware integration using Arduino and MAX30102 sensor

System Architecture

The project follows a simple end to end data pipeline:

1. The MAX30102 sensor collects pulse and oxygen related readings.
2. Arduino processes the raw sensor signals.
3. A local Node.js hardware server reads the serial data.
4. The local server parses the sensor output into structured JSON.
5. The parsed data is sent to the main backend through REST API and WebSocket.
6. The backend stores the data in MongoDB Atlas.
7. The web dashboard displays live readings and visualizations.
8. The admin view allows stored data to be reviewed and exported.

Data Model

Vital sign records are stored in MongoDB using a Mongoose schema.

Each record contains:

{
  oxygen: Number,
  bloodPressure: {
    systolic: Number,
    diastolic: Number
  },
  heartRate: Number,
  avgHeartRate: Number,
  timestamp: Date
}

This structure makes it possible to store time based health measurements and retrieve them later for visualization, reporting, or further analysis.

My Role

My main responsibilities in this university project included:

* Backend development with Node.js and Express.js
* Designing the MongoDB data model
* Creating API endpoints for storing vital signs
* Implementing WebSocket communication for real time updates
* Connecting the backend with the dashboard
* Supporting data visualization features
* Structuring and validating healthcare related data
* Maintaining project documentation
* Contributing to planning, testing, and project coordination

Through this project, I gained practical experience in working with health related data, real time systems, database design, API development, and data visualization.

Data Analytics Relevance

Although CardioTrack is a software project, it also includes several data analytics related components.

The project required:

* Collecting structured data from sensor readings
* Cleaning and parsing raw serial output
* Converting sensor data into usable JSON format
* Storing time based measurements in MongoDB
* Visualizing health indicators on a dashboard
* Exporting stored data for further analysis
* Maintaining data quality and consistency

This helped me understand how raw data moves through a complete pipeline, from collection to storage, visualization, and export.

Additional Data Analytics Experience

Alongside CardioTrack, I have also worked on personal and academic projects in Python. I have used Python and Pandas for data cleaning, filtering, transformation, aggregation, and exploratory data analysis.

I have also built workflow automation projects using n8n, including workflows that process Excel based data, automate repetitive tasks, and improve data handling between systems.

These projects helped strengthen my practical understanding of data preparation, reporting, automation, and structured analysis.

API Endpoints

Store vital signs

POST /api/vitals

Stores a new vital signs record in MongoDB.

Check device status

GET /api/device/status

Returns the current hardware connection status.

Download stored data

GET /api/admin/vitals/download

Downloads all stored vital sign records in JSON format.

Installation

Clone the repository:

git clone https://github.com/Johnbaby2002/cardiotrack.git
cd cardiotrack

Install dependencies:

npm install

Start the server:

npm start

For development with automatic restart:

npm run dev

Environment Setup

Create a ".env" file and add your MongoDB connection string:

MONGODB_URI=your_mongodb_connection_string
PORT=8080

For security reasons, database credentials should not be committed directly to the repository.

Hardware Setup

The hardware part of the project uses an Arduino with a MAX30102 pulse oximeter sensor.

The Arduino reads pulse and oxygen related signals and sends the output through serial communication. The local hardware server reads this serial output, parses the values, and sends them to the backend.

The serial port configuration may need to be changed depending on the device.

Example:

path: "COM7",
baudRate: 115200

What I Learned

This project helped me understand how health data can be collected and managed in a complete digital system. I learned how to connect hardware data collection with backend services, structure health measurements in a database, build real time communication, and present data through a dashboard.

It also strengthened my ability to work with technical documentation, project planning, data quality, and communication within a university project team.

Future Improvements

Possible improvements include:

* User specific patient profiles
* More advanced authentication
* Improved data visualization with charts
* CSV and Excel export
* Filtering by date range
* Alert system for abnormal vital signs
* Deployment to a cloud platform
* Better separation between frontend and backend
* Automated tests for API endpoints

Project Type

University project
Health Informatics
Real time health monitoring
Data collection and visualization
Backend and database development
