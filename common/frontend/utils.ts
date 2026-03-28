import { Notification } from "./notification";

export function formatDateNumeric(isoString: string) {
  if (!isoString) {
    return;
  }
  const date = new Date(isoString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export const getTokenFromLocalStorage = (): string => {
  const token = localStorage.getItem("authToken");

  if (!token) {
    Notification.error("You are not authenticated");
    throw new Error("No auth token found");
  }
  return token;
};

// Generate deterministic color from string
export const getUniqueColor = (input: string) => {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = input.charCodeAt(i) + ((hash << 5) - hash); // simple hash function
    hash = hash & hash; // convert to 32bit integer
  }
  const hue = Math.abs(hash) % 360; // hue between 0-359
  const saturation = 65; // fixed saturation for brightness
  const lightness = 55; // fixed lightness for readability
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};