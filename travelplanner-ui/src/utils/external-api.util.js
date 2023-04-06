export const callExternalApi = async (url, options) => {
    let data = null;
    const response = await fetch(url, options);
    const status = response.status;

    try {
        data = await response.json();
    } catch {
        console.log("No response body");
    }
    return {
        data: data ? data: null,
        status: status,
    }
};