import { showPrices } from '../lib/pricing.ts';

/** Questions about how the product works. Shown on Home and Help, and marked up as FAQPage for search. */
const PAID: Array<[string, string]> = [
  ['Is the preview really free?', 'Yes. You can personalise and watch the full video with a watermark as many times as you like. You only pay to download the HD video without the watermark.'],
  ['How do I check it with my family before paying?', 'On the last step, tap "Share preview". You get a link you can send on WhatsApp. Family can watch the watermarked preview but cannot download it.'],
];

/** The same two answers while HD downloads are free (see lib/pricing). */
const FREE: Array<[string, string]> = [
  ['Is it really free?', 'Yes. You can personalise and watch the full video as many times as you like, and download the HD video without the watermark for free.'],
  ['How do I check it with my family before downloading?', 'On the last step, tap "Share preview". You get a link you can send on WhatsApp. Family can watch the watermarked preview but cannot download it.'],
];

const REST: Array<[string, string]> = [
  ['Why does my phone make the video?', 'Your video is made on your own phone or computer, which keeps it private and fast. It usually takes under a minute. Keep the page open until it finishes.'],
  ['How do I send the video on WhatsApp?', 'When the video is ready, tap "Send on WhatsApp" and pick the chat. On iPhone you can also choose "Save video" to keep it in Photos.'],
  ['Can I change the video after downloading?', 'Yes. Open it from My Videos, make your changes, and make the HD video again.'],
  ['Do I need an account?', 'Not to try it. To keep your videos safe, share a preview, or download, sign in with your email. We send a 6-digit code, no password needed.'],
];

export const getFaq = (): Array<[string, string]> => [...(showPrices() ? PAID : FREE), ...REST];
