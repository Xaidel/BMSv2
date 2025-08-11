import Fourps from "./4ps";
import Business from "./business";
import Clearance from "./clearance";
import Indigency from "./indigency";
import Residency from "./residency";
import Unemployment from "./unemployment";
import Birth from "./birth";
import Marriage from "./marriage";
import Ownership from "./ownership";


export const CertificateRegistry: Record<string, React.ComponentType<any>> = {
  "fourps": Fourps,
  "brgy-clearance": Clearance,
  "brgy-indigency": Indigency,
  "brgy-residency": Residency,
  "brgy-business-permit": Business,
  "cert-unemployment": Unemployment,
  "registration-birth": Birth,
  "cert-marriage": Marriage,
  "cert-ownership": Ownership,
};
