import { inject } from '@vercel/analytics'
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

	inject()

	if (req.method === 'POST') {
		if (req.body && req.body.message) {
			const { message } = req.body

			if (message.text) {
				const text = message.text.trim()

				try {
					if (text === '/start') {
						await bot.sendMessage(
							message.chat.id,
							"Welcome to Scribd Viewer Bot! 🎉 Simply send a Scribd document link, and I'll convert it into an accessible link just for you."
						)
					} else if (text === '/help') {
						await bot.sendMessage(
							message.chat.id,
							'To use Scribd Viewer Bot, just send me a Scribd document link (ex: https://www.scribd.com/document/728268049/Makalah-Analisis-Dan-Perancangan-Sistem-Informasi). No commands needed — simply drop the link.'
						)
					} else if (text === '/creator') {
						await bot.sendMessage(
							message.chat.id,
							'Created with ♡ by @handikatriarlan'
						)
					} else if (text.includes('scribd.com/document/')) {
						const embedUrl = convertToEmbedUrl(text)
						if (embedUrl) {
							await bot.sendMessage(
								message.chat.id,
								"Here's your Scribd Accessible Link:",
								{
									reply_markup: {
										inline_keyboard: [
											[{ text: 'Open', url: embedUrl }],
										],
									},
								}
							)
						} else {
							await bot.sendMessage(
								message.chat.id,
								'Invalid Scribd Link. Please provide a valid Scribd document Link.'
							)
						}
					} else {
						await bot.sendMessage(
							message.chat.id,
							'Please send a valid Scribd document link or use one of the available commands: /start, /help, /creator'
						)
					}
					console.log('Message sent successfully')
				} catch (error) {
					console.error('Error sending message:', error)
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
