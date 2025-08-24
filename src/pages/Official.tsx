import Tree from "react-d3-tree";
import Photo from "@/assets/donaldT.jpg"
import Tambo from "@/assets/Tambo.png"
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus } from "lucide-react";

const orgChart = {
  id: 1,
  name: "Barangay Captain",
  resident_name: "Donald Trump",
  photo: Photo,
  children: [
    {
      name: "Councilors",
      resident_name: "Councilor Group",
      photo: Tambo,
      children: [
        { id: 2, name: "Barangay Kagawad 1", resident_name: "John Doe", photo: Photo },
        { id: 3, name: "Barangay Kagawad 2", resident_name: "Jane Smith", photo: Photo },
        { id: 4, name: "Barangay Kagawad 3", resident_name: "Alice Lee", photo: Photo },
        { id: 5, name: "Barangay Kagawad 4", resident_name: "Bob Tan", photo: Photo },
        { id: 6, name: "Barangay Kagawad 5", resident_name: "Charlie Cruz", photo: Photo },
        { id: 7, name: "Barangay Kagawad 6", resident_name: "Diana Yu", photo: Photo },
        { id: 8, name: "Barangay Kagawad 7", resident_name: "Edward Lim", photo: Photo },
        {
          name: "SK Chairperson",
          resident_name: "Jerome Patrick Tayco",
          photo: Photo,
          children: [
            { id: 9, name: "SK Kagawad 1", resident_name: "SK1 Name", photo: Photo },
            { id: 10, name: "SK Kagawad 2", resident_name: "SK2 Name", photo: Photo },
            { id: 11, name: "SK Kagawad 3", resident_name: "SK3 Name", photo: Photo },
            { name: "SK Kagawad 4", resident_name: "SK4 Name", photo: Photo },
            { name: "SK Kagawad 5", resident_name: "SK5 Name", photo: Photo },
            { name: "SK Kagawad 6", resident_name: "SK6 Name", photo: Photo },
            { name: "SK Kagawad 7", resident_name: "SK7 Name", photo: Photo },
          ],
        },
      ],
    },
    { name: "Secretary", resident_name: "Evangelyn Diesta", photo: Photo },
    { name: "Treasurer", resident_name: "Jane Doe", photo: Photo },
    {
      name: "BNS/BHW", resident_name: "BNS/BHW Group", photo: Tambo, children: [
        {
          name: "Nurse",
          resident_name: "Joseph Durant",
          children: [
            {
              name: "BHW",
              resident_name: "Veronica Francisco"
            },
            {
              name: "BHW",
              resident_name: "Veronica Francisco"
            },
            {
              name: "BHW",
              resident_name: "Veronica Francisco"
            },
            {
              name: "BHW",
              resident_name: "Veronica Francisco"
            },
            {
              name: "BHW",
              resident_name: "Veronica Francisco"
            },
            {
              name: "BHW",
              resident_name: "Veronica Francisco"
            },
            {
              name: "BHW",
              resident_name: "Veronica Francisco"
            },
            {
              name: "BHW",
              resident_name: "Veronica Francisco"
            },
            {
              name: "BHW",
              resident_name: "Veronica Francisco"
            },
            {
              name: "BHW",
              resident_name: "Veronica Francisco"
            },
            {
              name: "BHW",
              resident_name: "Veronica Francisco"
            },
          ]
        },
      ]
    },
    {
      name: "Staff",
      resident_name: "Staff Group",
      photo: Tambo,
      children: [
        { name: "Utility/Maintenance", resident_name: "Utility Name", photo: Photo },
        { name: "Driver", resident_name: "Driver Name", photo: Photo },
      ],
    },
    {
      name: "Barangay Tanod",
      resident_name: "Tanod Group",
      photo: Tambo,
      children: [
        { name: "Tanod 1", resident_name: "Tanod 1 Name", photo: Photo },
        { name: "Tanod 2", resident_name: "Tanod 2 Name", photo: Photo },
        { name: "Tanod 3", resident_name: "Tanod 3 Name", photo: Photo },
        { name: "Tanod 4", resident_name: "Tanod 4 Name", photo: Photo },
        { name: "Tanod 5", resident_name: "Tanod 5 Name", photo: Photo },
        { name: "Tanod 6", resident_name: "Tanod 6 Name", photo: Photo },
        { name: "Tanod 7", resident_name: "Tanod 7 Name", photo: Photo },
        { name: "Tanod 8", resident_name: "Tanod 8 Name", photo: Photo },
      ],
    },
  ],
};
const myTreeData = [orgChart];

function NodeBox({
  name,
  resident_name,
  photo,
  onClick,
}: {
  name: string; // role
  resident_name?: string;
  photo?: string;
  onClick: () => void;
}) {
  const shouldShowBadge =
    resident_name.includes("Group") || name === "SK Chairperson";

  return (
    <div
      style={{
        width: 180,
        minHeight: 80,
        border: "2px solid #2F80ED",
        borderRadius: 6,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        background: "#fff",
        cursor: "pointer",
        padding: "6px",
      }}
      onClick={onClick}
    >
      {photo && (
        <img
          src={photo}
          alt={name}
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            marginBottom: 4,
            objectFit: "cover",
          }}
        />
      )}
      {resident_name && (
        <span style={{ fontWeight: 500, fontSize: 12, marginBottom: 2 }}>
          {resident_name}
        </span>
      )}
      <span style={{ fontSize: 14 }}>{name}</span>
      {shouldShowBadge ? (
        <Badge
          onClick={(e) => {
            e.stopPropagation();
          }
          }
          className="absolute bg-green-600 hover:bg-green-700 -top-2 -right-[-13px] w-8 h-8 p-0 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white text-center">
          <Plus />
        </Badge>
      ) :
        <Badge
          onClick={(e) => {
            e.stopPropagation();
          }
          }
          className="absolute bg-blue-600 hover:bg-blue-700 -top-2 -right-[-13px] w-8 h-8 p-0 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white text-center">
          <Pencil />
        </Badge>
      }
    </div >
  );
}

const renderNode = ({ nodeDatum, toggleNode }: any) => (
  <g>
    <foreignObject
      width={200}
      height={100}
      x={-100}
      y={-50}
      style={{ overflow: "visible" }}
    >
      <NodeBox
        name={nodeDatum.name}
        resident_name={nodeDatum.resident_name}
        photo={nodeDatum.photo}
        onClick={toggleNode}
      />
    </foreignObject>
  </g>
);

export default function Official() {
  return (
    <div className="App">
      <h1>Barangay Org Chart</h1>
      <div id="treeWrapper" style={{ width: "100%", height: "100vh" }}>
        <Tree
          data={myTreeData}
          pathFunc="step"
          separation={{ siblings: 2, nonSiblings: 2 }}
          orientation="vertical"
          translate={{ x: 900, y: 100 }}
          renderCustomNodeElement={renderNode}
          initialDepth={1}
        />
      </div>
    </div>
  );
}
