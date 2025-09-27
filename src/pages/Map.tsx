import Maharlika from "@/assets/geojson/Maharlika.json";
import Pasacao from "@/assets/geojson/Pasacao.json";
import Street from "@/assets/geojson/Street.json";
import Border from "@/assets/geojson/Border.json";
import Building from "@/assets/geojson/Building.json";
import Zone from "@/assets/geojson/Zone.json";
import { GeoJSON, MapContainer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import { useMemo, useState } from "react";
import { AddMappingModal } from "@/features/map/AddMappingModal";
import { createPortal } from "react-dom";
import Searchbar from "@/components/ui/searchbar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import type { Feature } from "geojson";
import useMapping from "@/features/api/map/useMapping";
import { Mapping } from "@/service/api/map/getMapping";
import { api } from "@/service/api";
import type { Household } from "@/types/apitypes";
import useDeleteMapping from "@/features/api/map/useDeleteMapping";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import Filter from "@/components/ui/filter";

const center: LatLngExpression = [13.579126, 123.063078];

export default function Map() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: mappings } = useMapping();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>(""); // filter type state
  const [, setViewHousehold] = useState<Household | null>(null);
  const deleteMutation = useDeleteMapping()

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
      .filter((feature: any) => {
        // filter by search query
        const matchesSearch = searchQuery
          ? (feature.properties?.mapping_name ?? "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
          : true;
        // filter by filterType
        const typeStr = (feature.properties?.type ?? "").toLowerCase();
        if (filterType === "Household") {
          if (!typeStr.includes("household")) return false;
        } else if (filterType === "Business") {
          if (!typeStr.includes("commercial")) return false;
        } else if (filterType === "Institution") {
          if (!typeStr.includes("institutional")) return false;
        }
        return matchesSearch;
      });
    return {
      ...Building,
      features: filteredFeatures,
    };
  }, [mappings, searchQuery, filterType]);

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
    weight: 3,
    fillColor: "green",
    fillOpacity: 0.1,
    interactive: true,
  };

  const onEachRoad = (road, layer) => {
    const roadName = road.properties.name;

    layer.bindTooltip(roadName, { permanent: false, direction: "top", sticky: true });
    layer.on("mouseover", () => {
      layer.openTooltip();
      layer.setStyle({
        color: "gray",
        fillColor: "gray",
        fillOpacity: 0.3,
      });
    });

    layer.on("mouseout", () => {
      layer.closeTooltip();
      layer.setStyle({
        color: "#333446",
        weight: 1,
        fillColor: "#333446",
        fillOpacity: 0.3,
      });
    });
  };
  const queryClient = useQueryClient()
  const [deleteTarget, setDeleteTarget] = useState<{ id: number, name: string } | null>(null);
  const onEachInfra = (infra, layer) => {
    const display = infra.properties?.mapping_name;
    let popupContent = String(display ?? "Not Assigned yet.");
    if (popupContent.includes(",")) {
      const parts = popupContent.split(",").map(p => p.trim());
      if (parts.length > 1) {
        const commercial = `<div style="text-align:center;font-weight:bold;">${parts.slice(1).join(", ")}</div>`;
        const household = `<div style="text-align:center;">${parts[0]}</div>`;
        popupContent = `${commercial}<br/>${household}`;
      }
    }
    layer.bindTooltip(popupContent, { permanent: false, direction: "top", sticky: true });

    layer.on("mouseover", () => {
      layer.openTooltip();
      if (
        infra.properties?.type?.toLowerCase().includes("commercial") &&
        /Household #\s*\d+/.test(display)
      ) {
        layer.setStyle({ color: "blue", fillColor: "#66cc66" }); // commercial + household hover with light green fill
      } else if (infra.properties?.type?.toLowerCase().includes("commercial")) {
        layer.setStyle({ color: "#6699ff", fillColor: "#6699ff" }); // lighter blue
      } else if (infra.properties?.type?.toLowerCase().includes("institutional")) {
        layer.setStyle({ color: "#b266ff", fillColor: "#b266ff" }); // lighter purple
      } else if (/Household #\s*\d+/.test(display)) {
        layer.setStyle({ color: "#66cc66", fillColor: "#66cc66", weight: 3 }); // lighter green for household hover, weight 3
      } else {
        layer.setStyle({ color: "orange", fillColor: "#F59E0B" });
      }
    });

    layer.on("mouseout", () => {
      layer.closeTooltip();
      if (
        infra.properties?.type?.toLowerCase().includes("commercial") &&
        /Household #\s*\d+/.test(display)
      ) {
        layer.setStyle({
          color: "blue",
          fillColor: "green",
        });
      } else if (infra.properties?.type?.includes("Commercial") || infra.properties?.type?.includes("commercial")) {
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
      const feature = building?.features.find((b) => b.properties?.id === infra?.properties?.id)
      if (feature?.properties?.mapping_name !== undefined) {
        setDeleteTarget({
          id: feature.properties?.id,
          name: feature.properties?.mapping_name,
        });
      }

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

const onEachZone = (zone, layer) => {
  const id = zone.properties?.id || "Unknown";
  switch(id){
    case 1: layer.setStyle({color: "red", fillColor: "red", fillOpacity: 0.1}); break;
    case 2: layer.setStyle({color: "blue", fillColor: "blue", fillOpacity: 0.1}); break;
    case 3: layer.setStyle({color: "green", fillColor: "green", fillOpacity: 0.1}); break;
    case 4: layer.setStyle({color: "purple", fillColor: "purple", fillOpacity: 0.1}); break;
    case 5: layer.setStyle({color: "orange", fillColor: "orange", fillOpacity: 0.1}); break;
    case 6: layer.setStyle({color: "brown", fillColor: "brown", fillOpacity: 0.1}); break;
    case 7: layer.setStyle({color: "pink", fillColor: "pink", fillOpacity: 0.1}); break;
    default: layer.setStyle({color: "gray", fillColor: "gray", fillOpacity: 0.1}); break;
  }
  layer.bindTooltip(`Zone ${id}`, { permanent: false, direction: "top", sticky: true });
}

  return (
    <div className="relative w-[85vw] h-[80vh] border-1 p-10 rounded-2xl overflow-hidden shadow-md mx-auto">
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] w-3xl flex flex-col items-center">
        <div className="flex gap-5 w-full items-center justify-center">
          <Searchbar
            onChange={setSearchQuery}
            placeholder="Search mapping name..."
            classname="flex flex-5"
          />
          <Filter
            initial="All Buildings"
            filters={["All Buildings", "Household", "Business", "Institution"]}
            onChange={(value) => setFilterType(value === "All Buildings" ? "All" : value)}
            classname="flex-1"
          />
        </div>
        {searchQuery && (
          <div className="mt-1 border bg-white shadow rounded w-[350px]">
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
        <GeoJSON data={Zone.features as any} onEachFeature={onEachZone}/>
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
              (feature.properties?.type?.toLowerCase().includes("commercial")) &&
              /Household #\s*\d+/.test(feature?.properties?.mapping_name)
            ) {
              return { color: "blue", fillColor: "green" };
            }
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
        {/* Legend */}
        <div className="absolute top-1 right-1 bg-white p-4 rounded shadow-md text-sm">
          <h2 className="font-bold mb-2">Building Type</h2>
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'lightgreen', borderColor: 'green' }}></div>
            Household
          </div>
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'lightblue', borderColor: 'blue' }}></div>
            Commercial
          </div>
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'lightgreen', borderColor: 'blue' }}></div>
            Commercial + Household
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'plum', borderColor: 'purple' }}></div>
            Institutional
          </div>
          <div className="flex items-center mt-1">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'lightgray', borderColor: 'gray' }}></div>
            Unassigned
          </div>
          {/* Zones Legend */}
          <h2 className="font-bold mt-4 mb-2">Zones</h2>
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'red', borderColor: 'red' }}></div>
            Zone 1
          </div>
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'blue', borderColor: 'blue' }}></div>
            Zone 2
          </div>
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'green', borderColor: 'green' }}></div>
            Zone 3
          </div>
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'purple', borderColor: 'purple' }}></div>
            Zone 4
          </div>
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'orange', borderColor: 'orange' }}></div>
            Zone 5
          </div>
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'brown', borderColor: 'brown' }}></div>
            Zone 6
          </div>
          <div className="flex items-center">
            <div className="w-6 h-6 border-2 mr-2" style={{ backgroundColor: 'pink', borderColor: 'pink' }}></div>
            Zone 7
          </div>
        </div>
      <h1 className="mt-2 text-end">Tambo Land Area
        : <span className="font-bold">294.754 Hectares</span></h1>
      {deleteTarget && (
        <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
          <DialogContent className="bg-white text-black">
            <DialogHeader>
              <DialogTitle>Delete Mapping?</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete mapping: "{deleteTarget.name}"?
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-3 mt-4">
              <DialogClose asChild>
                <Button variant="ghost" className="text-black">
                  Cancel
                </Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={() => {
                  toast.promise(deleteMutation.mutateAsync(deleteTarget.id), {
                    loading: "Deleting mapping...",
                    success: () => {
                      queryClient.invalidateQueries({ queryKey: ["mappings"] });
                      setDeleteTarget(null);
                      return { message: "Mapping deleted" };
                    },
                    error: "Failed to delete mapping",
                  });
                }}
              >
                Confirm
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
      {/* AddMappingModal Portal */}
      {!selectedFeature?.properties?.mapping_name && createPortal(
        <AddMappingModal
          feature={selectedFeature}
          dialogOpen={dialogOpen}
          onOpenChange={() => {
            setDialogOpen(false);
            setSelectedFeature(null);
          }}
        />,
        document.body
      )}
    </div>
  );
}
