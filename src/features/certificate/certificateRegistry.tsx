import Fourps from "./templates/4ps";
import Business from "./templates/business";
import BusinessClearance from "./templates/businessClearance";
import Clearance from "./templates/clearance";
import Indigency from "./templates/indigency";
import Residency from "./templates/residency";
import Unemployment from "./templates/unemployment";
import Birth from "./templates/birth";
import Marriage from "./templates/marriage";
import Ownership from "./templates/ownership";
import SoloParent from "./templates/soloParent";


export const CertificateRegistry: Record<string, React.ComponentType<any>> = {
  "fourps": Fourps,
  "brgy-clearance": Clearance,
  "brgy-indigency": Indigency,
  "brgy-residency": Residency,
  "brgy-business-permit": Business,
  "brgy-business-clearance": BusinessClearance,
  "cert-unemployment": Unemployment,
  "registration-birth": Birth,
  "cert-marriage": Marriage,
  "cert-ownership": Ownership,
  "cert-solo": SoloParent,
};
