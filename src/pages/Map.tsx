//import Maharlika from "@/assets/geojson/Maharlika.json"
//import Pasacao from "@/assets/geojson/Pasacao.json"
import TamboRoad from "@/assets/geojson/TamboRoad.json"
import Border from "@/assets/geojson/Border.json"
import Building from "@/assets/geojson/Building.json"
import { GeoJSON, MapContainer } from "react-leaflet";
import type { LatLngExpression } from "leaflet";

const center: LatLngExpression = [13.5752, 123.0734];

export default function Map() {
  return (
    <>
      <div className="w-[85vw] h-[80vh] border-1 p-10 rounded-2xl overflow-hidden shadow-md">
        <MapContainer
          center={center}
          zoom={14}
          className="w-full h-full rounded-2xl"
        >
          <GeoJSON data={TamboRoad as any}
            style={() => ({
              color: "gray",
              fillColor: "gray",
            })}
          />
          <GeoJSON data={Border as any} style={() => ({
            fillColor: "lightgray",
            weight: 1,
            color: "black",
          })} />
          <GeoJSON data={Building as any}
            style={() => ({
              color: "green",
              weight: 1,
              fillColor: "transparent"
            })}
          />
        </MapContainer>
      </div>
    </>
  )
}
