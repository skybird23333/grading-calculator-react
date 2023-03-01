//@ts-check
import { v1 } from 'uuid'

/**
 * @typedef Assessment
 * @property {string} name
 * @property {boolean} due
 * @property
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

function initLocalStorage() {
    const index = localStorage.getItem('index')
    if(!index) {
        localStorage.setItem('index', '["b4611ce8-90f4-4b67-a3a4-beb8eda4233d"]')
        localStorage.setItem('b4611ce8-90f4-4b67-a3a4-beb8eda4233d', JSON.stringify({
            name: "Example Subject",
            goal: 75,
            assessments: [
              {
                name: 'Example Assessment 1',
                due: false,
                grading: 86,
                weighting: 50,
              },
              {
                name: 'Example Assessment 2',
                due: false,
                grading: 68,
                weighting: 20,
              },
              {
                name: 'Example Assessment 3',
                due: true,
                weighting: 30,
              }
            ],
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
 * @param {Subject} data 
 * @returns string UUID
 */
export function createSubject(data) {
    const index = getAllSubjectIds()
    const id = v1()

    index.push(id)

    localStorage.setItem('index', JSON.stringify(index))
    localStorage.setItem(id, JSON.stringify(data))
    
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
    return localStorage.setItem(id, JSON.stringify(data))
}

export function removeSubject(id) {
    const index = getAllSubjectIds()
    localStorage.setItem('index', JSON.stringify(index.filter(i => i !== id)))
    return localStorage.removeItem(id)
}

export function exportSubjectData() {
    return JSON.stringify(getAllSubjects().map(s => s[0]))
}

export function importSubjectData(data) {
    data.forEach(subject => {
        createSubject(subject)
    })
}