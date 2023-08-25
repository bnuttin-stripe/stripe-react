import { atom, useRecoilState } from 'recoil';

// Use the following effect to persist anything to session storage
const localStorageEffect = key => ({ setSelf, onSet }) => {
    const savedValue = sessionStorage.getItem(key)
    if (savedValue != null) {
        setSelf(JSON.parse(savedValue));
    }

    onSet((newValue, _, isReset) => {
        isReset
            ? sessionStorage.removeItem(key)
            : sessionStorage.setItem(key, JSON.stringify(newValue));
    });
};

export const paymentMethodsGlobalAtom = atom({
    key: 'paymentMethodsGlobalAtom',
    default: [],
    effects: [
        ({ onSet }) => {
            onSet(data => {
                console.log(data.length + " payment methods");
            });
        },
    ]
});

export const customerAtom = atom({
    key: 'customerAtom',
    default: {},
    effects: [
        localStorageEffect('customer'),
    ]
});

export const refresherAtom = atom({
    key: 'refresherAtom',
    default: {}
});

