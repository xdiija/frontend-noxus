export const STATUS = {
    ACTIVE: 1,
    INACTIVE: 2
};

export const STATUS_LABELS = {
    [STATUS.ACTIVE]: 'Ativo',
    [STATUS.INACTIVE]: 'Inativo'
};

export const activeInactive = Object.entries(STATUS_LABELS).map(
    ([value, label]) => ({ value: Number(value), label })
);
