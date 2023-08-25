export const displayPrice = (amount, currency) => {
    if (amount === null) return ' - ';
    return amount.toLocaleString('en-US', {
        style: 'currency',
        currency: currency,
    });
}

export const displayDate = (timestamp) => {
    let date = new Intl.DateTimeFormat('en-US', { year: '2-digit', month: '2-digit', day: '2-digit' }).format(timestamp * 1000)
    return date;
}

export const displayDateTime = (timestamp) => {
    let date = new Intl.DateTimeFormat('en-US', { year: '2-digit', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).format(timestamp * 1000)
    return date;
}

export const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    s = s.replace(/_/g, ' ');
    return s.charAt(0).toUpperCase() + s.slice(1)
}

export const isValidEmail = (email) => {
    if (email === undefined) return false;
    return email.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
}

export const defaultAddress = {
    line1: '350 N. Orleans St.',
    city: 'Chicago',
    state: 'IL',
    country: 'US',
    postalCode: '60654'
}