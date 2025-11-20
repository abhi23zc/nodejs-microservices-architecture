const amqp = require("amqplib")
const logger = require('./logger')
let connection = null
let channel = null;

const EXCHANGE_NAME = 'facebook_events'

async function connectRabbitMQ() {
    try{
        connection = await amqp.connect(process.env.RABBITMQ_URL)
        channel = await connection.createChannel()
        await channel.assertExchange(EXCHANGE_NAME, 'topic', { durable: false })
        logger .info('Connected to RabbitMQ')
        return channel
    }catch(error){
        logger.error('Failed to connect to RabbitMQ', error)
    }
}

async function publishEvent(routingKey, message){
    if(!channel){
        await connectRabbitMQ()

    }
    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)))
    logger.info(`Event published to ${EXCHANGE_NAME} with routing key ${routingKey}`)
}

async function consumeEvent(routingKey, callback){
    if(!channel){
        await connectRabbitMQ()
    }
    const q = await channel.assertQueue('', { exclusive: true })
    channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey)
    channel.consume(q.queue, (msg) => {
        if(msg.content){
            const message = JSON.parse(msg.content.toString())
            callback(message)
            channel.ack(msg)
        }
    })

    logger.info("Subscribed to events with routing key: " + routingKey)
}


module.exports = {
    connectRabbitMQ,
    publishEvent,
    consumeEvent

}