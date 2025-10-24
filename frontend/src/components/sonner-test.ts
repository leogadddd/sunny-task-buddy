import { useEffect } from "react";
import { toast } from "sonner";

export function SonnerTest() {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        event.preventDefault();

        const toastTypes = [
          () => toast("Simple toast message"),
          () => toast.success("Operation completed successfully!"),
          () => toast.error("Something went wrong"),
          () => toast.warning("Please be careful"),
          () => toast.info("Here is some information"),
          () =>
            toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
              loading: "Loading...",
              success: "Data loaded",
              error: "Failed to load",
            }),
          () =>
            toast("Custom action", {
              icon: "🚀",
              action: {
                label: "Undo",
                onClick: () => alert("Undone!"),
              },
              duration: 10000,
            }),
        ];

        const randomToast =
          toastTypes[Math.floor(Math.random() * toastTypes.length)];
        randomToast();
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, []);

  return null;
}
