import Maharlika from "@/assets/geojson/Maharlika.json";
import Pasacao from "@/assets/geojson/Pasacao.json";
import Street from "@/assets/geojson/Street.json";
import Border from "@/assets/geojson/Border.json";
import Building from "@/assets/geojson/Building.json";
import { GeoJSON, MapContainer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import type { Feature } from "geojson";
import useMapping from "@/features/api/map/useMapping";
import { Mapping } from "@/service/api/map/getMapping";
import { AddMappingModal } from "@/features/map/AddMappingModal";

import { api } from "@/service/api";
import type { Household } from "@/types/apitypes";
import ViewHouseholdModal from "@/features/households/viewHouseholdModal";

const center: LatLngExpression = [13.579126, 123.063078];

export default function Map() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: mappings } = useMapping();
  const [searchQuery, setSearchQuery] = useState("");
  const [viewHousehold, setViewHousehold] = useState<Household | null>(null);

  const building = useMemo(() => {
    if (!mappings) return Building;
    const filteredFeatures = Building.features
      .map((feature: any) => {
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
      })
      .filter((feature: any) =>
        searchQuery
          ? (feature.properties?.mapping_name ?? "")
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
          : true
      );
    return {
      ...Building,
      features: filteredFeatures,
    };
  }, [mappings, searchQuery]);

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

    layer.on("click", async () => {
      const householdId = infra.properties?.household_id;
      if (householdId) {
        try {
          const res = await fetch(`${api}/households/${householdId}`);
          if (res.ok) {
            const data = await res.json();
            const parsedData = () => {
              const member = data?.household?.residents?.map(r => ({
                ID: r.id,
                Firstname: r.firstname,
                Lastname: r.lastname,
                Role: r.role,
                Income: r.income
              }))
              const head = member?.find(r => r.Role.toLowerCase() === "head")
              return {
                id: data?.household.id,
                household_number: data?.household?.household_number,
                type: data?.household?.type,
                member,
                head: head ? `${head.Firstname} ${head.Lastname}` : "N/A",
                zone: data?.household?.zone,
                date: new Date(data?.household?.date_of_residency),
                status: data?.household?.status,
              }
            }
            setViewHousehold(parsedData);
          } else {
            setSelectedFeature(infra);
            setDialogOpen(true);
          }
        } catch (err) {
          console.error(err);
          setSelectedFeature(infra);
          setDialogOpen(true);
        }
      } else {
        setSelectedFeature(infra);
        setDialogOpen(true);
      }
    });
  };

  return (
    <div className="relative w-[85vw] h-[80vh] border-1 p-10 rounded-2xl overflow-hidden shadow-md mx-auto">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-[300px]">
        <Input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search mapping name..."
          className="border rounded px-3 py-2 w-full shadow-lg bg-white"
        />
        {searchQuery && (
          <div className="mt-1 border bg-white shadow rounded">
            {mappings?.mappings
              .filter((m: Mapping) =>
                m.MappingName.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .slice(0, 5)
              .map((m: Mapping) => (
                <div
                  key={m.ID}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    setSearchQuery(m.MappingName);
                  }}
                >
                  {m.MappingName}
                </div>
              ))}
          </div>
        )}
      </div>
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
      {viewHousehold && (
        <ViewHouseholdModal
          household={viewHousehold}
          open={!!viewHousehold}
          onClose={() => setViewHousehold(null)}
        />
      )}
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
