import React from 'react';
import { Button } from './Button';
import { FaCloud, FaDesktop, FaCodeBranch, FaClock, FaShieldAlt } from 'react-icons/fa';

export function DataConflictModal({ conflict, onClose }) {
    if (!conflict) return null;

    const { local, cloud, resolve } = conflict;

    const handleChoice = async (choice) => {
        await resolve(choice);
        onClose();
    };

    return (
        <div className="modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
        }}>
            <div className="modal-content" style={{
                backgroundColor: 'var(--background)',
                border: '1px solid var(--foreground-border)',
                borderRadius: '8px',
                padding: '24px',
                maxWidth: '700px',
                width: '90%',
                maxHeight: '80vh',
                overflow: 'auto'
            }}>
                <h2 style={{ color: 'var(--orange)', marginBottom: '16px' }}>
                    ⚠️ Data Conflict Detected
                </h2>
                
                <div style={{ 
                    padding: '12px', 
                    backgroundColor: 'rgba(0, 123, 255, 0.1)', 
                    borderRadius: '4px', 
                    marginBottom: '16px',
                    border: '1px solid var(--blue)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <FaShieldAlt style={{ color: 'var(--blue)' }} />
                        <strong>Automatic Backup Created</strong>
                    </div>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--foreground-secondary)' }}>
                        Both versions of your data have been automatically backed up before making any changes. 
                        You can restore from backup later if needed.
                    </p>
                </div>
                
                <p style={{ marginBottom: '24px', color: 'var(--foreground-secondary)' }}>
                    Both your local data and cloud data have been modified. Please choose how to resolve this conflict:
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    <div className="card" style={{ padding: '16px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <FaDesktop /> Local Data
                        </h3>
                        <div style={{ color: 'var(--foreground-secondary)', fontSize: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                <FaClock size={12} />
                                {local.timestamp.toLocaleString()}
                            </div>
                            <div>{local.count} subjects</div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <Button 
                                onClick={() => handleChoice('local')}
                                style={{ width: '100%', backgroundColor: 'var(--blue)' }}
                            >
                                Use Local Data
                            </Button>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)', marginTop: '8px' }}>
                            This device's data will overwrite the cloud
                        </div>
                    </div>

                    <div className="card" style={{ padding: '16px' }}>
                        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                            <FaCloud /> Cloud Data
                        </h3>
                        <div style={{ color: 'var(--foreground-secondary)', fontSize: '14px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                                <FaClock size={12} />
                                {cloud.timestamp.toLocaleString()}
                            </div>
                            <div>{cloud.count} subjects</div>
                        </div>
                        <div style={{ marginTop: '12px' }}>
                            <Button 
                                onClick={() => handleChoice('cloud')}
                                style={{ width: '100%', backgroundColor: 'var(--green)' }}
                            >
                                Use Cloud Data
                            </Button>
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)', marginTop: '8px' }}>
                            Cloud data will replace this device's data
                        </div>
                    </div>
                </div>

                <div className="card" style={{ padding: '16px', marginBottom: '16px', backgroundColor: 'var(--foreground-border)' }}>
                    <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                        <FaCodeBranch /> Smart Merge (Recommended)
                    </h3>
                    <p style={{ fontSize: '14px', color: 'var(--foreground-secondary)', marginBottom: '12px' }}>
                        Intelligently combines both versions by keeping all unique subjects. Local data takes priority for duplicates by name.
                        This preserves the most data while avoiding conflicts.
                    </p>
                    <Button 
                        onClick={() => handleChoice('merge')}
                        style={{ width: '100%', backgroundColor: 'var(--purple)' }}
                    >
                        Merge Both Versions
                    </Button>
                    <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)', marginTop: '8px' }}>
                        Results in {Math.max(local.count, cloud.count)} - {local.count + cloud.count} subjects
                    </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                    <Button 
                        onClick={onClose}
                        style={{ backgroundColor: 'var(--red)' }}
                    >
                        Cancel (Keep Current Local Data)
                    </Button>
                    <div style={{ fontSize: '12px', color: 'var(--foreground-secondary)', marginTop: '8px' }}>
                        No changes will be made and local data remains unchanged
                    </div>
                </div>
            </div>
        </div>
    );
}
