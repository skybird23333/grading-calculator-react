import { getSetting } from './settingsManager';
import { exportSubjectData, importSubjectData, getAllSubjects } from './storagehelper';

class CloudSyncManager {
    constructor(supabase) {
        this.supabase = supabase;
        this.syncTimer = null;
        this.periodicTimer = null;
        this.isInitialized = false;
        this.isSyncing = false;
        this.isOffline = false;
        this.lastSyncTime = null;
        this.lastLocalUpdate = null;
        this.lastCloudUpdate = null;
        this.session = null;
        this.syncStatusCallbacks = [];
        this.conflictCallbacks = [];
        this.syncQueue = [];
        this.retryCount = 0;
        this.maxRetries = 3;
        this.backupData = null;
        this.isFirstInitialization = true; // Track if this is the first initialization
        
        // Don't initialize local timestamp in constructor to avoid interfering with initial sync
        
        // Listen for auth changes
        this.setupAuthListener();
        
        // Listen for local storage changes
        this.setupStorageListener();
        
        // Listen for network changes
        this.setupNetworkListener();
        
        // Setup periodic heartbeat to check connectivity
        this.setupHeartbeat();
    }

    setupNetworkListener() {
        window.addEventListener('online', () => {
            console.log('Network connection restored');
            this.isOffline = false;
            this.notifySyncStatus('connected');
            if (this.isInitialized) {
                this.processQueuedChanges();
            }
        });

        window.addEventListener('offline', () => {
            console.log('Network connection lost');
            this.isOffline = true;
            this.notifySyncStatus('offline');
        });
    }

    setupHeartbeat() {
        setInterval(async () => {
            if (this.isInitialized && !this.isOffline) {
                try {
                    // Simple connectivity check
                    const { error } = await this.supabase
                        .from('userData')
                        .select('lastUpdated')
                        .limit(1);
                    
                    if (error && !this.isOffline) {
                        this.isOffline = true;
                        this.notifySyncStatus('offline');
                    }
                } catch (err) {
                    if (!this.isOffline) {
                        this.isOffline = true;
                        this.notifySyncStatus('offline');
                    }
                }
            }
        }, 60000); // Check every minute
    }

    setupAuthListener() {
        this.supabase.auth.onAuthStateChange((event, session) => {
            this.session = session;
            if (session && getSetting('cloud.enableautosync')) {
                this.initialize();
            } else {
                this.stop();
            }
        });
    }

    setupStorageListener() {
        window.addEventListener('storage', () => {
            console.log('Storage event detected');
            this.updateLocalTimestamp();
            if (this.isInitialized && getSetting('cloud.enableautosync')) {
                console.log('Triggering scheduled sync...');
                this.scheduleSync();
            } else {
                console.log('Sync not triggered:', {
                    isInitialized: this.isInitialized,
                    autoSyncEnabled: getSetting('cloud.enableautosync')
                });
            }
        });
    }

    async initialize() {
        if (!this.session || this.isInitialized) return;
        
        console.log('Initializing cloud sync...');
        this.isInitialized = true;
        this.retryCount = 0;
        
        try {
            this.notifySyncStatus('initializing');
            
            // First, fetch initial cloud data and handle conflicts
            await this.initialSync();
            
            // Start periodic sync
            this.startPeriodicSync();
            
            // Process any queued changes
            await this.processQueuedChanges();
            
            this.notifySyncStatus('connected');
            console.log('Cloud sync initialized successfully');
        } catch (error) {
            console.error('Failed to initialize cloud sync:', error);
            this.retryCount++;
            
            if (this.retryCount < this.maxRetries) {
                console.log(`Retrying initialization in ${this.retryCount * 5} seconds...`);
                setTimeout(() => this.initialize(), this.retryCount * 5000);
                this.notifySyncStatus('retrying', `Retry ${this.retryCount}/${this.maxRetries}`);
            } else {
                this.notifySyncStatus('error', error.message);
                this.isInitialized = false;
            }
        }
    }

