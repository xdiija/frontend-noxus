export default function currency() {

    const formatBRL = (value) => {
        const onlyDigits = String(value)
            .split("")
            .filter(s => /\d/.test(s))
            .join("")
            .padStart(3, "0")

        return maskCurrency(
            onlyDigits.slice(0, -2) + "." + onlyDigits.slice(-2)
        )
    };

    const formatUSD = (value) => {
        const onlyDigits = String(value)
            .split("")
            .filter(s => /\d/.test(s))
            .join("")
            .padStart(3, "0");
        return onlyDigits.slice(0, -2) + "." + onlyDigits.slice(-2);
    };

    const usdToCents = (value) => {
        return Math.round(parseFloat(value) * 100);
    };

    const maskCurrency = (valor, locale = 'pt-BR', currency = 'BRL') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency
        }).format(valor)
    }

    return {
        formatBRL,
        formatUSD,
        maskCurrency,
        usdToCents
    }
}
