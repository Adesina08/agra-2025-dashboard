import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Submission } from "@/data/mockData";

type Variant = "farmer" | "enterprise" | "youth";

type LeafletBounds = unknown;
type LeafletMap = {
  setView: (center: [number, number], zoom: number) => LeafletMap;
  fitBounds: (bounds: LeafletBounds, options?: { padding?: [number, number] }) => void;
  remove: () => void;
};

type LeafletLayer = { addTo: (map: LeafletMap) => LeafletLayer };
type LeafletMarker = {
  bindTooltip: (html: string, options?: Record<string, unknown>) => LeafletMarker;
  addTo: (map: LeafletMap) => LeafletMarker;
  remove: () => void;
};

type LeafletNamespace = {
  map: (element: HTMLElement) => LeafletMap;
  tileLayer: (url: string, options?: Record<string, unknown>) => LeafletLayer;
  circleMarker: (latLng: [number, number], options?: Record<string, unknown>) => LeafletMarker;
  latLngBounds: (latLngs: [number, number][]) => LeafletBounds;
};

interface SubmissionMapProps {
  submissions?: Submission[];
  title: string;
  variant?: Variant;
}

const variantColors: Record<Variant, string> = {
  farmer: "#22c55e",
  enterprise: "#f59e0b",
  youth: "#06b6d4",
};

const LEAFLET_CSS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
const LEAFLET_JS = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";

function ensureLeaflet(): Promise<LeafletNamespace> {
  if (typeof window === "undefined") return Promise.reject();

  const existing = (window as any).L as LeafletNamespace | undefined;
  if (existing) return Promise.resolve(existing);

  return new Promise((resolve, reject) => {
    const cssId = "leaflet-css";
    if (!document.getElementById(cssId)) {
      const link = document.createElement("link");
      link.id = cssId;
      link.rel = "stylesheet";
      link.href = LEAFLET_CSS;
      document.head.appendChild(link);
    }

    const scriptId = "leaflet-js";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    const handleReady = () => {
      const L = (window as any).L as LeafletNamespace | undefined;
      if (L) resolve(L);
      else reject(new Error("Leaflet failed to load"));
    };

    if (existingScript && (window as any).L) {
      resolve((window as any).L as LeafletNamespace);
      return;
    }

    const script = existingScript ?? document.createElement("script");
    script.id = scriptId;
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = handleReady;
    script.onerror = () => reject(new Error("Failed to load Leaflet"));

    if (!existingScript) {
      document.body.appendChild(script);
    }
  });
}

export function SubmissionMap({
  submissions = [],
  title,
  variant = "farmer",
}: SubmissionMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState(false);

  const points = useMemo(
    () =>
      (submissions || []).filter(
        (item) =>
          Number.isFinite(item.latitude) &&
          Number.isFinite(item.longitude) &&
          item.latitude !== 0 &&
          item.longitude !== 0
      ),
    [submissions]
  );

  const center = useMemo<[number, number]>(() => {
    if (!points.length) return [2, 20];
    const total = points.reduce(
      (acc, curr) => [acc[0] + curr.latitude, acc[1] + curr.longitude],
      [0, 0]
    );
    return [total[0] / points.length, total[1] / points.length];
  }, [points]);

  useEffect(() => {
    if (!containerRef.current || !points.length) return;

    setMapError(false);

    let map: LeafletMap | null = null;
    const markers: LeafletMarker[] = [];
    let cancelled = false;

    ensureLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;

        map = L.map(containerRef.current).setView(center, 5);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        points.forEach((submission) => {
          const marker = L.circleMarker([submission.latitude, submission.longitude], {
            radius: 6,
            color: variantColors[variant],
            weight: 1,
            fillColor: variantColors[variant],
            fillOpacity: 0.75,
          })
            .bindTooltip(
              `<div style="display:flex;flex-direction:column;gap:2px;font-size:12px;">
                <div style="font-weight:600;">${submission.region}</div>
                <div>${submission.district}</div>
                <div>Enumerator: ${submission.enumerator}</div>
                <div>Status: ${submission.status}</div>
              </div>`,
              { direction: "top" }
            )
            .addTo(map);

          markers.push(marker);
        });

        if (points.length > 1) {
          const bounds = L.latLngBounds(points.map((p) => [p.latitude, p.longitude]));
          map.fitBounds(bounds, { padding: [32, 32] });
        }
      })
      .catch((err) => {
        console.error("Failed to initialize map", err);
        setMapError(true);
      });

    return () => {
      cancelled = true;
      markers.forEach((m) => m.remove());
      map?.remove();
    };
  }, [center, points, variant]);

  return (
    <div className="minimal-card h-full">
      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
        <MapPin className="h-4 w-4" />
        <span>{title}</span>
      </div>

      {points.length === 0 ? (
        <div className="text-sm text-muted-foreground py-10 text-center">
          No submission coordinates available yet.
        </div>
      ) : mapError ? (
        <div className="text-sm text-muted-foreground py-10 text-center">
          Map could not be loaded right now.
        </div>
      ) : (
        <div ref={containerRef} className="h-[380px] rounded-lg border border-border/60" />
      )}
    </div>
  );
}
