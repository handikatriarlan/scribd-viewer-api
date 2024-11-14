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

bot.onText(/\/start/, (msg) => {
	const chatId = msg.chat.id
	const welcomeMessage = `Hi ${
		msg.from.first_name || 'User'
	}, welcome to the Scribd Embed Bot! 
	Kirimkan link Scribd, dan aku akan mengubahnya menjadi link embed yang bisa kamu akses.`

	bot.sendMessage(chatId, welcomeMessage)
})

bot.on('message', async (msg) => {
	const chatId = msg.chat.id
	const text = msg.text

	if (text && text.includes('scribd.com/document/')) {
		const embedUrl = convertToEmbedUrl(text)

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

			await bot.sendMessage(
				chatId,
				`Berikut adalah link embed untuk dokumen Scribd kamu:\nKlik tombol di bawah untuk membukanya 👇`,
				messageOptions
			)
		} else {
			await bot.sendMessage(
				chatId,
				'URL Scribd tidak valid. Pastikan kamu mengirimkan link dokumen Scribd yang benar.'
			)
		}
	}
})
