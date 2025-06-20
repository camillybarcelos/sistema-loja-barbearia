import React from 'react';
import { Product, Service, Barber, Customer, Sale, Commission, Appointment, CreditAccount, CreditTransaction } from '../types';

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    products: Product[];
    services: Service[];
    barbers: Barber[];
    customers: Customer[];
    sales: Sale[];
    commissions: Commission[];
    appointments: Appointment[];
    creditAccounts: CreditAccount[];
    creditTransactions: CreditTransaction[];
  };
}

export class BackupManager {
  private static readonly BACKUP_KEY = 'styleShop_backup';
  private static readonly VERSION = '1.0.0';
  private static readonly MAX_BACKUPS = 10;

  // Create backup
  static createBackup(data: BackupData['data']): BackupData {
    const backup: BackupData = {
      version: this.VERSION,
      timestamp: new Date().toISOString(),
      data
    };

    // Save to localStorage
    this.saveBackup(backup);
    
    // Also save to IndexedDB for larger data
    this.saveToIndexedDB(backup);

    return backup;
  }

  // Save backup to localStorage
  private static saveBackup(backup: BackupData): void {
    try {
      const existingBackups = this.getBackups();
      existingBackups.unshift(backup);
      
      // Keep only the last MAX_BACKUPS
      if (existingBackups.length > this.MAX_BACKUPS) {
        existingBackups.splice(this.MAX_BACKUPS);
      }

      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(existingBackups));
    } catch (error) {
      console.error('Error saving backup to localStorage:', error);
    }
  }

  // Save to IndexedDB for larger datasets
  private static async saveToIndexedDB(backup: BackupData): Promise<void> {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['backups'], 'readwrite');
      const store = transaction.objectStore('backups');
      
      await store.put(backup);
    } catch (error) {
      console.error('Error saving backup to IndexedDB:', error);
    }
  }

  // Get all backups
  static getBackups(): BackupData[] {
    try {
      const backups = localStorage.getItem(this.BACKUP_KEY);
      return backups ? JSON.parse(backups) : [];
    } catch (error) {
      console.error('Error getting backups:', error);
      return [];
    }
  }

  // Get latest backup
  static getLatestBackup(): BackupData | null {
    const backups = this.getBackups();
    return backups.length > 0 ? backups[0] : null;
  }

  // Restore from backup
  static restoreFromBackup(backup: BackupData): BackupData['data'] {
    return backup.data;
  }

  // Export backup to file
  static exportBackup(backup: BackupData, filename?: string): void {
    const blob = new Blob([JSON.stringify(backup, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || `backup-${backup.timestamp.split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Import backup from file
  static async importBackup(file: File): Promise<BackupData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backup = JSON.parse(e.target?.result as string);
          if (this.validateBackup(backup)) {
            resolve(backup);
          } else {
            reject(new Error('Invalid backup file format'));
          }
        } catch (error) {
          reject(new Error('Error parsing backup file'));
        }
      };
      reader.onerror = () => reject(new Error('Error reading file'));
      reader.readAsText(file);
    });
  }

  // Validate backup format
  private static validateBackup(backup: any): backup is BackupData {
    return (
      backup &&
      typeof backup.version === 'string' &&
      typeof backup.timestamp === 'string' &&
      backup.data &&
      Array.isArray(backup.data.products) &&
      Array.isArray(backup.data.services) &&
      Array.isArray(backup.data.barbers) &&
      Array.isArray(backup.data.customers) &&
      Array.isArray(backup.data.sales) &&
      Array.isArray(backup.data.appointments)
    );
  }

  // Auto backup every hour
  static startAutoBackup(data: BackupData['data']): void {
    // Create initial backup
    this.createBackup(data);

    // Set up hourly backup
    setInterval(() => {
      this.createBackup(data);
      console.log('Auto backup created at:', new Date().toISOString());
    }, 60 * 60 * 1000); // 1 hour
  }

  // Open IndexedDB
  private static async openIndexedDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('StyleShopBackup', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains('backups')) {
          db.createObjectStore('backups', { keyPath: 'timestamp' });
        }
      };
    });
  }

  // Get backup statistics
  static getBackupStats(): {
    totalBackups: number;
    latestBackup: string | null;
    totalSize: number;
  } {
    const backups = this.getBackups();
    const totalSize = new Blob([JSON.stringify(backups)]).size;
    
    return {
      totalBackups: backups.length,
      latestBackup: backups.length > 0 ? backups[0].timestamp : null,
      totalSize
    };
  }

  // Clean old backups
  static cleanOldBackups(daysToKeep: number = 30): void {
    const backups = this.getBackups();
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const filteredBackups = backups.filter(backup => 
      new Date(backup.timestamp) > cutoffDate
    );

    localStorage.setItem(this.BACKUP_KEY, JSON.stringify(filteredBackups));
  }

  // Check if backup is needed (e.g., if data has changed significantly)
  static isBackupNeeded(currentData: BackupData['data']): boolean {
    const latestBackup = this.getLatestBackup();
    if (!latestBackup) return true;

    // Check if data has changed significantly
    const currentHash = this.hashData(currentData);
    const backupHash = this.hashData(latestBackup.data);

    return currentHash !== backupHash;
  }

  // Simple hash function for data comparison
  private static hashData(data: BackupData['data']): string {
    const str = JSON.stringify({
      products: data.products.length,
      services: data.services.length,
      barbers: data.barbers.length,
      customers: data.customers.length,
      sales: data.sales.length,
      appointments: data.appointments.length
    });
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }
}

// Auto backup hook for React components
export const useAutoBackup = (data: BackupData['data']) => {
  React.useEffect(() => {
    // Start auto backup when component mounts
    BackupManager.startAutoBackup(data);

    // Clean old backups weekly
    const cleanupInterval = setInterval(() => {
      BackupManager.cleanOldBackups(30);
    }, 7 * 24 * 60 * 60 * 1000); // 7 days

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [data]);
}; 