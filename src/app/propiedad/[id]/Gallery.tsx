"use client";

import { useState } from "react";

export function Gallery({
  photos,
  title,
}: {
  photos: Array<{ id: string; url: string; thumbUrl: string | null }>;
  title: string;
}) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="card flex aspect-[4/3] items-center justify-center text-slate-400">
        Sin fotografías
      </div>
    );
  }

  const current = photos[Math.min(active, photos.length - 1)]!;

  return (
    <div>
      <div className="card overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={`${title} — fotografía ${active + 1} de ${photos.length}`}
          className="aspect-[4/3] w-full bg-slate-100 object-cover"
          width={1600}
          height={1200}
        />
      </div>
      {photos.length > 1 && (
        <div className="mt-2 flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Fotografías">
          {photos.map((p, i) => (
            <button
              key={p.id}
              type="button"
              role="tab"
              aria-selected={i === active}
              className={`shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? "border-brand-600" : "border-transparent"
              }`}
              onClick={() => setActive(i)}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.thumbUrl ?? p.url}
                alt=""
                className="h-16 w-24 object-cover"
                loading="lazy"
                width={96}
                height={64}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
