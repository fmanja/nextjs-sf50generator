"use client";

import React from "react";
import dynamic from "next/dynamic";

const PDFViewer = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFViewer),
  { ssr: false }
);

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  { ssr: false }
);

interface PDFViewerWrapperProps {
  document: React.ReactElement;
  fileName?: string;
  showDownload?: boolean;
}

export function PDFViewerWrapper({ document, fileName, showDownload = true }: PDFViewerWrapperProps) {
  return (
    <div className="h-full w-full">
      <PDFViewer width="100%" height="100%">
        {document}
      </PDFViewer>
    </div>
  );
}

export { PDFDownloadLink };

