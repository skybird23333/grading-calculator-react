import React, {useEffect, useState} from "react";
import {getSettings, setSettings} from "../utils/settingsManager";

export default function Settings() {
    const settingsList = [
        {name: 'interface.showpercent', desc: <>Show percentage symbol on marks</>, type: 'boolean', default: false},
        {
            name: 'interface.smallerdecimal',
            desc: <>Make the part after the decimal point appear smaller</>,
            type: 'boolean',
            default: true
        },
        {
            name: 'interface.greenmark',
            desc: <>The amount required for an assessment or subject to show as green</>,
            type: 'number',
            default: 80
        },
        {
            name: 'interface.orangemark ',
            desc: <>The amount required for an assessment or subject to show as orange</>,
            type: 'number',
            default: 50
        },
        {
            name: 'interface.possibilitylowscore',
            desc: <>The lower score for mark possibilities</>,
            type: 'number',
            default: 50
        },
        {
            name: 'interface.possibilitylowscoreuselowest',
            desc: <>Ignore the above, just use the lowest mark in the subject(might be broken)</>,
            type: 'boolean',
            default: false
        },
        {
            name: 'interface.possibilityhighscore',
            desc: <>The higher score for mark possibilities</>,
            type: 'number',
            default: 100
        },
        {
            name: 'interface.possibilityhighscoreusehighest',
            desc: <>Ignore the above, just use the highest mark in the subject</>,
            type: 'boolean',
            default: false
        },
        // {
        //     name: 'interface.showprogressbaronsidebar',
        //     desc: <>Show a progress bar instead of filling the background for subjects on the sidebar</>,
        //     type: 'boolean',
        //     default: false
        // },
        // {
        //     name: 'interface.showprogressbaronhome',
        //     desc: <>Show a progress bar instead of filling the background for subjects in home</>,
        //     type: 'boolean',
        //     default: false
        // },
        // {
        //     name: 'interface.showprogressbaronassessments',
        //     desc: <>Show a progress bar instead of filling the background for assessments</>,
        //     type: 'boolean',
        //     default: false
        // },
        // {
        //     name: 'interface.showcolouredsubjectbackground',
        //     desc: <>On the subject page, use the current grade color(green, orange, etc) as a background</>,
        //     type: 'boolean',
        //     default: false
        // },
        // {
        //     name: 'interface.showmarkersonsubjectprogressbar',
        //     desc: <>Show markers on the subject progress bar</>,
        //     type: 'boolean',
        //     default: false
        // },
        // {
        //     name: 'interface.altsidebarbehaviourontrack',
        //     desc: <>For on-track subjects, on the sidebar, instead of showing the goal, show the minimum score required
        //         to stay on track</>,
        //     type: 'boolean',
        //     default: false
        // },
        // {
        //     name: 'interface.altsidebarbehaviourfailed',
        //     desc: <>For failed subjects(subjects that can no longer reach the goal), on the sidebar, instead of showing the goal, show the maximum score obtainable</>,
        //     type: 'boolean',
        //     default: true
        // },
        // {
        //     name: 'interface.altsidebarbehaviourpassed',
        //     desc: <>For passed subjects(subjects already reaching the goal), on the sidebar, instead of showing the goal, show the minimum score obtainable</>,
        //     type: 'boolean',
        //     default: true
        // },
    ]

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