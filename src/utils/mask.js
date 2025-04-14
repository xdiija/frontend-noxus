export default function mask() {

    const phoneMask = (value) => {
        if (!value) return ""

        value = value.replace(/\D/g, '')
        value = value.substring(0, 11);
        value = value.replace(/(\d{2})(\d)/, "($1) $2")
        value = value.replace(/(\d)(\d{4})$/, "$1-$2")

        return value
    };

    const cpfMask = (value) => {
        if (!value) return ""

        value = value.replace(/\D/g, "")
        value = value.substring(0, 11);
        value = value.replace(/(\d{3})(\d)/, "$1.$2")
        value = value.replace(/(\d{3})(\d)/, "$1.$2")
        value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2")

        return value
    };

    const cnpjMask = (value) => {
        if (!value) return ""

        value = value.replace(/\D/g, "")
        value = value.replace(/^(\d{2})(\d)/, "$1.$2")
        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
        value = value.replace(/\.(\d{3})(\d)/, ".$1/$2")
        value = value.replace(/(\d{4})(\d)/, "$1-$2")

        return value
    };

    const unMask = (value) => {

        if (!value) return "";

        return value.replace(/\D/g, "");
    };

    return {
        phoneMask,
        cpfMask,
        cnpjMask,
        unMask
    }
}
