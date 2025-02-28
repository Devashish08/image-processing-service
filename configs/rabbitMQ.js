const amqp = require('amaqlib')
const dotenv = require('dotenv')

dotenv.config()

let channel = null;

const connectToRabbitMQ = async() =>