import React, {useEffect, useState} from "react";
import {getSettings, setSettings, settingsList, getSetting} from "../utils/settingsManager";
import {ImportExportTools} from "../components/ImportExportTools";

export default function Settings({ cloudSyncManager }) {
    const [currentSettings, setCurrentSettings] = useState(settingsList
        .map(setting => {
            return {[setting.name]: setting.default}
        })
        .reduce((acc, cur) => {
            return {...acc, ...cur}
        })
    )

    const [saved, setSaved] = useState(true)

    useEffect(() => {
        setCurrentSettings(Object.assign(currentSettings, getSettings()))
        setSaved(true)
    }, [])

    useEffect(() => {
        setSaved(false)
    }, [currentSettings])

    const handleSave = () => {
        const oldAutoSync = getSetting('cloud.enableautosync');
        const newAutoSync = currentSettings['cloud.enableautosync'];
        
        setSettings(currentSettings);
        setSaved(true);
        
        // Handle auto-sync toggle
        if (cloudSyncManager && oldAutoSync !== newAutoSync) {
            if (newAutoSync) {
                cloudSyncManager.initialize();
            } else {
                cloudSyncManager.stop();
            }
        }
    };

    return (<>
            <div className={"content-header"}>
                <h1>Settings</h1>
                Settings are not synced to the cloud. Some are applied after refreshing.
            </div>
            <div className={"content-content"}>
                {cloudSyncManager && (
                    <>
                        <ImportExportTools cloudSyncManager={cloudSyncManager} />
                        <div style={{ borderTop: '1px solid var(--foreground-border)', margin: '24px 0', paddingTop: '24px' }}>
                            <h3 style={{ marginBottom: '16px' }}>Application Settings</h3>
                        </div>
                    </>
                )}
                <button
                    onClick={handleSave}
                    disabled={saved}
                    className={"button confirm"}>Save</button>
                {
                    settingsList.map(setting => {
                        return (
                            <label
                                key={setting.name}
                                className={"settings-item"}
                            >
                                {setting.desc}
                                {(setting.type === 'boolean') ? (
                                    <>
                                        <input type={"checkbox"} checked={currentSettings[setting.name]} onChange={
                                            (e) => {setCurrentSettings({...currentSettings, [setting.name]: e.target.checked})}
                                        }></input>
                                        <span className="checkbox"></span>
                                    </>
                                ) : setting.type === 'select' ? (
                                    <select 
                                        value={currentSettings[setting.name] || setting.default} 
                                        onChange={(e) => {
                                            setCurrentSettings({
                                                ...currentSettings,
                                                [setting.name]: e.target.value
                                            })
                                        }}
                                        style={{
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            border: '1px solid var(--foreground-border)',
                                            backgroundColor: 'var(--background)',
                                            color: 'var(--foreground)',
                                            minWidth: '150px'
                                        }}
                                    >
                                        {setting.options?.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                ) : (setting.type === 'number') ?
                                        <input type={"number"} className={"input"} value={currentSettings[setting.name]} onChange={
                                            (e) => {setCurrentSettings({...currentSettings, [setting.name]: e.target.value})}
                                        }/> : <>?</>}
                            </label>
                        )
                    })
                }
            </div>
        </>
    )
}