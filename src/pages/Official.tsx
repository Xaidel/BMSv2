import { useState } from "react";
import Tree from "react-d3-tree";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus } from "lucide-react";
import { orgChart } from "@/types/tree";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ViewCaptainModal from "@/features/official/ViewCaptainModal";
import useOfficial from "@/features/api/official/useOfficial";

const myTreeData = [orgChart];

const badgeGroup = (
  hasChildren: boolean,
  resident_name: string,
  name: string,
  parent: string,
  setOpen: (open: boolean) => void,
  setActiveNode: (node: any) => void
) => {
  let Icon = Eye;
  let colorClass = "bg-blue-600 hover:bg-blue-700";
  let hidden = false;

  if (parent === "BNS/BHW") {
    Icon = Eye;
  } else if (
    name === "Councilors" ||
    (name.includes("Tanod") && name !== "Chief Tanod")
  ) {
    hidden = true; // nothing rendered
  } else if (
    name === "SK Chairperson" ||
    name === "Barangay Captain" ||
    name === "Chief Tanod"
  ) {
    Icon = Eye;
  } else if (hasChildren && name !== "Barangay Captain") {
    Icon = Plus;
    colorClass = "bg-green-600 hover:bg-green-700";
  }
  if (hidden) {
    return <div className="flex absolute -top-3 -right-[-13px]" />;
  }
  return (
    <Badge
      onClick={(e) => {
        e.stopPropagation();
        setActiveNode({ name, resident_name, parent });
        setOpen(true);
      }}
      className={`absolute -top-2 -right-[-13px] w-8 h-8 p-0 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-white text-center ${colorClass}`}
    >
      <Icon />
    </Badge>
  );
};

function NodeBox({
  name,
  resident_name,
  photo,
  hasChildren,
  parent,
  onClick,
  setOpen,
  setActiveNode,
}: {
  name: string;
  resident_name?: string;
  photo?: string;
  hasChildren: boolean;
  parent: string;
  onClick: () => void;
  setOpen: (open: boolean) => void;
  setActiveNode: (node: any) => void;
}) {
  const shouldShowBadge = hasChildren && name !== "Barangay Captain";
  const borderColor = !shouldShowBadge
    ? "2px solid #2F80ED"
    : "2px solid #D07F12";

  return (
    <div
      style={{
        width: 180,
        minHeight: 80,
        border: borderColor,
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
      <div>
        {badgeGroup(
          hasChildren,
          resident_name,
          name,
          parent,
          setOpen,
          setActiveNode
        )}
      </div>
    </div>
  );
}

const renderNode = ({
  nodeDatum,
  toggleNode,
  hierarchyPointNode,
  setOpen,
  setActiveNode,
}: any) => {
  const parentName = hierarchyPointNode.parent?.data?.name; // <-- parent is here

  return (
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
          hasChildren={!!nodeDatum.children?.length}
          parent={parentName} // <-- pass name string
          setOpen={setOpen}
          setActiveNode={setActiveNode}
        />
      </foreignObject>
    </g>
  );
};

export default function Official() {
  const [open, setOpen] = useState(false);
  const [activeNode, setActiveNode] = useState<any>(null);
  const { data: officials } = useOfficial()
  console.log(officials)

  return (
    <div className="">
      <h1>Barangay Org Chart</h1>
      <div id="treeWrapper" style={{ width: "100%", height: "100vh" }}>
        <Tree
          data={myTreeData}
          pathFunc="step"
          separation={{ siblings: 2, nonSiblings: 2 }}
          orientation="vertical"
          translate={{ x: 900, y: 100 }}
          renderCustomNodeElement={(props) =>
            renderNode({ ...props, setOpen, setActiveNode })
          }
          initialDepth={1}
        />
      </div>

      {/* Modal (Shadcn Dialog) */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="text-black">
          <DialogHeader className="text-black">
            <DialogTitle>{activeNode?.name}</DialogTitle>
            <DialogDescription>{`Update this ${activeNode?.name}’s information, including name, role, and other details. Save changes to keep everything up to date.`}</DialogDescription>
          </DialogHeader>
          {activeNode?.name === "Barangay Captain" && <ViewCaptainModal />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
