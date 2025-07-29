//@ts-check
import { useState, useEffect } from 'react';
import { v1 } from 'uuid'
import { getSetting } from './settingsManager';

/**
 * @typedef Assessment
 * @property {string} name
 * @property {boolean} due
 * @property {number} grading
 * @property {number} weighting
 * @property {number?} changeToTotalMark
 */

/**
 * @typedef Subject
 * @property {string} name
 * @property {number} goal
 * @property {Assessment[]} assessments
 */

/**
 * @typedef SubjectStorage
 * @property {string[]} subjects
 */

// localstorage format:
// index: subjects[]
// subjectId: Subject Data
// ...

initLocalStorage()

let isCloudUpdatePending = false
let cloudSyncManager = null

export function setCloudSyncManager(manager) {
    cloudSyncManager = manager;
}

export function useCloudUpdatePending() {
    const [value, setValue] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setValue(isCloudUpdatePending);
        }, 1000); // check the value every second

        return () => clearInterval(interval);
    }, []);

    return value;
}

export function setCloudUpdatePending(value) {
    isCloudUpdatePending = value
}

function initLocalStorage() {
    const index = localStorage.getItem('index')
    if(!index) {
        localStorage.setItem('index', '["b4611ce8-90f4-4b67-a3a4-beb8eda4233d"]')
        localStorage.setItem('b4611ce8-90f4-4b67-a3a4-beb8eda4233d', JSON.stringify({
            name: "Example Subject", goal: 75, assessments: [{
                name: 'Example Assessment 1', due: false, grading: 75, weighting: 50,
            }, {
                name: 'Example Assessment 2', due: false, grading: 57, weighting: 20,
            }, {
                name: 'Example Assessment 3', due: false, grading: 83, weighting: 15,
            }, {
                name: 'Example Assessment 4', due: true, weighting: 15,
            }],
        }))
    }
}

/**
 * @returns string[]
 */
export function getAllSubjectIds() {
    const index = localStorage.getItem('index')
    try {
        return JSON.parse(index || '[]')
    } catch(e) {
        localStorage.removeItem('index')
        initLocalStorage()
        console.warn('[WARN] Localstorage data corrupted')
        return []
    }
}

/**
 * @returns Subject[]
 */
export function getAllSubjects() {
    const index = getAllSubjectIds()
    return index.map(i => {
        return [getSubject(i), i]
    })
}

/**
 *
 * @param index {[]}
 */
export function setSubjectIndex(index) {
    localStorage.setItem('index', JSON.stringify(index))
    window.dispatchEvent(new Event('storage'))
}

/**
 * 
 * @param {Subject} data 
 * @returns string UUID
 */
export function createSubject(data) {
    isCloudUpdatePending = true

    const index = getAllSubjectIds()
    const id = v1()

    index.push(id)

    localStorage.setItem('index', JSON.stringify(index))
    localStorage.setItem(id, JSON.stringify(data))

    window.dispatchEvent(new Event('storage'))

    return id
}

/**
 * 
 * @param {string} id 
 */
export function getSubject(id) {
    return JSON.parse(localStorage.getItem(id) || '{}')
}

/**
 * 
 * @param {string} id 
 * @param {Subject} data 
 */
export function updateSubject(id, data) {
    isCloudUpdatePending = true
    console.log('Subject updated')
    // Strip the display only field when saving
    const cleanData = {
        ...data,
        assessments: data.assessments.map(a => {
            const { changeToTotalMark, ...cleanAssessment } = a;
            return cleanAssessment;
        })
    };
    window.dispatchEvent(new Event('storage'))
    return localStorage.setItem(id, JSON.stringify(cleanData))
}

export function removeSubject(id) {
    isCloudUpdatePending = true
    const index = getAllSubjectIds()
    localStorage.setItem('index', JSON.stringify(index.filter(i => i !== id)))
    window.dispatchEvent(new Event('storage'))
    return localStorage.removeItem(id)
}

export function exportSubjectData() {
    return JSON.stringify(getAllSubjects().map(s => s[0]))
}

export function importSubjectData(data) {
    localStorage.setItem("index", "[]")
    data.forEach(subject => {
        createSubject(subject)
    })
    window.dispatchEvent(new Event('storage'))
}

export function onStorageChanged(callback) {
    window.addEventListener('storage', callback)
}