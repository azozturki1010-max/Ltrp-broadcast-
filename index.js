const { 
  Client, 
  GatewayIntentBits, 
  Partials, 
  ActionRowBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  EmbedBuilder, 
  Events, 
  ModalBuilder, 
  TextInputBuilder, 
  TextInputStyle 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async (interaction) => {

  // أمر البث
  if (interaction.isChatInputCommand() && interaction.commandName === 'broadcast') {

    const embed = new EmbedBuilder()
      .setTitle('Broadcast Panel')
      .setDescription('اختر العملية')
      .setColor('Blue');

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('start')
        .setLabel('بدء الإرسال')
        .setStyle(ButtonStyle.Success)
    );

    return interaction.reply({ embeds: [embed], components: [row] });
  }

  // زر البدء
  if (interaction.isButton() && interaction.customId === 'start') {

    const modal = new ModalBuilder()
      .setCustomId('send_modal')
      .setTitle('Broadcast');

    const msgInput = new TextInputBuilder()
      .setCustomId('msg')
      .setLabel('اكتب الرسالة')
      .setStyle(TextInputStyle.Paragraph);

    const row = new ActionRowBuilder().addComponents(msgInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
  }

  // بعد الإدخال
  if (interaction.isModalSubmit() && interaction.customId === 'send_modal') {

    const msg = interaction.fields.getTextInputValue('msg');

    await interaction.reply({ content: 'بدأ الإرسال...', ephemeral: true });

    const members = await interaction.guild.members.fetch();

    let sent = 0;
    let failed = 0;

    for (const member of members.values()) {
      if (member.user.bot) continue;

      try {
        await member.send(msg);
        sent++;
      } catch {
        failed++;
      }

      await new Promise(r => setTimeout(r, 1200));
    }

    await interaction.followUp({
      content: `انتهى\nتم: ${sent}\nفشل: ${failed}`,
      ephemeral: true
    });
  }

});

client.login(process.env.TOKEN);
