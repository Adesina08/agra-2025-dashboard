import { useEffect, useMemo, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { Submission } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { headerTone, Variant } from "./variantStyles";

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
    if (!containerRef.current) return;

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
          const approvalColor = statusPill(submission.status as string);
          const submittedOn = new Date(submission.submissionDate).toLocaleString('en-GB', {
            dateStyle: 'medium',
            timeStyle: 'short',
          });

          const marker = L.circleMarker([submission.latitude, submission.longitude], {
            radius: 7,
            color: variantColors[variant],
            weight: 2,
            fillColor: variantColors[variant],
            fillOpacity: 0.85,
          }).bindTooltip(
            `
      <div class="submission-tooltip">
        <div class="tooltip-title">${submission.region}</div>
        <div class="tooltip-sub">${submission.district}</div>

        <div class="tooltip-row">
          <span class="tooltip-label">Enumerator</span>
          <span>${submission.enumerator}</span>
        </div>

        <div class="tooltip-row">
          <span class="tooltip-label">Profile</span>
          <span>${submission.gender} • ${submission.ageGroup}</span>
        </div>

        <div class="tooltip-row">
          <span class="tooltip-label">Status</span>
          <span class="tooltip-pill" style="
            border-color:${approvalColor};
            color:${approvalColor};
            background-color:${approvalColor}1a;
          ">
            ${submission.status}
          </span>
        </div>

        <div class="tooltip-row">
          <span class="tooltip-label">Submitted</span>
          <span>${submittedOn}</span>
        </div>
      </div>
    `,
            {
              className: 'submission-tooltip-wrapper',
              direction: 'top',
              opacity: 0.98,
              offset: [0, -10],
            }
          );

          (marker as any).on('mouseover', () => marker.setStyle({ radius: 9, weight: 3 }));
          (marker as any).on('mouseout', () => marker.setStyle({ radius: 7, weight: 2 }));

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

  const statusPill = (status?: string) => {
    const normalized = status?.trim().toLowerCase();
    if (normalized === 'approved') return '#22c55e';
    if (normalized === 'rejected' || normalized === 'not approved') return '#ef4444';
    return '#f59e0b';
  };

  const mapHeightClass = variant === 'youth' ? 'h-[460px]' : 'h-[380px]';

  return (
    <div className="minimal-card h-full">
      <div
        className={cn(
          'flex items-center gap-2 mb-3 text-sm rounded-lg px-4 py-3 border',
          headerTone[variant]
        )}
      >
        <MapPin className="h-4 w-4" />
        <span className="font-semibold">{title}</span>
      </div>

      {mapError ? (
        <div className="text-sm text-muted-foreground py-10 text-center">
          Map could not be loaded right now.
        </div>
      ) : (
        <div className="relative">
          <div
            ref={containerRef}
            className={cn('rounded-lg border border-border/60', mapHeightClass)}
          />
          {points.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-background/80">
              No submission coordinates available yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
