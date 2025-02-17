import { FileAttachment } from "observablehq:stdlib";

export async function fetchResults() {
    const obtFiles = await FileAttachment("../data/obt.csv").text();
    return obtFiles.split("\n");
}

export async function fetchSummary() {
    await fetchResults();
    return await FileAttachment("../data/summary.json").json();
}
