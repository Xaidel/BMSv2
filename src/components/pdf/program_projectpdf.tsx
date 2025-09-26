import { Document, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./Stylesheet";
import { format } from "date-fns";
import PDFHeader from "./pdfheader";
import { ProgramProject } from "@/types/apitypes";

type Props = {
  filter: string;
  programProjects: ProgramProject[];
};

export const ProgramProjectPDF = ({ filter, programProjects }: Props) => {
  return (
    <Document>
      <Page orientation="landscape" size="A4" wrap={false}>
        <View style={{ margin: "20px" }}>
          <PDFHeader/>
          <View style={{ margin: "40px" }}>
            <View style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 14 }}>{filter}</Text>
            </View>
            <View style={styles.tableRow}>
              <View style={styles.headerCell}><Text>ID</Text></View>
              <View style={styles.headerCell}><Text>Name</Text></View>
              <View style={styles.headerCell}><Text>Type</Text></View>
              <View style={styles.headerCell}><Text>Status</Text></View>
              <View style={styles.headerCell}><Text>Start Date</Text></View>
              <View style={styles.headerCell}><Text>End Date</Text></View>
              <View style={styles.headerCell}><Text>Location</Text></View>
              <View style={styles.headerCell}><Text>Project Manager</Text></View>
              <View style={styles.headerCell}><Text>Beneficiaries</Text></View>
              <View style={styles.headerCell}><Text>Budget</Text></View>
              <View style={styles.headerCell}><Text>Source of Funds</Text></View>
            </View>
            <View style={styles.table}>
              {programProjects.map((programProject, index) => (
                <View
                  style={[
                    styles.tableRow,
                    { backgroundColor: index % 2 === 0 ? "#f9f9f9" : "white" }
                  ]}
                  key={programProject.ID}
                >
                  <View style={styles.tableCell}><Text>{programProject.ID}</Text></View>
                  <View style={styles.tableCell}><Text>{programProject.Name}</Text></View>
                  <View style={styles.tableCell}><Text>{programProject.Type}</Text></View>
                  <View style={styles.tableCell}><Text>{programProject.Status}</Text></View>
                  <View style={styles.tableCell}><Text>{format(new Date(programProject.StartDate), "MMMM d, yyyy")}</Text></View>
                  <View style={styles.tableCell}><Text>{programProject.EndDate ? format(new Date(programProject.EndDate), "MMMM d, yyyy") : ""}</Text></View>
                  <View style={styles.tableCell}><Text>{programProject.Location}</Text></View>
                  <View style={styles.tableCell}><Text>{programProject.ProjectManager}</Text></View>
                  <View style={styles.tableCell}><Text>{programProject.Beneficiaries}</Text></View>
                  <View style={styles.tableCell}><Text>{programProject.Budget}</Text></View>
                  <View style={styles.tableCell}><Text>{programProject.SourceOfFunds}</Text></View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};