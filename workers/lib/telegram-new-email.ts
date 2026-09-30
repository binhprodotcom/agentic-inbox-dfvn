/** Notify the private Telegram chat after an inbound message has been saved. */
export interface NewInboxEmail {
	mailbox: string;
	from: string;
	subject: string;
}

export interface TelegramEmailEnv {
	TELEGRAM_BOT_TOKEN?: string;
	TELEGRAM_CHAT_ID?: string;
}

const clean = (value: string, max: number) =>
	value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);

export async function notifyTelegramNewEmail(env: TelegramEmailEnv, mail: NewInboxEmail): Promise<void> {
	if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
	const text = [
		"✉️ Email mới · DAFONT",
		`Hộp thư: ${clean(mail.mailbox, 120)}`,
		`Từ: ${clean(mail.from, 180)}`,
		`Chủ đề: ${clean(mail.subject || "(Không có chủ đề)", 240)}`,
		"Xem: https://ib.dafont.vn",
	].join("\n");

	let response: Response;
	try {
		response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
		});
	} catch {
		throw new Error("Telegram request failed");
	}
	if (!response.ok) throw new Error(`Telegram sendMessage returned HTTP ${response.status}`);
}
