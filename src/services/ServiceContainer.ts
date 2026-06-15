import { IAuthService } from './interfaces/IAuthService';
import { IDatabaseService } from './interfaces/IDatabaseService';
import { IHealthDataService } from './interfaces/IHealthDataService';
import { MockDatabaseService } from './mock/MockDatabaseService';
import { MockAuthService } from './mock/MockAuthService';
import { MockHealthDataService } from './mock/MockHealthDataService';

// Service Container implementing the Service Locator pattern
class ServiceContainer {
  private authServiceInstance!: IAuthService;
  private databaseServiceInstance!: IDatabaseService;
  private healthDataServiceInstance!: IHealthDataService;

  constructor() {
    this.initializeMockServices();
  }

  private initializeMockServices() {
    const mockDb = new MockDatabaseService();
    this.databaseServiceInstance = mockDb;
    this.authServiceInstance = new MockAuthService(mockDb);
    this.healthDataServiceInstance = new MockHealthDataService();
  }

  // Allow dynamic replacement of service implementations (Open-Closed Principle / Dependency Inversion)
  registerAuthService(service: IAuthService) {
    this.authServiceInstance = service;
  }

  registerDatabaseService(service: IDatabaseService) {
    this.databaseServiceInstance = service;
  }

  registerHealthDataService(service: IHealthDataService) {
    this.healthDataServiceInstance = service;
  }

  get authService(): IAuthService {
    return this.authServiceInstance;
  }

  get databaseService(): IDatabaseService {
    return this.databaseServiceInstance;
  }

  get healthDataService(): IHealthDataService {
    return this.healthDataServiceInstance;
  }
}

export const services = new ServiceContainer();
export type { IAuthService, IDatabaseService, IHealthDataService };
