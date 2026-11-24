
export {};

declare global {
  interface Window {
    fbq?: (
      command: string,
      eventName: string
    ) => void;
  }
}
