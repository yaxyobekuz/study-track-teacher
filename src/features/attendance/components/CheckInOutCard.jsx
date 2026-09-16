// Toaster
import { toast } from "sonner";

// React
import { useEffect, useRef, useState } from "react";

// Icons
import { AlertTriangle } from "lucide-react";

// API
import { attendanceAPI } from "../api/attendance.api";

// Tanstack Query
import { useQuery, useQueryClient } from "@tanstack/react-query";

// Components
import Card from "@/shared/components/ui/Card";
import GeolocationStatus from "./GeolocationStatus";
import Button from "@/shared/components/ui/button/Button";

// Hooks
import useGeolocation from "@/shared/hooks/useGeolocation";
import useObjectState from "@/shared/hooks/useObjectState";

// Data
import {
  STATUS_LABELS,
  STATUS_COLORS,
  LOCATION_STATUS_LABELS,
  worstLocationStatus,
} from "../data/attendance.data";

// Utils
import { formatTimeUz } from "@/shared/utils/date.utils";

const formatTime = (isoString) => formatTimeUz(isoString, "--:--");

const CheckInOutCard = ({ todayRecord }) => {
  const queryClient = useQueryClient();

  const { data: schedule } = useQuery({
    queryKey: ["attendance", "my-schedule"],
    queryFn: () => attendanceAPI.getMySchedule().then((r) => r.data.data),
  });

  const { loading, setField } = useObjectState({ loading: false });

  // Joylashuv — yagona hook (`useGeolocation`): kuzatuv bilan eng aniq
  // natijani tanlaydi va HECH QACHON xato tashlamaydi.
  //
  // ⚠️ `auto` — joylashuv oldindan aniqlanadi, lekin FAQAT ruxsat
  // allaqachon berilgan bo'lsa. Ruxsat hali so'ralmagan qurilmada oyna
  // odam tugmani bosganda chiqadi (hook sarlavhasidagi sabab: javobsiz
  // qolgan oynalar Chrome'da saytni jimgina bloklaydi).
  const {
    accuracy: gpsAccuracy,
    error: gpsError,
    loading: gpsLoading,
    permission: gpsPermission,
    request: requestLocation,
  } = useGeolocation({ auto: true });

  // Bitta kadr ichidagi ikki bosish holatni ko'rmasdan ikkinchi qaydni
  // yubormasin ("allaqachon qayd etilgan" xatosi).
  const submitting = useRef(false);

  const [showConfirm, setShowConfirm] = useState(false);
  // Lazy initializer — komponent har qayta render bo'lganda Date.now()
  // qayta chaqirilmasligi uchun (react-hooks/purity).
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(timer);
  }, []);

  const hasCheckedIn = !!todayRecord?.checkIn;
  const hasCheckedOut = !!todayRecord?.checkOut;

  const checkInTime = todayRecord?.checkIn ? new Date(todayRecord.checkIn) : null;
  const minutesSinceCheckIn = checkInTime ? (now - checkInTime.getTime()) / 60000 : 0;
  const canCheckOut = minutesSinceCheckIn >= 5;
  const remainingSeconds = checkInTime
    ? Math.max(0, Math.ceil(5 * 60 - (now - checkInTime.getTime()) / 1000))
    : 0;

  /**
   * ⚠️ JOYLASHUV OLINMASA HAM QAYD ETILADI. Ilgari GPS xatosi butun
   * so'rovni to'xtatardi va xodim davomatdan umuman o'tolmasdi —
   * noutbukda yoki bino ichida bu har kuni takrorlanardi. Endi server
   * joylashuvni "berilmagan" deb yozadi, rahbar esa buni ko'radi.
   */
  const handleCheckIn = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setField("loading", true);
    try {
      const location = await requestLocation();
      await attendanceAPI.checkIn(location || {});
      queryClient.invalidateQueries({ queryKey: ["attendance", "today"] });
      toast.success(
        location
          ? "Kelganlik qayd etildi"
          : "Kelganlik qayd etildi — joylashuvsiz",
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      submitting.current = false;
      setField("loading", false);
    }
  };

  const handleCheckOut = async () => {
    if (submitting.current) return;
    submitting.current = true;
    setShowConfirm(false);
    setField("loading", true);
    try {
      const location = await requestLocation();
      await attendanceAPI.checkOut(location || {});
      queryClient.invalidateQueries({ queryKey: ["attendance", "today"] });
      toast.success(
        location
          ? "Ketganlik qayd etildi"
          : "Ketganlik qayd etildi — joylashuvsiz",
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Xatolik yuz berdi");
    } finally {
      submitting.current = false;
      setField("loading", false);
    }
  };

  return (
    <Card className="space-y-4">
      {/* Work Schedule */}
      {schedule && (
        <div className="rounded-xl bg-blue-50 px-4 py-3">
          {schedule.workStartTime && schedule.workEndTime ? (
            <p className="text-sm text-blue-800">
              Ish vaqtingiz:{" "}
              <span className="font-semibold">
                {schedule.workStartTime}–{schedule.workEndTime}
              </span>
              {" · "}
              {schedule.isWorkDayToday ? "Bugun ish kuni" : "Bugun dam olish kuni"}
              {schedule.source === "schedule" && (
                <span className="block text-xs text-blue-600">
                  Dars jadvalingiz bo'yicha
                </span>
              )}
            </p>
          ) : schedule.source === "schedule" ? (
            /* Dars jadvalidan ishlaydigan xodim: vaqt yo'qligi "sozlanmagan"
               EMAS, "bugun dars yo'q" degani. Ikkalasi bir xil matn bilan
               ko'rsatilsa, o'qituvchi ish vaqtim yo'qolibdi deb o'ylardi. */
            <p className="text-sm text-blue-800">
              {schedule.scheduleMissing
                ? "Dars jadvalida darsingiz yo'q — ish vaqti aniqlanmagan"
                : "Bugun darsingiz yo'q"}
            </p>
          ) : (
            <p className="text-sm text-blue-800">
              Ish vaqti belgilanmagan
            </p>
          )}
        </div>
      )}

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

          {/* ⚠️ Sabab OCHIQ aytiladi: "ofisdan tashqarida" bilan "joylashuv
              berilmagan" ikki xil holat va xodim qaysi biri ekanini bilsa
              gina tuzata oladi (GPS-ni yoqish, ruxsat berish). */}
          {todayRecord.locationWarning && (
            <span className="flex items-center gap-1.5 text-sm text-orange-600">
              <AlertTriangle className="size-4" strokeWidth={1.5} />
              {LOCATION_STATUS_LABELS[worstLocationStatus(todayRecord)] ||
                "Ofisdan tashqarida qayd etilgan"}
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
      <GeolocationStatus
        accuracy={gpsAccuracy}
        error={gpsError}
        loading={gpsLoading}
        permission={gpsPermission}
        onRequest={requestLocation}
      />

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
            disabled={loading || !canCheckOut}
            className="flex-1"
            onClick={() => setShowConfirm(true)}
          >
            {!canCheckOut
              ? `Men ketdim (${Math.floor(remainingSeconds / 60)}:${String(remainingSeconds % 60).padStart(2, "0")})`
              : `Men ketdim${loading ? "..." : ""}`}
          </Button>
        )}

        {hasCheckedIn && hasCheckedOut && (
          <Button className="flex-1" asChild variant="secondary" disabled>
            <p>Bugun davomatingiz to'liq qayd etildi</p>
          </Button>
        )}
      </div>

      {/* Checkout Confirmation */}
      {showConfirm && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
          <p className="text-sm font-medium text-red-800">
            Haqiqatan ham ketmoqchimisiz?
          </p>
          <div className="flex gap-2">
            <Button
              variant="danger"
              className="flex-1"
              disabled={loading}
              onClick={handleCheckOut}
            >
              Ha, ketdim{loading && "..."}
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => setShowConfirm(false)}
            >
              Bekor qilish
            </Button>
          </div>
        </div>
      )}

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
