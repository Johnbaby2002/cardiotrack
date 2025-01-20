const express = require('express');
const cors = require('cors');
const { WebSocketServer } = require('ws');
const http = require('http');
const path = require('path');
const mongoose = require('mongoose');

// MongoDB connection - Fixed connection string format
mongoose.connect('mongodb+srv://cardiotrack:cardiotrack_99@cluster0.2bb7l.mongodb.net/cardiotrack', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Define the VitalSigns schema
const vitalSignsSchema = new mongoose.Schema({
    oxygen: Number,
    bloodPressure: {
        systolic: Number,
        diastolic: Number
    },
    heartRate: Number,
    avgHeartRate: Number,
    timestamp: { type: Date, default: Date.now }
});

const VitalSigns = mongoose.model('VitalSigns', vitalSignsSchema);

const app = express();

// Middleware
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Upgrade', 'Connection', 'Sec-WebSocket-Key', 'Sec-WebSocket-Version']
}));

app.use(express.json());

// Serve static files from the root directory
app.use(express.static(path.join(__dirname)));

// Explicit route for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Configure Serial Port
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const serialPort = new SerialPort({
    path: 'COM7',
    baudRate: 115200
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: '\r\n' }));

// Function to parse raw sensor data
function parseSensorData(data) {
    try {
        if (data.includes("No finger detected")) {
            return null;
        }

        if (data.includes("Oxygen %")) {
            const matches = data.match(/Oxygen % = ([\d.]+)%, BPM = ([\d.]+), Avg BPM = ([\d.]+)/);
            if (matches) {
                const oxygen = parseFloat(matches[1]);
                const bpm = parseFloat(matches[2]);
                const avgBpm = parseFloat(matches[3]);
                
                // Calculate blood pressure based on BPM (this is a simplified estimation)
                const systolic = Math.min(140, Math.max(90, 100 + (avgBpm - 60) * 0.7));
                const diastolic = Math.min(90, Math.max(60, 70 + (avgBpm - 60) * 0.4));

                return {
                    type: 'vitalSigns',
                    data: {
                        oxygen: oxygen,
                        bloodPressure: {
                            systolic: systolic,
                            diastolic: diastolic
                        },
                        heartRate: bpm,
                        avgHeartRate: avgBpm,
                        timestamp: new Date().toISOString()
                    }
                };
            }
        }
        return null;
    } catch (error) {
        console.error('Error parsing sensor data:', error);
        return null;
    }
}

// Process and broadcast sensor data
async function processSensorData(data) {
    const parsed = parseSensorData(data);
    if (parsed) {
        console.log('Processed data:', JSON.stringify(parsed));
        
        // Store in MongoDB
        try {
            const vitalData = new VitalSigns(parsed.data);
            await vitalData.save();
            console.log('Data saved to MongoDB');
        } catch (error) {
            console.error('Error saving to MongoDB:', error);
        }

        // Broadcast to WebSocket clients
        const message = JSON.stringify(parsed);
        wss.clients.forEach(client => {
            if (client.readyState === 1) {
                client.send(message);
            }
        });
    }
}

// API endpoint for storing vital signs
app.post('/api/vitals', async (req, res) => {
    try {
        const vitalData = new VitalSigns(req.body);
        await vitalData.save();
        res.status(201).json(vitalData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serial port data event
parser.on('data', (data) => {
    console.log('Raw data:', data);
    processSensorData(data);
});

// WebSocket connection handler
wss.on('connection', (ws) => {
    console.log('New WebSocket client connected');
    ws.send(JSON.stringify({ 
        type: 'connection', 
        status: 'connected',
        message: 'Successfully connected to CardioTrack server'
    }));

    ws.on('error', console.error);
});

// Error handling for serial port
serialPort.on('error', (err) => {
    console.error('Serial Port Error:', err.message);
});

// Admin data endpoint
app.get('/api/admin/vitals', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 20;
        const skip = (page - 1) * limit;

        // Date filtering
        const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
        const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const query = {
            timestamp: {
                $gte: startDate,
                $lte: endDate
            }
        };

        // Get paginated data
        const vitals = await VitalSigns
            .find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        // Get total count for pagination
        const total = await VitalSigns.countDocuments(query);

        // Calculate statistics
        const stats = await VitalSigns.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    avgOxygen: { $avg: '$oxygen' },
                    avgSystolic: { $avg: '$bloodPressure.systolic' },
                    avgDiastolic: { $avg: '$bloodPressure.diastolic' },
                    avgHeartRate: { $avg: '$heartRate' },
                    totalReadings: { $sum: 1 }
                }
            }
        ]);

        res.json({
            vitals,
            totalPages: Math.ceil(total / limit),
            stats: stats[0] || {
                avgOxygen: 0,
                avgSystolic: 0,
                avgDiastolic: 0,
                avgHeartRate: 0,
                totalReadings: 0
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Serve admin page
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong! Please check the server console.');
});

// Start server
const PORT = process.env.PORT || 8080;
server.listen(PORT, '0.0.0.0', () => {
    const CODESPACE_NAME = process.env.CODESPACE_NAME;
    const publicUrl = CODESPACE_NAME 
        ? `https://${CODESPACE_NAME}-${PORT}.app.github.dev`
        : `http://localhost:${PORT}`;
    console.log(`Server running on port ${PORT}`);
    console.log(`Access the dashboard at ${publicUrl}`);
});

// Handle process termination
process.on('SIGTERM', () => {
    server.close(() => {
        serialPort.close();
        console.log('Server and serial port closed');
    });
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
});