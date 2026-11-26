
import { buildMenu } from "../lib/menu.js";

function formatDuration(seconds) {
  let remaining = Math.max(0, Math.floor(Number(seconds) || 0));
  const days = Math.floor(remaining / 86400);
  remaining %= 86400;
  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;
  const minutes = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const parts = [];
  if (days) parts.push(days + "d");
  if (hours) parts.push(hours + "h");
  if (minutes) parts.push(minutes + "m");
  if (secs || !parts.length) parts.push(secs + "s");
  return parts.join(" ");
}

function messageTimestampMs(message) {
  const raw = message && message.messageTimestamp;
  const value = raw && typeof raw.toNumber === "function" ? raw.toNumber() : Number(raw);
  if (!Number.isFinite(value) || value <= 0) return null;
  return value > 1000000000000 ? value : value * 1000;
}

function ownerNumber(config) {
  const owners = Array.isArray(config.ownerNumbers) ? config.ownerNumbers : [];
  return String(owners[0] || "").replace(/\D/g, "");
}

const commands = [
  {
    name: "menu",
    aliases: ["helpme"],
    category: "General",
    description: "Show the branded FEI XMD menu and available command sections.",
    run: async ctx => {
      const menu = buildMenu({ commands: ctx.commands, config: ctx.config, theme: ctx.theme });
      if (ctx.config.imageUrl) {
        try {
          await ctx.send({
            image: { url: ctx.config.imageUrl },
            caption:
              "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏\n" +
              "┏━━⟦ ɪɴғᴏʀᴍᴀᴛɪᴏɴ ⟧━━✦\n" +
              "┃ ❖ WhatsApp Bot by Benfei Tech\n" +
              "┃ ❖ Official pairing portal: " + ctx.config.botUrl + "\n" +
              "┃ ❖ Powered by Benfei Tech\n" +
              "┗━━━━━━━━━━━━✦"
          });
        } catch (error) {
          console.warn("FEI XMD menu artwork could not be sent; using the text menu:", error?.message || error);
        }
      }
      await ctx.reply(menu);
    }
  },
  {
    name: "help",
    category: "General",
    description: "List registered commands and their descriptions.",
    run: async ctx => {
      const rows = (ctx.commands || [])
        .filter(command => !command.hidden)
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(command => "┃ ➤✧ " + ctx.config.prefix + command.name + (command.description ? " — " + command.description : ""));
      const header =
        "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏\n" +
        "┏━━⟦ 📚 ʜᴇʟᴘ ᴄᴇɴᴛᴇʀ ⟧━━✦\n" +
        "┃ ❖ " + rows.length + " ʀᴇɢɪsᴛᴇʀᴇᴅ ᴄᴏᴍᴍᴀɴᴅs\n" +
        "┃\n";
      const chunks = [];
      let current = header;
      for (const row of rows) {
        if (current.length + row.length + 1 > 3300) {
          chunks.push(current.trimEnd() + "\n┗━━━━━━━━━━━━✦");
          current =
            "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏\n" +
            "┏━━⟦ 📚 ʜᴇʟᴘ ᴄᴇɴᴛᴇʀ (ᴄᴏɴᴛɪɴᴜᴇᴅ) ⟧━━✦\n" +
            "┃\n";
        }
        current += row + "\n";
      }
      if (current.trim()) chunks.push(current.trimEnd() + "\n┗━━━━━━━━━━━━✦");
      for (const chunk of chunks) await ctx.reply(chunk);
    }
  },
  {
    name: "ping",
    category: "General",
    description: "Check bot responsiveness and estimated message response time.",
    run: async ctx => {
      const timestamp = messageTimestampMs(ctx.msg);
      const responseMs = timestamp === null ? null : Math.max(0, Date.now() - timestamp);
      await ctx.reply([
        "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏",
        "┏━━⟦ 🏓 ᴘᴏɴɢ ᴛᴇsᴛ ⟧━━✦",
        "┃ ❖ Status: " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡"),
        "┃ ❖ Response: " + (responseMs === null ? "Unavailable" : responseMs + " ms"),
        "┃ ❖ Uptime: " + formatDuration(process.uptime()),
        "┃ ❖ Version: " + ctx.config.version,
        "┗━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },
  {
    name: "alive",
    aliases: ["uptime"],
    category: "General",
    description: "Show bot status, mode and uptime.",
    run: async ctx => {
      await ctx.reply([
        "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏",
        "┏━━⟦ ✅ ʙᴏᴛ sᴛᴀᴛᴜs ⟧━━✦",
        "┃ ❖ " + ctx.config.name + " is " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡"),
        "┃ ❖ Mode: " + String(ctx.mode || "public").toUpperCase(),
        "┃ ❖ Uptime: " + formatDuration(process.uptime()),
        "┃ ❖ Powered by " + ctx.config.ownerName,
        "┗━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },
  {
    name: "owner",
    category: "General",
    description: "Show Benfei Tech owner details.",
    run: async ctx => {
      const number = ownerNumber(ctx.config);
      await ctx.reply([
        "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏",
        "┏━━⟦ 👑 ᴏᴡɴᴇʀ ɪɴғᴏ ⟧━━✦",
        "┃ ❖ Owner: " + ctx.config.ownerName,
        ...(number ? ["┃ ❖ Owner number: +" + number] : []),
        "┗━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },
  {
    name: "support",
    category: "General",
    description: "Show support guidance for FEI XMD.",
    run: async ctx => {
      await ctx.reply([
        "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏",
        "┏━━⟦ 🛟 sᴜᴘᴘᴏʀᴛ ᴄᴇɴᴛᴇʀ ⟧━━✦",
        "┃ ❖ For setup help or bug reports, contact " + ctx.config.ownerName + ".",
        "┃",
        "┃ ➤✧ GitHub: https://github.com/Benfeitech/FEI-XMD",
        "┗━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },
  {
    name: "time",
    category: "General",
    description: "Show the current server time in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }).format(new Date());
      await ctx.reply([
        "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏",
        "┏━━⟦ 🕒 ᴡᴏʀʟᴅ ᴄʟᴏᴄᴋ ⟧━━✦",
        "┃ ❖ Nigeria time: " + value,
        "┗━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },
  {
    name: "date",
    category: "General",
    description: "Show the current date in Nigeria.",
    run: async ctx => {
      const value = new Intl.DateTimeFormat("en-NG", {
        timeZone: "Africa/Lagos",
        weekday: "long",
        day: "2-digit",
        month: "long",
        year: "numeric"
      }).format(new Date());
      await ctx.reply([
        "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏",
        "┏━━⟦ 📅 ᴅᴀᴛᴇ ɪɴғᴏ ⟧━━✦",
        "┃ ❖ Date in Nigeria: " + value,
        "┗━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },
  {
    name: "version",
    category: "General",
    description: "Show FEI XMD version and connection status.",
    run: async ctx => {
      await ctx.reply([
        "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏",
        "┏━━⟦ 📦 ᴠᴇʀsɪᴏɴ ɪɴғᴏ ⟧━━✦",
        "┃ ❖ " + ctx.config.name + " v" + ctx.config.version,
        "┃ ❖ Status: " + (ctx.connectionOpen ? "Online 🟢" : "Connecting 🟡"),
        "┃ ❖ Mode: " + String(ctx.mode || "public").toUpperCase(),
        "┃ ❖ Baileys: official WhiskeySockets npm package",
        "┗━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },
  {
    name: "jid",
    aliases: ["id"],
    category: "General",
    description: "Show the current chat and message sender IDs.",
    run: async ctx => {
      await ctx.reply([
        "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏",
        "┏━━⟦ 💬 ᴄʜᴀᴛ ɪᴅ ɪɴғᴏ ⟧━━✦",
        "┃ ❖ Chat ID: " + ctx.jid,
        "┃ ❖ Sender ID: " + (ctx.senderJid || "Unavailable"),
        "┗━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  },
  {
    name: "whoami",
    category: "General",
    description: "Show your WhatsApp sender information.",
    run: async ctx => {
      await ctx.reply([
        "⚡ 𝙁𝙀𝙄 𝙓𝙈𝘿 𝘽𝙊𝙏",
        "┏━━⟦ 👤 ᴜsᴇʀ ɪɴғᴏ ⟧━━✦",
        "┃ ❖ Name: " + (ctx.msg?.pushName || "Unknown"),
        "┃ ❖ Your ID: " + (ctx.senderJid || "Unavailable"),
        "┃ ❖ Owner: " + (ctx.owner ? "Yes 👑" : "No"),
        "┗━━━━━━━━━━━━✦"
      ].join("\n"));
    }
  }
];

export default commands;
