import {getSetting} from "./settingsManager";

export default function calculateColorFromGrade(grade) {
    if (isNaN(grade)) return "none"
    if (grade >= getSetting("interface.greenmark")) return "green";
    if (grade === 0) return "none";
    return grade >= getSetting("interface.orangemark") ? "yellow" : "red";
}