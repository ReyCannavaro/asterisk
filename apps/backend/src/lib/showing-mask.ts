/**
 * Showing Mode Masking Helper for Backend
 * Automatically sanitizes passwords, ports, and sensitive database strings
 */
export function scrubSensitiveFields<T>(data: T, isShowing: boolean): T {
  if (!isShowing || data === null || typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => scrubSensitiveFields(item, isShowing)) as unknown as T;
  }

  const result: any = { ...data };

  // Masking password and encrypted values
  if ("encryptedValue" in result) {
    result.encryptedValue = "••••••••••••";
  }
  if ("password" in result) {
    result.password = "••••••••••••";
  }
  if ("passwordHash" in result) {
    delete result.passwordHash;
  }

  // Masking ports
  if ("port" in result && typeof result.port === "number") {
    result.port = 0; // Masked port indicator
  }

  // Masking host IP addresses
  if ("host" in result && typeof result.host === "string") {
    result.host = result.host.replace(/\d+\.\d+$/, "**.**");
  }

  // Obfuscate client real names if showing alias exists
  if ("showingAlias" in result && result.showingAlias) {
    result.name = result.showingAlias;
  }

  return result;
}
