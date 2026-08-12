export default {
  guildId: '1504771420650213528',

  roles: {
    staff: ['1531279940677271573'],
    admin: ['1504772154351157288'],
    whitelistTeam: ['1531279940677271573'],
    reviewTeam: ['1531279940677271573'],
    allowlisted: '1531280202020290762',
    nonWhitelisted: '1504806859121361028', // Optional
  },

  channels: {
    staffReviewChannel: '1531281025760497824', // REPLACE THIS with the Text Channel ID of #whitelist-approve
    acceptedLogChannel: '1531280859376914552',
    rejectedLogChannel: '1531280859376914552',
    reviewLogChannel: '1531280859376914552',
    allowlistLogs: '1531281025760497824',
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
      text: "Daddy's Roleplay - Allowlist Manager",
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
