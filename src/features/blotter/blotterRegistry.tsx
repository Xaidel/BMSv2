
import NoticePDF from "./templates/notice";
import SummonPDF from "./templates/summon";

export const BlotterRegistry: Record<string, React.ComponentType<any>> = {
  "notice": NoticePDF,
  "summon": SummonPDF,
};
