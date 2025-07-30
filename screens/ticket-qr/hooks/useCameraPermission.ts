import { useCameraPermissions } from "expo-camera";
import { useEffect, useState } from "react";

export function useCameraPermission() {
  const [hasPermission, setHasPermission] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    const requestCameraPermission = async () => {
      const { status } = await requestPermission();
      setHasPermission(status === "granted");
    };
    requestCameraPermission();
  }, []);

  return { hasPermission, requestPermission };
}
