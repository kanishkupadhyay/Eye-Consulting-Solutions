import toast from "react-hot-toast";

export class Notification {
  private static duration = 3000;

  public static success(message: string) {
    toast.success(message, {
      duration: this.duration,
      style: {
        background: "green",
        color: "white",
      },
    });
  }

  public static error(message: string) {
    toast.error(message, {
      duration: this.duration,
      style: {
        background: "red",
        color: "white",
      },
    });
  }

  public static warn(message: string) {
    toast(message, {
      duration: this.duration,
      style: {
        background: "orange",
        color: "white",
      },
    });
  }
}
