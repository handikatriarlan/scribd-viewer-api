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
	} else if (req.method === 'GET') {
		console.log('Received GET request (possibly from Telegram)')
		const { message } = req.body

		if (message && message.text && message.text.startsWith('/scribd ')) {
			const url = message.text.split(' ')[1]
			console.log('Processing Scribd URL:', url)
			const embedUrl = convertToEmbedUrl(url)

			if (embedUrl) {
				console.log('Sending embed URL to Telegram')
				await bot.sendMessage(
					message.chat.id,
					`Here's your Scribd embed URL: ${embedUrl}`
				)
			} else {
				console.log('Sending error message to Telegram')
				await bot.sendMessage(
					message.chat.id,
					'Invalid Scribd URL. Please provide a valid Scribd document URL.'
				)
			}
		} else {
			console.log('Received GET request without valid Scribd command')
		}

		res.status(200).end()
	} else {
		console.log('Error: Method not allowed', req.method)
		res.setHeader('Allow', ['POST', 'GET'])
		res.status(405).end(`Method ${req.method} Not Allowed`)
	}
}
