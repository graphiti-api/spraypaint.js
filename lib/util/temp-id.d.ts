declare const generate: () => string;
declare const tempId: {
    generate: () => string;
};
export { tempId, generate as generateTempId };
