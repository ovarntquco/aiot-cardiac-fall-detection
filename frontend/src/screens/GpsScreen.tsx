import { useCallback, useEffect, useState } from "react";
import { Clock, ExternalLink, LocateFixed, MapPin, RefreshCcw } from "lucide-react";
import { fetchGpsLocation, type GpsResponse } from "../api";
import { StateMessage } from "../components/common/StateMessage";
import { DashboardLayout } from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/button";
import { formatDateTime } from "../lib/format";
import type { Screen } from "../types";

export function GpsScreen({ onNav, patientId }: { onNav: (screen: Screen) => void; patientId?: string }) {
  const [data, setData] = useState<GpsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLocation = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchGpsLocation(patientId));
    } catch (loadError) {
      setData(null);
      setError(loadError instanceof Error ? loadError.message : "Failed to load GPS location.");
    } finally {
      setLoading(false);
    }
  }, [patientId]);

  useEffect(() => {
    void loadLocation();
  }, [loadLocation]);

  const location = data?.location;
  const validLocation = location && isValidCoordinate(location.latitude, location.longitude)
    ? location
    : null;

  return (
    <DashboardLayout
      screen={patientId ? "patients" : "gps"}
      onNav={onNav}
      title="GPS Location"
      subtitle={data?.patient?.name ? `Current location - ${data.patient.name}` : "Current patient location"}
      patientId={patientId}
      patientSection={patientId ? "gps" : undefined}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-5 flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Latest location received from the patient device</p>
          <Button type="button" variant="ghost" disabled={loading} onClick={() => void loadLocation()} className="min-h-12">
            <RefreshCcw className={loading ? "animate-spin" : ""} aria-hidden="true" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {loading && <StateMessage title="Loading GPS location" message="Retrieving the latest coordinates from the database." />}
        {!loading && error && (
          <StateMessage tone="error" title="Failed to load location" message={error} actionLabel="Retry" onAction={() => void loadLocation()} />
        )}
        {!loading && !error && !validLocation && (
          <StateMessage
            tone="empty"
            title="No GPS location available"
            message={location ? "The latest GPS coordinates are invalid." : "The patient device has not reported a GPS location yet."}
            actionLabel="Refresh"
            onAction={() => void loadLocation()}
          />
        )}

        {!loading && !error && validLocation && (
          <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_14px_40px_rgba(15,23,42,0.08)]">
            <iframe
              title={`Map showing ${data?.patient?.name || "the patient"}'s latest location`}
              src={buildMapEmbedUrl(validLocation.latitude, validLocation.longitude)}
              className="h-[28rem] w-full border-0 sm:h-[34rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />

            <div className="grid grid-cols-1 gap-4 border-t border-border p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-6">
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div className="flex items-start gap-2">
                  <MapPin className="mt-0.5 flex-shrink-0 text-primary" size={17} aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Coordinates</p>
                    <p className="mt-0.5 font-semibold text-foreground">
                      {validLocation.latitude.toFixed(6)}, {validLocation.longitude.toFixed(6)}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Clock className="mt-0.5 flex-shrink-0 text-primary" size={17} aria-hidden="true" />
                  <div>
                    <p className="text-xs text-muted-foreground">Recorded at</p>
                    <p className="mt-0.5 font-semibold text-foreground">{formatRecordedAt(validLocation.recordedAt)}</p>
                  </div>
                </div>
              </div>

              <Button asChild variant="outline" className="min-h-12 w-full sm:w-auto">
                <a
                  href={buildOpenMapUrl(validLocation.latitude, validLocation.longitude)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <LocateFixed aria-hidden="true" />
                  Open full map
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

function isValidCoordinate(latitude: number, longitude: number) {
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= -90
    && latitude <= 90
    && longitude >= -180
    && longitude <= 180;
}

function buildMapEmbedUrl(latitude: number, longitude: number) {
  const latitudeSpan = 0.01;
  const longitudeSpan = 0.015;
  const bbox = [
    longitude - longitudeSpan,
    latitude - latitudeSpan,
    longitude + longitudeSpan,
    latitude + latitudeSpan,
  ].join(",");
  const params = new URLSearchParams({
    bbox,
    layer: "mapnik",
    marker: `${latitude},${longitude}`,
  });
  return `https://www.openstreetmap.org/export/embed.html?${params.toString()}`;
}

function buildOpenMapUrl(latitude: number, longitude: number) {
  return `https://www.openstreetmap.org/?mlat=${encodeURIComponent(latitude)}&mlon=${encodeURIComponent(longitude)}#map=16/${latitude}/${longitude}`;
}

function formatRecordedAt(value: string) {
  return Number.isNaN(Date.parse(value)) ? "Time unavailable" : formatDateTime(value);
}
