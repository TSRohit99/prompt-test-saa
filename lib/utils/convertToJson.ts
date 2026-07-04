export function convertToJson(data: unknown): unknown {
  try {
    let stringData =
      typeof data === "object" ? JSON.stringify(data) : String(data);
    stringData = stringData
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^\s+|\s+$/g, "");
    return JSON.parse(stringData);
  } catch (error) {
    console.error("Error converting to JSON:", error);
    throw error;
  }
}
