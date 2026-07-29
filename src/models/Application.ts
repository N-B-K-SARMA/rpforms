import { RPForms } from '../core/RPForms';
import { IApplication, ApplicationStatus } from '../interfaces/IDatabaseModels';

class ApplicationModel {
  static async createApplication(discordId: string): Promise<number> {
    return await RPForms.database.insertApplication({ discordId });
  }

  static async getApplicationById(id: number): Promise<IApplication | undefined> {
    return await RPForms.database.getApplicationById(id);
  }

  static async getActiveApplication(discordId: string): Promise<IApplication | undefined> {
    return await RPForms.database.getActiveApplication(discordId);
  }

  static async updateStatus(id: number, status: ApplicationStatus | string, staffChannelId: string | null = null): Promise<void> {
    await RPForms.database.updateApplicationStatus(id, status, staffChannelId);
  }
}

export default ApplicationModel;
