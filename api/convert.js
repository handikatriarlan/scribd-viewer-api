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
	if (req.method === 'POST') {
		const { url } = req.body

		if (!url) {
			return res.status(400).json({ error: 'URL is required' })
		}

		const embedUrl = convertToEmbedUrl(url)

		if (embedUrl) {
			res.status(200).json({ embedUrl })
		} else {
			res.status(400).json({ error: 'Invalid Scribd URL' })
		}
	} else if (req.method === 'GET') {
		const { message } = req.body

		if (message && message.text && message.text.startsWith('/scribd ')) {
			const url = message.text.split(' ')[1]
			const embedUrl = convertToEmbedUrl(url)

			if (embedUrl) {
				await bot.sendMessage(
					message.chat.id,
					`Here's your Scribd embed URL: ${embedUrl}`
				)
			} else {
				await bot.sendMessage(
					message.chat.id,
					'Invalid Scribd URL. Please provide a valid Scribd document URL.'
				)
			}
		}

		res.status(200).end()
	} else {
		res.setHeader('Allow', ['POST', 'GET'])
		res.status(405).end(`Method ${req.method} Not Allowed`)
	}
}
