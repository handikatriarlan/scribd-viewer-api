import TelegramBot from 'node-telegram-bot-api'

function convertToEmbedUrl(url) {
	const regex = /scribd.com\/document\/(\d+)/
	const match = url.match(regex)

	if (match && match[1]) {
		const documentId = match[1]
		return `https://www.scribd.com/embeds/${documentId}/content`
	}

	return null
}

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false })

export default async function handler(req, res) {
	console.log('Received request:', req.method, JSON.stringify(req.body))

	if (req.method === 'POST') {
		if (req.body && req.body.message) {
			const { message } = req.body

			if (message.text && message.text.startsWith('/scribd ')) {
				const url = message.text.split(' ')[1]
				console.log('Processing Scribd URL:', url)
				const embedUrl = convertToEmbedUrl(url)

				if (embedUrl) {
					console.log('Sending embed URL to Telegram')
					try {
						await bot.sendMessage(
							message.chat.id,
							`Here's your Scribd embed URL: ${embedUrl}`
						)
						console.log('Message sent successfully')
					} catch (error) {
						console.error('Error sending message:', error)
					}
				} else {
					console.log('Sending error message to Telegram')
					try {
						await bot.sendMessage(
							message.chat.id,
							'Invalid Scribd URL. Please provide a valid Scribd document URL.'
						)
						console.log('Error message sent successfully')
					} catch (error) {
						console.error('Error sending error message:', error)
					}
				}
			}

			return res.status(200).end()
		}

		const { url } = req.body

		if (!url) {
			console.log('Error: URL is required')
			return res.status(400).json({ error: 'URL is required' })
		}

		const embedUrl = convertToEmbedUrl(url)

		if (embedUrl) {
			console.log('Success: Converted to embed URL', embedUrl)
			res.status(200).json({ embedUrl })
		} else {
			console.log('Error: Invalid Scribd URL', url)
			res.status(400).json({ error: 'Invalid Scribd URL' })
		}
	} else {
		console.log('Error: Method not allowed', req.method)
		res.setHeader('Allow', ['POST'])
		res.status(405).end(`Method ${req.method} Not Allowed`)
	}
}
