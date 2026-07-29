import { RPForms } from '../core/RPForms';
import { IUser } from '../interfaces/IDatabaseModels';

class UserModel {
  static async ensureUser(discordId: string): Promise<void> {
    await RPForms.database.ensureUser(discordId);
  }

  static async getUser(discordId: string): Promise<IUser | undefined> {
    return await RPForms.database.getUser(discordId);
  }

  static async setCooldown(discordId: string, cooldownUntil: Date | null): Promise<void> {
    await RPForms.database.setUserCooldown(discordId, cooldownUntil);
  }
}

export default UserModel;
