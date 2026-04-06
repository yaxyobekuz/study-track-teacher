import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { LogIn, LogOut, AlertTriangle } from "lucide-react";

import { attendanceAPI } from "../api/attendance.api";
import GeolocationStatus from "./GeolocationStatus";
import { STATUS_LABELS, STATUS_COLORS } from "../data/attendance.data";

const CheckInOutCard = ({ todayRecord }) => {
  const [loading, setLoading] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null);
  const [gpsError, setGpsError] = useState(null);
  const queryClient = useQueryClient();

  const hasCheckedIn = !!todayRecord?.checkIn;
  const hasCheckedOut = !!todayRecord?.checkOut;

  const formatTime = (isoString) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLocation = () =>
    new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsAccuracy(pos.coords.accuracy);
          setGpsError(null);

          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
          });
        },
        (err) => {
          setGpsError(err.message);
          reject(err);
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
      );
    });

  const handleCheckIn = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    getLocation();
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 space-y-5">
      {/* Bugungi holat */}
      {todayRecord && (
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex rounded-full px-3 py-1 text-sm font-medium ${
              STATUS_COLORS[todayRecord.status]
            }`}
          >
            {STATUS_LABELS[todayRecord.status]}
          </span>

          {todayRecord.outOfOffice && (
            <span className="flex items-center gap-1 text-xs text-orange-600">
              <AlertTriangle className="size-3.5" strokeWidth={1.5} />
              Ofisdan tashqarida
            </span>
          )}
        </div>
      )}

      {/* Vaqtlar */}
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

      {/* GPS holati */}
      <GeolocationStatus accuracy={gpsAccuracy} error={gpsError} />

      {/* Tugmalar */}
      <div className="flex flex-col gap-3 sm:flex-row">
        {!hasCheckedIn && (
          <button
            onClick={handleCheckIn}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-green-500 px-5 py-3.5 text-white font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
          >
            <LogIn className="size-5" strokeWidth={1.5} />
            {loading ? "Aniqlanmoqda..." : "Men keldim"}
          </button>
        )}

        {hasCheckedIn && !hasCheckedOut && (
          <button
            onClick={handleCheckOut}
            disabled={loading}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-3.5 text-white font-medium hover:bg-red-600 disabled:opacity-50 transition-colors"
          >
            <LogOut className="size-5" strokeWidth={1.5} />
            {loading ? "Aniqlanmoqda..." : "Men ketdim"}
          </button>
        )}

        {hasCheckedIn && hasCheckedOut && (
          <div className="flex-1 rounded-xl bg-gray-100 px-5 py-3.5 text-center text-gray-500 font-medium">
            Bugun davomatingiz to'liq qayd etildi
          </div>
        )}
      </div>

      {/* Kech kelish bildirishnomasi */}
      {todayRecord?.isLate && (
        <p className="text-sm text-yellow-700 bg-yellow-50 rounded-lg px-3 py-2">
          {todayRecord.lateMinutes} daqiqa kech keldingiz
        </p>
      )}

      {todayRecord?.isEarlyOut && (
        <p className="text-sm text-orange-700 bg-orange-50 rounded-lg px-3 py-2">
          {todayRecord.earlyOutMinutes} daqiqa erta ketdingiz
        </p>
      )}
    </div>
  );
};

export default CheckInOutCard;
