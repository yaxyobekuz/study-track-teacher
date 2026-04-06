import { MapPin, WifiOff } from "lucide-react";

const GeolocationStatus = ({ accuracy, error }) => {
  if (error) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-red-600">
        <WifiOff className="size-4" strokeWidth={1.5} />
        <span>GPS aniqlanmadi</span>
      </div>
    );
  }

  if (accuracy === null || accuracy === undefined) {
    return (
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <MapPin className="size-4" strokeWidth={1.5} />
        <span>Joylashuv kutilmoqda...</span>
      </div>
    );
  }

  const isGood = accuracy <= 50;
  const isMedium = accuracy <= 150;

  return (
    <div
      className={`flex items-center gap-1.5 text-sm ${
        isGood ? "text-green-600" : isMedium ? "text-yellow-600" : "text-red-600"
      }`}
    >
      <MapPin className="size-4" strokeWidth={1.5} />
      <span>
        GPS aniqligi: ±{Math.round(accuracy)} m
        {!isGood && " (yaxshi emas)"}
      </span>
    </div>
  );
};

export default GeolocationStatus;
