export default function calculateColorFromGrade(grade) {
    if (isNaN(grade)) return "none"
    if (grade >= 80) return "green";
    if (grade === 0) return "none";
    return grade >= 50 ? "yellow" : "red";
}