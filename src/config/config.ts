export default {
  guildId: '1517919692809961513',

  roles: {
    staff: ['1534982810438471850'],
    admin: ['1534982810438471850'],
    whitelistTeam: ['1534982810438471850'],
    reviewTeam: ['1534982810438471850'],
    allowlisted: '1534982836833095852',
    nonWhitelisted: '', // Optional
  },

  channels: {
    staffReviewChannel: '1534983013136470117', // REPLACE THIS with the Text Channel ID of #whitelist-approve
    acceptedLogChannel: '1537169449625329726',
    rejectedLogChannel: '1537169449625329726',
    reviewLogChannel: '1537169449625329726',
    allowlistLogs: '1537169449625329726',
  },

  embeds: {
    colors: {
      primary: '#D4AF37', // Gold
      success: '#00FF00', // Green
      danger: '#FF0000', // Red
      warning: '#FFFF00', // Yellow
      default: '#000000', // Black
    },
    footer: {
      text: "Horizon City Roleplay - Allowlist Manager",
      iconURL: 'https://i.ibb.co/TBLQsyLf/logo-2-0.png', // Replace with actual logo URL
    },
    logo: 'https://i.ibb.co/TBLQsyLf/logo-2-0.png', // Replace with actual logo URL
    banner: 'https://i.ibb.co/G3b8tt6c/banner-image.png', // Replace with actual banner URL
  },

  settings: {
    deleteDelay: 10000, // Time in ms before deleting the staff channel after action (10s)
    cooldown: 86400000, // Time in ms for cooldown after rejection (e.g. 24h)
    maximumQuestions: 100, // Max questions allowed
  },
};
