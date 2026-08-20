const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.static('public'));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/auth', require('./routes/authRoutes'));
app.use('/wallet', require('./routes/walletRoutes'));
app.use('/media', require('./routes/mediaRoutes'));

module.exports = app;  