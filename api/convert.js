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

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true })

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
			const messageOptions = {
				reply_markup: {
					inline_keyboard: [
						[
							{
								text: 'Buka Embed Scribd',
								url: embedUrl,
							},
						],
					],
				},
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
