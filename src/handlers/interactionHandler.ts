import fs from 'fs';
import path from 'path';

export default (client: any) => {
  const interactionsPath = path.join(__dirname, '..', 'interactions');
  const interactionFiles = fs.readdirSync(interactionsPath).filter((file) => file.endsWith('.js'));

  for (const file of interactionFiles) {
    const req = require(path.join(interactionsPath, file));
    const interaction = req.default || req;
    client.interactions.set(interaction.id, interaction);
  }
};
