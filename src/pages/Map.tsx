import Maharlika from "@/assets/geojson/Maharlika.json";
import Pasacao from "@/assets/geojson/Pasacao.json";
import Street from "@/assets/geojson/Street.json";
import Border from "@/assets/geojson/Border.json";
import Building from "@/assets/geojson/Building.json";
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo, useState } from "react";
import type { Feature } from "geojson";
import useMapping from "@/features/api/map/useMapping";
import { Mapping } from "@/service/api/map/getMapping";
import { AddMappingModal } from "@/features/map/AddMappingModal";

const center: LatLngExpression = [13.579126, 123.063078];

export default function Map() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: mappings } = useMapping();

  const building = useMemo(() => {
    if (!mappings) return Building;
    return {
      ...Building,
      features: Building.features.map((feature: any) => {
        const fid = Number(feature.properties?.id);
        const mapping = mappings.mappings.find((m: Mapping) => m.FID === fid);
        return {
          ...feature,
          properties: {
            ...feature.properties,
            ...(mapping
              ? {
                type: mapping.Type,
                mapping_name: mapping.MappingName,
                household_id: mapping.HouseholdID,
                mapping_id: mapping.ID,
              }
              : {}),
          },
        };
      }),
    };
  }, [mappings]);

  const roadStyle: L.PathOptions = {
    color: "#333446",
    weight: 1,
    fillColor: "#333446",
    fillOpacity: 0.3,
    interactive: true,
  };

  const borderStyle: L.PathOptions = {
    fillColor: "#FAF7F3",
    weight: 1,
    color: "black",
    interactive: true,
  };

  const infraStyle: L.PathOptions = {
    color: "gray",
    weight: 1,
    fillColor: "gray",
    fillOpacity: 0.1,
    interactive: true,
  };

  const updatedStyle: L.PathOptions = {
    color: "green",
    weight: 1,
    fillColor: "green",
    fillOpacity: 0.1,
    interactive: true,
  };

  const onEachRoad = (road, layer) => {
    const roadName = road.properties.name;

    layer.bindPopup(roadName, { autoPan: false });
    layer.on("mouseover", () => {
      layer.openPopup();
      layer.setStyle({
        color: "blue",
        fillColor: "blue",
        fillOpacity: 0.3,
      });
    });

    layer.on("mouseout", () => {
      layer.closePopup();
      layer.setStyle({
        color: "#333446",
        weight: 1,
        fillColor: "#333446",
        fillOpacity: 0.3,
      });
    });
  };
  const onEachInfra = (infra, layer) => {
    const display = infra.properties?.mapping_name;
    const popupContent = String(display ?? "Not Assigned yet.");

    layer.bindPopup(popupContent);
    layer.on("mouseover", () => {
      layer.openPopup();
      layer.setStyle({
        color: "orange",
        fillColor: "#F59E0B",
      });
    });

    layer.on("mouseout", () => {
      layer.closePopup();
      if (infra.properties?.type?.includes("Commercial") || infra.properties?.type?.includes("commercial")) {
        layer.setStyle({
          color: "blue",
          fillColor: "blue",
        });
      } else if (infra.properties?.type?.includes("Institutional") || infra.properties?.type?.includes("institutional")) {
        layer.setStyle({
          color: "purple",
          fillColor: "purple",
        });
      } else {
        layer.setStyle(
          /Household #\s*\d+/.test(display) ? updatedStyle : infraStyle
        );
      }
    });

    layer.on("click", (e) => {
      setSelectedFeature(infra);
      setDialogOpen(true);
    });
  };

  return (
    <div className="w-[85vw] h-[80vh] border-1 p-10 rounded-2xl overflow-hidden shadow-md">
      <MapContainer
        center={center}
        zoom={17}
        className="w-full h-full rounded-2xl"
        zoomAnimation={false}
        fadeAnimation={false}
        minZoom={15}
        maxZoom={20}
        zoomSnap={0.3}
      >
        <GeoJSON data={Border.features as any} style={borderStyle} />
        <GeoJSON
          data={Pasacao.features as any}
          style={roadStyle}
          onEachFeature={onEachRoad}
        />
        <GeoJSON
          data={Maharlika.features as any}
          style={roadStyle}
          onEachFeature={onEachRoad}
        />
        <GeoJSON
          data={Street.features as any}
          style={roadStyle}
          onEachFeature={onEachRoad}
        />
        <GeoJSON
          key={JSON.stringify(building)}
          data={building as any}
          style={(feature: any) => {
            if (
              /Household #\s*\d+/.test(feature.properties?.mapping_name)
            ) {
              return updatedStyle;
            }
            if (feature.properties?.type?.includes("Commercial") || feature.properties?.type?.includes("commercial")) {
              return { color: "blue", fillColor: "blue" };
            }
            if (feature.properties?.type?.includes("Institutional") || feature.properties?.type?.includes("institutional")) {
              return { color: "purple", fillColor: "purple" };
            }
            return infraStyle;
          }}
          onEachFeature={onEachInfra}
        />
      </MapContainer>
      <AddMappingModal
        feature={selectedFeature}
        dialogOpen={dialogOpen}
        onOpenChange={() => {
          setDialogOpen(false)
          setSelectedFeature(null)
        }}
      />
      <h1 className="mt-2 text-end">Land Area
        : <span className="font-bold">294.754571456 Hectares</span></h1>
    </div>
  );
}
