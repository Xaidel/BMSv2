import Maharlika from "@/assets/geojson/Maharlika.json"
import Pasacao from "@/assets/geojson/Pasacao.json"
import Street from "@/assets/geojson/Street.json"
import Border from "@/assets/geojson/Border.json"
import Building from "@/assets/geojson/Building.json"
import { GeoJSON, MapContainer, TileLayer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import 'leaflet/dist/leaflet.css';
import { useState } from "react"
import type { Feature } from "geojson"
import AddMappingModal from "@/features/map/AddMappingModal"

const center: LatLngExpression = [13.579126, 123.063078];

export default function Map() {
  const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const roadStyle: L.PathOptions = {
    color: "#333446",
    weight: 1,
    fillColor: "#333446",
    fillOpacity: 0.3,
    interactive: true
  }


  const borderStyle: L.PathOptions = {
    fillColor: "#FAF7F3",
    weight: 1,
    color: "black",
    interactive: true
  }

  const infraStyle: L.PathOptions = {
    color: "green",
    weight: 1,
    fillColor: "green",
    fillOpacity: 0.1,
    interactive: true
  }

  const onEachRoad = (road, layer) => {
    const roadName = road.properties.name

    layer.bindPopup(roadName, { autoPan: false })
    layer.on("mouseover", () => {
      layer.openPopup()
      layer.setStyle({
        color: "blue",
        fillColor: "blue",
        fillOpacity: 0.3,
      })
    })

    layer.on("mouseout", () => {
      layer.closePopup()
      layer.setStyle({
        color: "#333446",
        weight: 1,
        fillColor: "#333446",
        fillOpacity: 0.3,
      })
    })
  }

  const onEachInfra = (infra, layer) => {
    const id = infra.properties?.id
    const popupContent = String(id ?? 'No ID available')

    layer.bindPopup(popupContent)
    layer.on("mouseover", () => {
      layer.openPopup()
    })

    layer.on("mouseout", (e) => {
      const map = e.target._map;
      map.closePopup();
    })

    layer.on("click", () => {
      setSelectedFeature(infra)
      setDialogOpen(true)
    })

  }

  return (
    <div className="w-[85vw] h-[80vh] border-1 p-10 rounded-2xl overflow-hidden shadow-md">
      <MapContainer
        center={center}
        zoom={17}
        className="w-full h-full rounded-2xl"
        zoomAnimation={false}
        fadeAnimation={false}
      >
        <GeoJSON
          data={Border.features as any}
          style={borderStyle}
        />
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
          data={Building.features as any}
          style={infraStyle}
          onEachFeature={onEachInfra}
        />
      </MapContainer>
      <AddMappingModal
        feature={selectedFeature}
        dialogOpen={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
