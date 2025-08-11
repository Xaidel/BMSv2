import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    width: "100%",
  },
  header: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },
  table: {
    display: "flex",
    flexDirection: "column",
  },
  headerCell: {
    border: "1px solid black",
    padding: 5,
    width: "12.5%",
    fontSize: 10,
    fontWeight: 700,
    backgroundColor: "#e0e0e0", // Light gray for contrast
    textAlign: "center",
  },
  tableRow: {
    display: "flex",
    flexDirection: "row",
  },
  tableCell: {
    border: "1px solid black",
    padding: "5px",
    width: "12.5%",
    fontSize: 10,
  }

})
