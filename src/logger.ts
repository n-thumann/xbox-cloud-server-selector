function log(message: string, ...optionalParams: object[]) {
  console.log(`[xbox-cloud-server-selector] ${message}`, ...optionalParams);
}

export { log };
