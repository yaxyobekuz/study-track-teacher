// Toaster
import { toast } from "sonner";

// React
import { useEffect } from "react";

// Icons
import { AlertTriangle } from "lucide-react";

// API
import { attendanceAPI } from "../api/attendance.api";

// Tanstack Query
import { useQueryClient } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import GeolocationStatus from "./GeolocationStatus";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useObjectState from "@/shared/hooks/useObjectState";

// Data
import { STATUS_LABELS, STATUS_COLORS } from "../data/attendance.data";

const formatTime = (isoString) => {
  if (!isoString) return "--:--";
  return new Date(isoString).toLocaleTimeString("uz-UZ", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
const CheckInOutCard = ({ todayRecord }) => {
  const queryClient = useQueryClient();
  const { loading, gpsAccuracy, gpsError, setField } = useObjectState({
    loading: false,
    gpsAccuracy: null,
    gpsError: null,
  });

  const hasCheckedIn = !!todayRecord?.checkIn;
  const hasCheckedOut = !!todayRecord?.checkOut;

  const getLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setField("gpsAccuracy", pos.coords.accuracy);
          setField("gpsError", null);

          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          setField("gpsError", err.message);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    });

  const handleCheckIn = async () => {
    setField("loading", true);
    try {
      const location = await getLocation();
      await attendanceAPI.checkIn(location);
      queryClient.invalidateQueries({ queryKey: ["attendance", "today"] });
      toast.success("Kelganlik qayd etildi");
    } catch (err) {
      if (err.code) {
        toast.error("GPS-ni yoqing va ruxsat bering");
      } else {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      }
    } finally {
      setField("loading", false);
    }
  };

  const handleCheckOut = async () => {
    setField("loading", true);
    try {
      const location = await getLocation();
      await attendanceAPI.checkOut(location);
      queryClient.invalidateQueries({ queryKey: ["attendance", "today"] });
      toast.success("Ketganlik qayd etildi");
    } catch (err) {
      if (err.code) {
        toast.error("GPS-ni yoqing va ruxsat bering");
      } else {
        toast.error(err.response?.data?.message || "Xatolik yuz berdi");
      }
    } finally {
      setField("loading", false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <Card className="space-y-4">
      {/* Today's Status */}
      {todayRecord && (
        <div className="flex items-center gap-4">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              STATUS_COLORS[todayRecord.status]
            }`}
          >
            {STATUS_LABELS[todayRecord.status]}
          </span>

          {todayRecord.outOfOffice && (
            <span className="flex items-center gap-1.5 text-sm text-orange-600">
              <AlertTriangle className="size-4" strokeWidth={1.5} />
              Ofisdan tashqaridasiz
            </span>
          )}
        </div>
      )}

      {/* Times */}
      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Keldi</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatTime(todayRecord?.checkIn)}
          </p>
        </div>

        <div className="rounded-xl bg-gray-50 p-4 text-center">
          <p className="text-xs text-gray-500 mb-1">Ketdi</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatTime(todayRecord?.checkOut)}
          </p>
        </div>
      </div>

      {/* GPS status */}
      <GeolocationStatus accuracy={gpsAccuracy} error={gpsError} />

      {/* Buttons */}
      <div className="flex flex-col gap-4 sm:flex-row">
        {!hasCheckedIn && (
          <Button disabled={loading} onClick={handleCheckIn} className="flex-1">
            Men keldim{loading && "..."}
          </Button>
        )}

        {hasCheckedIn && !hasCheckedOut && (
          <Button
            variant="danger"
            disabled={loading}
            className="flex-1"
            onClick={handleCheckOut}
          >
            Men ketdim{loading && "..."}
          </Button>
        )}

        {hasCheckedIn && hasCheckedOut && (
          <Button className="flex-1" asChild variant="secondary" disabled>
            <p>Bugun davomatingiz to'liq qayd etildi</p>
          </Button>
        )}
      </div>

      {/* Late Notification */}
      {todayRecord?.isLate && (
        <p className="text-sm text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2">
          {todayRecord.lateMinutes} daqiqa kech keldingiz
        </p>
      )}

      {/* Early Out Notification */}
      {todayRecord?.isEarlyOut && (
        <p className="text-sm text-orange-700 bg-orange-50 rounded-lg px-3 py-2">
          {todayRecord.earlyOutMinutes} daqiqa erta ketdingiz
        </p>
      )}
    </Card>
  );
};

export default CheckInOutCard;
