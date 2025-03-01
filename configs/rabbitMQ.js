
const amqp = require('amqplib')
const dotenv = require('dotenv')

dotenv.config();

let channel = null;

/**
 * Connect to RabbitMQ and create a channel
 * @returns {Promise<Channel>} The RabbitMQ channel
 */
const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL);
    channel = await connection.createChannel();
    
    // Declare queues that will be used in the application
    await channel.assertQueue('image-processing', { 
      durable: true 
    });
    
    console.log('Connected to RabbitMQ Successfully 🚀');
    return channel;
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    console.log('Attempting to reconnect to RabbitMQ in 5 seconds...');
    setTimeout(connectToRabbitMQ, 5000);
  }
};

/**
 * Send a message to a queue
 * @param {string} queueName - Name of the queue
 * @param {object} data - Data to send
 * @returns {boolean} Success status
 */
const sendToQueue = async (queueName, data) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  
  return channel.sendToQueue(
    queueName, 
    Buffer.from(JSON.stringify(data)),
    { persistent: true }
  );
};

/**
 * Consume messages from a queue
 * @param {string} queueName - Name of the queue 
 * @param {Function} callback - Function to process messages
 */
const consumeQueue = async (queueName, callback) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  
  return channel.consume(queueName, (msg) => {
    if (msg) {
      const data = JSON.parse(msg.content.toString());
      callback(data);
      channel.ack(msg);
    }
  });
};

export {
  connectToRabbitMQ,
  sendToQueue,
  consumeQueue
};