    async initialSync() {
        try {
            const { data: cloudData, error } = await this.supabase
                .from('userData')
                .select('*')
                .single();

            if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
                throw error;
            }

            const localData = getAllSubjects().map(s => s[0]);
            const localTimestamp = this.getLocalTimestamp();
            
            if (!cloudData) {
                // No cloud data, upload local data if any exists
                if (localData.length > 0) {
                    console.log('No cloud data found, uploading local data...');
                    await this.uploadToCloud();
                } else {
                    console.log('No data in cloud or locally, starting fresh');
                }
                // Initialize local timestamp after first sync
                if (this.isFirstInitialization) {
                    this.updateLocalTimestamp();
                    this.isFirstInitialization = false;
                }
                return;
            }

            const cloudSubjects = JSON.parse(cloudData.userdata || '[]');
            const cloudTimestamp = new Date(cloudData.lastUpdated);
            
            this.lastCloudUpdate = cloudTimestamp;

            // For first initialization with auto-sync, prioritize cloud data if it exists
            if (this.isFirstInitialization && cloudSubjects.length > 0) {
                console.log('First initialization with auto-sync enabled - downloading from cloud...');
                await this.downloadFromCloud();
                this.updateLocalTimestamp();
                this.isFirstInitialization = false;
                return;
            }

            // Initialize local timestamp if not set yet
            if (this.isFirstInitialization) {
                this.updateLocalTimestamp();
                this.isFirstInitialization = false;
            }

            // Determine sync strategy for subsequent syncs
            if (localData.length === 0) {
                // Local is empty, download from cloud
                console.log('Local data is empty, downloading from cloud...');
                await this.downloadFromCloud();
            } else if (this.hasDataConflict(localData, cloudSubjects, localTimestamp, cloudTimestamp)) {
                // Handle conflicts based on user preference
                await this.handleConflictByPreference(localData, cloudSubjects, localTimestamp, cloudTimestamp);
            } else if (cloudTimestamp > localTimestamp) {
                // Cloud is newer, download
                console.log('Cloud data is newer, downloading...');
                await this.downloadFromCloud();
            } else if (localTimestamp > cloudTimestamp) {
                // Local is newer, upload
                console.log('Local data is newer, uploading...');
                await this.uploadToCloud();
            } else {
                // Data is in sync
                console.log('Data is already in sync');
                this.lastSyncTime = new Date();
            }
        } catch (error) {
            console.error('Initial sync failed:', error);
            throw error;
        }
    }

    async handleConflictByPreference(localData, cloudData, localTime, cloudTime) {
        const conflictStrategy = getSetting('cloud.conflictresolution');
        
        // Create backup if enabled
        if (getSetting('cloud.backupbeforeconflict')) {
            this.backupData = {
                local: localData,
                cloud: cloudData,
                timestamp: new Date().toISOString()
            };
        }
        
        switch (conflictStrategy) {
            case 'local':
                console.log('Auto-resolving conflict: preferring local data');
                await this.uploadToCloud();
                break;
            case 'cloud':
                console.log('Auto-resolving conflict: preferring cloud data');
                await this.downloadFromCloud();
                break;
            case 'merge':
                console.log('Auto-resolving conflict: merging data');
                await this.mergeData(localData, cloudData);
                break;
            case 'ask':
            default:
                console.log('Conflict detected, asking user for resolution');
                await this.handleConflict(localData, cloudData, localTime, cloudTime);
                break;
        }
    }

    hasDataConflict(localData, cloudData, localTime, cloudTime) {
        // Consider it a conflict if both have been modified recently
        // and have different content
        const timeDiff = Math.abs(localTime - cloudTime);
        const hasContentDiff = JSON.stringify(localData) !== JSON.stringify(cloudData);
        
        return hasContentDiff && timeDiff < 60000; // 1 minute threshold
    }

    async handleConflict(localData, cloudData, localTime, cloudTime) {
        return new Promise((resolve) => {
            const conflictData = {
                local: {
                    data: localData,
                    timestamp: localTime,
                    count: localData.length
                },
                cloud: {
                    data: cloudData,
                    timestamp: cloudTime,
                    count: cloudData.length
                },
                resolve: async (choice) => {
                    try {
                        switch (choice) {
                            case 'local':
                                await this.uploadToCloud();
                                break;
                            case 'cloud':
                                await this.downloadFromCloud();
                                break;
                            case 'merge':
                                await this.mergeData(localData, cloudData);
                                break;
                        }
                        resolve();
                    } catch (error) {
                        console.error('Conflict resolution failed:', error);
                        resolve();
                    }
                }
            };
            
            this.notifyConflict(conflictData);
        });
    }

    async mergeData(localData, cloudData) {
        // Create a map of subjects by name for merging
        const localMap = new Map();
        const cloudMap = new Map();
        
        localData.forEach(subject => {
            localMap.set(subject.name, subject);
        });
        
        cloudData.forEach(subject => {
            cloudMap.set(subject.name, subject);
        });
        
        // Merge: prefer local data for conflicts, add new subjects from both
        const merged = [];
        
        // Add all local subjects (they take priority)
        localData.forEach(subject => {
            merged.push(subject);
        });
        
        // Add cloud subjects that don't exist locally
        cloudData.forEach(subject => {
            if (!localMap.has(subject.name)) {
                merged.push(subject);
            }
        });
        
        // Import merged data
        importSubjectData(merged);
        await this.uploadToCloud();
    }

    async uploadToCloud() {
        if (!this.session || this.isOffline) {
            this.syncQueue.push({
                type: 'upload',
                timestamp: new Date(),
                data: exportSubjectData()
            });
            return;
        }
        
        this.isSyncing = true;
        this.notifySyncStatus('uploading');
        
        try {
            const data = exportSubjectData();
            const now = new Date().toISOString();
            
            const { error } = await this.supabase
                .from('userData')
                .upsert({
                    userdata: data,
                    email: this.session.user.email,
                    lastUpdated: now
                });
                
            if (error) throw error;
            
            this.lastSyncTime = new Date();
            this.lastCloudUpdate = new Date(now);
            this.retryCount = 0; // Reset retry count on success
            this.notifySyncStatus('synced');
            
            console.log('Data uploaded to cloud successfully');
        } catch (error) {
            console.error('Upload failed:', error);
            
            if (this.isOffline) {
                // Queue for retry when back online
                this.syncQueue.push({
                    type: 'upload',
                    timestamp: new Date(),
                    data: exportSubjectData()
                });
                this.notifySyncStatus('offline');
            } else {
                this.notifySyncStatus('error', error.message);
            }
        } finally {
            this.isSyncing = false;
        }
    }

    async downloadFromCloud() {
        if (!this.session || this.isOffline) return;
        
        this.isSyncing = true;
        this.notifySyncStatus('downloading');
        
        try {
            const { data, error } = await this.supabase
                .from('userData')
                .select('userdata, lastUpdated')
                .single();
                
            if (error) throw error;
            
            if (data && data.userdata) {
                importSubjectData(JSON.parse(data.userdata));
                this.lastSyncTime = new Date();
                this.lastCloudUpdate = new Date(data.lastUpdated);
                this.updateLocalTimestamp();
                this.retryCount = 0; // Reset retry count on success
                this.notifySyncStatus('synced');
                
                console.log('Data downloaded from cloud successfully');
            }
        } catch (error) {
            console.error('Download failed:', error);
            this.notifySyncStatus('error', error.message);
        } finally {
            this.isSyncing = false;
        }
    }

    scheduleSync() {
        if (this.isOffline) {
            // Queue the sync for when we're back online
            this.syncQueue.push({
                type: 'upload',
                timestamp: new Date(),
                data: exportSubjectData()
            });
            console.log('Offline: queued sync for later');
            return;
        }

        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
        }
        
        // Debounce rapid changes
        this.syncTimer = setTimeout(async () => {
            if (this.isInitialized && !this.isSyncing) {
                try {
                    await this.smartSync();
                } catch (error) {
                    console.error('Scheduled sync failed:', error);
                    // Queue for retry
                    this.syncQueue.push({
                        type: 'upload',
                        timestamp: new Date(),
                        data: exportSubjectData()
                    });
                }
            }
        }, 2000); // 2 second delay
    }

    async smartSync() {
        if (this.isOffline || !this.isInitialized) return;
        
        try {
            // First check if cloud has been updated
            const { data: cloudMeta, error: metaError } = await this.supabase
                .from('userData')
                .select('lastUpdated')
                .single();

            if (metaError && metaError.code !== 'PGRST116') {
                throw metaError;
            }

            const localTimestamp = this.getLocalTimestamp();
            
            if (cloudMeta && cloudMeta.lastUpdated) {
                const cloudTimestamp = new Date(cloudMeta.lastUpdated);
                
                if (cloudTimestamp > this.lastCloudUpdate) {
                    // Cloud has been updated by another client
                    console.log('Cloud data updated by another client, syncing...');
                    
                    // Get full cloud data for conflict resolution
                    const { data: fullCloudData } = await this.supabase
                        .from('userData')
                        .select('userdata, lastUpdated')
                        .single();
                    
                    if (fullCloudData) {
                        const cloudSubjects = JSON.parse(fullCloudData.userdata || '[]');
                        const localData = getAllSubjects().map(s => s[0]);
                        
                        if (this.hasDataConflict(localData, cloudSubjects, localTimestamp, cloudTimestamp)) {
                            await this.handleConflictByPreference(localData, cloudSubjects, localTimestamp, cloudTimestamp);
                        } else {
                            await this.downloadFromCloud();
                        }
                    }
                    return;
                }
            }
            
            // No conflicts, proceed with normal upload
            await this.uploadToCloud();
        } catch (error) {
            console.error('Smart sync failed:', error);
            throw error;
        }
    }

    async processQueuedChanges() {
        if (this.syncQueue.length === 0 || this.isOffline) return;
        
        console.log(`Processing ${this.syncQueue.length} queued changes...`);
        
        // Process queued changes in order
        while (this.syncQueue.length > 0) {
            const change = this.syncQueue.shift();
            
            try {
                if (change.type === 'upload') {
                    // For queued uploads, use the most recent local data
                    await this.uploadToCloud();
                }
            } catch (error) {
                console.error('Failed to process queued change:', error);
                // Re-queue if it failed
                this.syncQueue.unshift(change);
                break;
            }
        }
    }

    startPeriodicSync() {
        const interval = getSetting('cloud.syncinterval') * 1000;
        
        this.periodicTimer = setInterval(() => {
            if (this.isInitialized && !this.isSyncing) {
                this.checkForUpdatesAndSync();
            }
        }, Math.max(interval, 10000)); // Minimum 10 seconds
    }

    async checkForUpdatesAndSync() {
        if (this.isOffline) return;
        
        try {
            const { data, error } = await this.supabase
                .from('userData')
                .select('lastUpdated')
                .single();
                
            if (error && error.code !== 'PGRST116') {
                throw error;
            }
            
            if (data && data.lastUpdated) {
                const cloudTime = new Date(data.lastUpdated);
                if (cloudTime > this.lastCloudUpdate) {
                    console.log('Periodic check: cloud data updated, syncing...');
                    await this.initialSync(); // Use full sync logic
                }
            }
        } catch (error) {
            console.error('Periodic sync check failed:', error);
            if (!this.isOffline) {
                this.isOffline = true;
                this.notifySyncStatus('offline');
            }
        }
    }

    stop() {
        this.isInitialized = false;
        
        if (this.syncTimer) {
            clearTimeout(this.syncTimer);
            this.syncTimer = null;
        }
        
        if (this.periodicTimer) {
            clearInterval(this.periodicTimer);
            this.periodicTimer = null;
        }
        
        this.notifySyncStatus('disconnected');
        console.log('Cloud sync stopped');
    }

    updateLocalTimestamp() {
        this.lastLocalUpdate = new Date();
    }

    getLocalTimestamp() {
        return this.lastLocalUpdate || new Date(0);
    }

    // Enhanced status management
    onSyncStatusChanged(callback) {
        this.syncStatusCallbacks.push(callback);
    }

    offSyncStatusChanged(callback) {
        this.syncStatusCallbacks = this.syncStatusCallbacks.filter(cb => cb !== callback);
    }

    notifySyncStatus(status, message = '') {
        const statusData = { 
            status, 
            message, 
            lastSync: this.lastSyncTime,
            queuedChanges: this.syncQueue.length,
            isOffline: this.isOffline
        };
        
        this.syncStatusCallbacks.forEach(callback => {
            callback(statusData);
        });
    }

    // Conflict management
    onConflict(callback) {
        this.conflictCallbacks.push(callback);
    }

    offConflict(callback) {
        this.conflictCallbacks = this.conflictCallbacks.filter(cb => cb !== callback);
    }

    notifyConflict(conflictData) {
        this.conflictCallbacks.forEach(callback => {
            callback(conflictData);
        });
    }

    // Enhanced public methods
    async manualSync() {
        if (!this.session) {
            throw new Error('Not logged in');
        }
        
        if (this.isOffline) {
            throw new Error('Cannot sync while offline');
        }
        
        await this.initialSync(); // Use full sync logic
    }

    getSyncStatus() {
        if (!this.session) return 'not_logged_in';
        if (this.isOffline) return 'offline';
        if (!getSetting('cloud.enableautosync')) return 'disabled';
        if (!this.isInitialized) return 'initializing';
        if (this.isSyncing) return 'syncing';
        if (this.syncQueue.length > 0) return 'pending';
        return 'connected';
    }

    getQueuedChangesCount() {
        return this.syncQueue.length;
    }

    async forceUpload() {
        if (!this.session) throw new Error('Not logged in');
        await this.uploadToCloud();
    }

    async forceDownload() {
        if (!this.session) throw new Error('Not logged in');
        await this.downloadFromCloud();
    }

    getBackupData() {
        return this.backupData;
    }

    clearBackup() {
        this.backupData = null;
    }

    async exportData() {
        return {
            timestamp: new Date().toISOString(),
            data: JSON.parse(exportSubjectData()),
            backup: this.backupData
        };
    }

    async importData(exportedData) {
        if (exportedData.data && Array.isArray(exportedData.data)) {
            importSubjectData(exportedData.data);
            if (this.isInitialized && getSetting('cloud.enableautosync')) {
                await this.uploadToCloud();
            }
        } else {
            throw new Error('Invalid data format');
        }
    }
}

export default CloudSyncManager;
