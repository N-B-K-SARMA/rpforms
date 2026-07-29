import fs from 'fs';
import path from 'path';

export default (client: any) => {
  const interactionsPath = path.join(__dirname, '..', 'interactions');
  const interactionFiles = fs.readdirSync(interactionsPath).filter((file) => file.endsWith('.js'));

  for (const file of interactionFiles) {
    const interaction = require(path.join(interactionsPath, file));
    client.interactions.set(interaction.id, interaction);
  }
};
