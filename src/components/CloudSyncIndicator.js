import React from 'react';
import { FaCloud, FaCloudUploadAlt, FaCloudDownloadAlt, FaExclamationTriangle, FaTimes, FaCheck, FaSpinner, FaWifi, FaClock, FaHourglassHalf } from 'react-icons/fa';

export function CloudSyncIndicator({ status, lastSync, onToggle, enabled, onManualSync, cloudSyncManager, session }) {
    const getStatusIcon = () => {
        switch (status?.status) {
            case 'connected':
            case 'synced':
                return <FaCloud style={{ color: 'var(--green)' }} />;
            case 'uploading':
                return <FaCloudUploadAlt style={{ color: 'var(--blue)' }} />;
            case 'downloading':
                return <FaCloudDownloadAlt style={{ color: 'var(--blue)' }} />;
            case 'syncing':
            case 'initializing':
                return <FaSpinner style={{ color: 'var(--blue)', animation: 'spin 1s linear infinite' }} />;
            case 'pending':
                return <FaHourglassHalf style={{ color: 'var(--orange)' }} />;
            case 'retrying':
                return <FaSpinner style={{ color: 'var(--orange)', animation: 'spin 1s linear infinite' }} />;
            case 'offline':
                return <FaWifi style={{ color: 'var(--red)' }} />;
            case 'error':
                return <FaExclamationTriangle style={{ color: 'var(--red)' }} />;
            case 'disabled':
                return <FaTimes style={{ color: 'var(--foreground-secondary)' }} />;
            case 'not_logged_in':
                return <FaCloud style={{ color: 'var(--foreground-secondary)' }} />;
            default:
                return <FaCloud style={{ color: 'var(--foreground-secondary)' }} />;
        }
    };

    const getStatusText = () => {
        const queuedCount = status?.queuedChanges || 0;
        
        switch (status?.status) {
            case 'connected':
                return queuedCount > 0 ? `Connected (${queuedCount} pending)` : 'Connected';
            case 'synced':
                const syncText = lastSync ? `Synced ${getTimeAgo(lastSync)}` : 'Synced';
                return queuedCount > 0 ? `${syncText} (${queuedCount} pending)` : syncText;
            case 'uploading':
                return 'Uploading...';
            case 'downloading':
                return 'Downloading...';
            case 'syncing':
                return 'Syncing...';
            case 'initializing':
                return 'Initializing...';
            case 'pending':
                return `${queuedCount} changes pending`;
            case 'retrying':
                return `Retrying... ${status.message || ''}`;
            case 'offline':
                return queuedCount > 0 ? `Offline (${queuedCount} queued)` : 'Offline';
            case 'error':
                return `Error: ${status.message}`;
            case 'disabled':
                return 'Auto-sync disabled';
            case 'not_logged_in':
                return 'Not logged in';
            default:
                return 'Not synced';
        }
    };

    const getTimeAgo = (date) => {
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 1) return 'just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const handleClick = async () => {
        if (status?.status === 'error' || status?.status === 'connected' || status?.status === 'synced' || status?.status === 'pending') {
            try {
                await onManualSync?.();
            } catch (error) {
                console.error('Manual sync failed:', error);
            }
        }
    };

    const getDetailedTooltip = () => {
        const details = [];
        
        if (status?.lastSync) {
            details.push(`Last sync: ${status.lastSync.toLocaleString()}`);
        }
        
        if (status?.queuedChanges > 0) {
            details.push(`${status.queuedChanges} changes waiting to sync`);
        }
        
        if (status?.isOffline) {
            details.push('Device is offline');
        }
        
        if (status?.status === 'error') {
            details.push(`Error: ${status.message}`);
        }
        
        details.push('Click to sync manually');
        
        return details.join('\n');
    };

    const isClickable = ['error', 'connected', 'synced', 'pending', 'offline'].includes(status?.status);
    const showPulse = status?.queuedChanges > 0 && !['uploading', 'downloading', 'syncing'].includes(status?.status);

            return (
            <div 
                className={`cloud-sync-indicator-sidebar ${showPulse ? 'pulse' : ''}`}
                style={{
                    transition: 'all 0.2s',
                    color: status?.status === 'error' ? 'var(--red)' : 
                           status?.status === 'offline' ? 'var(--orange)' :
                           'var(--foreground)',
                }}
                onClick={handleClick}
                title={getDetailedTooltip()}
            >
                {getStatusIcon()}
                {" "}Cloud{" "}
                <span style={{ color: 'var(--foreground-secondary)' }}>
                    {getStatusText()}
                </span>
                
                {/* Pending changes indicator */}
                {status?.queuedChanges > 0 && (
                    <div style={{
                        backgroundColor: 'var(--orange)',
                        color: 'white',
                        borderRadius: '50%',
                        width: '18px',
                        height: '18px',
                        fontSize: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold'
                    }}>
                        {status.queuedChanges > 9 ? '9+' : status.queuedChanges}
                    </div>
                )}
            </div>
        );
}

// Add CSS for pulse animation
const style = document.createElement('style');
style.textContent = `
    .cloud-sync-indicator.pulse {
        animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
        0% {
            box-shadow: 0 0 0 0 rgba(255, 165, 0, 0.7);
        }
        70% {
            box-shadow: 0 0 0 10px rgba(255, 165, 0, 0);
        }
        100% {
            box-shadow: 0 0 0 0 rgba(255, 165, 0, 0);
        }
    }
`;
document.head.appendChild(style);
