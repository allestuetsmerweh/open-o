export const getXmlRoot = (contentString) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(contentString, 'text/xml');
    const rootElement = xmlDoc.documentElement;
    return rootElement;
};
