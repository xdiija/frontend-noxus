export default function dateHelper() {

    const convertToDbFormat = (brDate) => {
        if (!brDate) return null;
        const [day, month, year] = brDate.split('/');
        return `${year}-${month}-${day}`;
    };

    const convertToBrFormat = (dbDate) => {
        const [year, month, day] = dbDate.split('-');
        return `${day}/${month}/${year}`;
    };

    return {
        convertToDbFormat,
        convertToBrFormat
    }
}
