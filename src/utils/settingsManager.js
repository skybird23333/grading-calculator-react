import React from "react";

export const settingsList = [
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

export function getSetting(key) {
    const settings = localStorage.getItem("settings")
    if (!settings) {
        localStorage.setItem("settings", JSON.stringify(settingsList
            .map(setting => {
                return {[setting.name]: setting.default}
            })
            .reduce((acc, cur) => {
                return {...acc, ...cur}
            })))
        return JSON.parse(localStorage.getItem("settings"))[key] || null
    }
    return JSON.parse(settings)[key] || null
}

export function getSettings() {
    const settings = localStorage.getItem("settings")
    if (!settings) {
        localStorage.setItem("settings", JSON.stringify(settingsList
            .map(setting => {
                return {[setting.name]: setting.default}
            })
            .reduce((acc, cur) => {
                return {...acc, ...cur}
            })))
        return localStorage.getItem("settings")
    }
    return JSON.parse(settings)
}

export function setSettings(settings) {
    localStorage.setItem("settings", JSON.stringify(settings))
}