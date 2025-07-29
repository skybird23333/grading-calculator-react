import React, { useState } from 'react';
import { Button } from './Button';
import { FaDownload, FaUpload, FaFileExport, FaFileImport, FaCloud, FaDesktop, FaSync, FaTrash } from 'react-icons/fa';

export function ImportExportTools({ cloudSyncManager }) {
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importError, setImportError] = useState('');
    const [isManualSyncing, setIsManualSyncing] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const exportData = await cloudSyncManager.exportData();
            const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `grading-calculator-backup-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Export failed:', error);
            alert('Export failed: ' + error.message);
        } finally {
            setIsExporting(false);
        }
    };

    const handleImport = (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setIsImporting(true);
        setImportError('');

        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const content = e.target.result;
                const data = JSON.parse(content);
                
                // Validate data structure
                if (!data.data || !Array.isArray(data.data)) {
                    throw new Error('Invalid file format. Expected exported data structure.');
                }

                // Confirm import
                const confirmMessage = `This will replace your current data with ${data.data.length} subjects from ${new Date(data.timestamp).toLocaleString()}. Are you sure?`;
                if (window.confirm(confirmMessage)) {
                    await cloudSyncManager.importData(data);
                    alert('Data imported successfully!');
                }
            } catch (error) {
                console.error('Import failed:', error);
                setImportError('Import failed: ' + error.message);
            } finally {
                setIsImporting(false);
                event.target.value = ''; // Reset file input
            }
        };

        reader.readAsText(file);
    };

    const handleManualUpload = async () => {
        setIsManualSyncing(true);
        try {
            await cloudSyncManager.forceUpload();
            alert('Data uploaded to cloud successfully!');
        } catch (error) {
            console.error('Manual upload failed:', error);
            alert('Upload failed: ' + error.message);
        } finally {
            setIsManualSyncing(false);
        }
    };

    const handleManualDownload = async () => {
        if (!window.confirm('This will replace your local data with data from the cloud. Are you sure?')) {
            return;
        }
        
        setIsManualSyncing(true);
        try {
            await cloudSyncManager.forceDownload();
            alert('Data downloaded from cloud successfully!');
        } catch (error) {
            console.error('Manual download failed:', error);
            alert('Download failed: ' + error.message);
        } finally {
            setIsManualSyncing(false);
        }
    };

    const handleClearBackup = () => {
        if (window.confirm('Are you sure you want to clear the conflict backup?')) {
            cloudSyncManager.clearBackup();
            alert('Backup cleared');
        }
    };

    const backupData = cloudSyncManager.getBackupData();

    return (
        <div className="import-export-tools" style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>📁 Data Management</h3>
            
            {/* Local File Operations */}
            <div style={{ marginBottom: '20px' }}>
                <h4 style={{ marginBottom: '12px', color: 'var(--foreground-secondary)' }}>Local File Backup</h4>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '12px' }}>
                    <Button
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        <FaFileExport />
                        {isExporting ? 'Exporting...' : 'Export to File'}
                    </Button>

                    <label className="button" style={{
                        cursor: isImporting ? 'not-allowed' : 'pointer',
                        opacity: isImporting ? 0.6 : 1
                    }}>
                        <FaFileImport />
                        {isImporting ? 'Importing...' : 'Import from File'}
                        <input
                            type="file"
                            accept=".json"
                            onChange={handleImport}
                            disabled={isImporting}
                            style={{ display: 'none' }}
                        />
                    </label>
                </div>
                
                <div style={{
                    fontSize: '12px',
                    color: 'var(--foreground-secondary)',
                    marginBottom: '16px'
                }}>
                    Export creates a JSON file with all your data. Import replaces current data with file contents.
                </div>
            </div>

            {/* Conflict Backup Section */}
            {backupData && (
                <div style={{ marginBottom: '20px' }}>
                    <h4 style={{ marginBottom: '12px', color: 'var(--orange)' }}>⚠️ Conflict Backup Available</h4>
                    <div style={{
                        padding: '12px',
                        backgroundColor: 'rgba(255, 165, 0, 0.1)',
                        border: '1px solid var(--orange)',
                        borderRadius: '4px',
                        marginBottom: '12px'
                    }}>
                        <p style={{ margin: '0 0 8px 0', fontSize: '14px' }}>
                            A backup was created during the last conflict resolution on {new Date(backupData.timestamp).toLocaleString()}.
                        </p>
                        <div style={{ display: 'flex', gap: '8px', fontSize: '12px', color: 'var(--foreground-secondary)' }}>
                            <span>Local: {backupData.local.length} subjects</span>
                            <span>•</span>
                            <span>Cloud: {backupData.cloud.length} subjects</span>
                        </div>
                    </div>
                    <Button
                        onClick={handleClearBackup}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'var(--red)',
                            fontSize: '12px',
                            padding: '6px 12px'
                        }}
                    >
                        <FaTrash />
                        Clear Backup
                    </Button>
                </div>
            )}

            {/* Error Display */}
            {importError && (
                <div style={{
                    padding: '12px',
                    backgroundColor: 'rgba(255, 0, 0, 0.1)',
                    border: '1px solid var(--red)',
                    borderRadius: '4px',
                    color: 'var(--red)',
                    fontSize: '14px',
                    marginTop: '12px'
                }}>
                    {importError}
                </div>
            )}

            {/* Tips */}
            <div style={{
                fontSize: '12px',
                color: 'var(--foreground-secondary)',
                marginTop: '16px',
                padding: '12px',
                backgroundColor: 'var(--foreground-border)',
                borderRadius: '4px'
            }}>
                <h3 style={{ margin: '0 0 8px 0' }}>💡 Tips:</h3>
                <ul style={{ margin: 0, paddingLeft: '16px' }}>
                    <li>I vibe coded the entire cloud sync feature so you should probably keep backups after major changes.</li>
                </ul>
            </div>
        </div>
    );
}
