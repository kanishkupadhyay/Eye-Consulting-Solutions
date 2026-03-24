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
