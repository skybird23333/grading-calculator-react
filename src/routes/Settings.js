import React, {useEffect, useState} from "react";
import {getSettings, setSettings, settingsList} from "../utils/settingsManager";

export default function Settings() {
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

    return (<>
            <div className={"content-header"}>
                <h1>Settings</h1>
                Settings are not synced to the cloud. Some are applied after refreshing.
            </div>
            <div className={"content-content"}>
                <button
                    onClick={() => { setSettings(currentSettings); setSaved(true) }}
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
                                    )
                                    : (setting.type === 'number') ?
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