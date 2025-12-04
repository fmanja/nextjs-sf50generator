"use client";

import React from "react";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 20,
    borderBottom: "2 solid #000",
    paddingBottom: 10,
  },
  title: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 10,
    textAlign: "center",
    marginBottom: 10,
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: "row",
    marginBottom: 8,
    borderBottom: "1 solid #ccc",
    paddingBottom: 5,
  },
  label: {
    width: "40%",
    fontWeight: "bold",
    fontSize: 9,
  },
  value: {
    width: "60%",
    fontSize: 9,
  },
  fullRow: {
    marginBottom: 8,
    borderBottom: "1 solid #ccc",
    paddingBottom: 5,
  },
  fullLabel: {
    fontWeight: "bold",
    fontSize: 9,
    marginBottom: 3,
  },
  fullValue: {
    fontSize: 9,
  },
  remarks: {
    marginTop: 15,
    padding: 10,
    border: "1 solid #000",
    minHeight: 100,
  },
  remarksLabel: {
    fontWeight: "bold",
    marginBottom: 5,
    fontSize: 9,
  },
  remarksText: {
    fontSize: 9,
    lineHeight: 1.4,
  },
});

interface SF50DocumentProps {
  employee: {
    name: string;
    series: number;
    grade: number;
    step: number;
    salary: number;
    dutyStation: string;
  };
  recommendation: {
    noa: string;
    label: string;
    lac?: string;
    opmRemarks?: string;
    remarkCodes?: string[];
    requiredSF50Fields?: string[];
  };
  effectiveDate?: string;
  ssn?: string;
}

export const SF50Document: React.FC<SF50DocumentProps> = ({
  employee,
  recommendation,
  effectiveDate,
  ssn,
}) => {
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  return (
    <Document>
      <Page size="LETTER" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>NOTIFICATION OF PERSONNEL ACTION</Text>
          <Text style={styles.subtitle}>Standard Form 50 (SF-50)</Text>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>1. NAME (Last, First, Middle)</Text>
            <Text style={styles.value}>{employee.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>2. SOCIAL SECURITY NUMBER</Text>
            <Text style={styles.value}>{ssn || "[Entered at generation - not stored]"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>3. DATE OF BIRTH</Text>
            <Text style={styles.value}>[To be completed]</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>4. NATURE OF ACTION</Text>
            <Text style={styles.value}>
              {recommendation.noa} - {recommendation.label}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>5. EFFECTIVE DATE</Text>
            <Text style={styles.value}>
              {effectiveDate || currentDate}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>6. LEGAL AUTHORITY</Text>
            <Text style={styles.value}>{recommendation.lac || "[Not applicable]"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>7. OCCUPATIONAL SERIES</Text>
            <Text style={styles.value}>{employee.series}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>8. PAY PLAN</Text>
            <Text style={styles.value}>GS</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>9. GRADE</Text>
            <Text style={styles.value}>{employee.grade}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>10. STEP</Text>
            <Text style={styles.value}>{employee.step}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>11. ANNUAL SALARY</Text>
            <Text style={styles.value}>
              ${employee.salary.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>12. DUTY STATION</Text>
            <Text style={styles.value}>{employee.dutyStation}</Text>
          </View>

          {recommendation.remarkCodes && recommendation.remarkCodes.length > 0 && (
            <View style={styles.row}>
              <Text style={styles.label}>13. REMARK CODES</Text>
              <Text style={styles.value}>{recommendation.remarkCodes.join(", ")}</Text>
            </View>
          )}

          <View style={styles.fullRow}>
            <Text style={styles.fullLabel}>14. REMARKS</Text>
            <Text style={styles.fullValue}>
              {recommendation.opmRemarks || "[No remarks]"}
            </Text>
          </View>

          {recommendation.requiredSF50Fields && recommendation.requiredSF50Fields.length > 0 && (
            <View style={styles.fullRow}>
              <Text style={styles.fullLabel}>15. ADDITIONAL REQUIRED FIELDS</Text>
              <Text style={styles.fullValue}>
                {recommendation.requiredSF50Fields.join(", ")}
              </Text>
            </View>
          )}

          <View style={styles.remarks}>
            <Text style={styles.remarksLabel}>NOTES:</Text>
            <Text style={styles.remarksText}>
              This form was generated using AI-powered recommendations. Please verify all
              information before submission. SSN is entered at generation time and never stored.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

