import { useRef, useEffect } from 'react';
import {Typography} from '@mui/material';
import WebViewer from '@pdftron/webviewer';

function SignDocument() {
  const viewerDiv = useRef<HTMLDivElement>(null)

  async function xfdfStringExporter(annotationManager:any){
    // Create stringafied annotation data
    const xfdfString: string = await annotationManager.exportAnnotations();
    return xfdfString
  }

  function downloadPdfButton(instance:any, xfdfString:any, SaveOptions:any){
    // Code for immediate download of annotated PDF
    const options = {
      filename: 'myDocument.pdf',
      xfdfString,
      flags: SaveOptions.LINEARIZED,
      downloadType: 'pdf'
    };   
    instance.UI.downloadPdf(options);
  }

  // Find all Signature Annotations

  // Print relavent Siganture Annotation information

  // Update Sigature Annotation to Full Sign flow annotation

  useEffect(() => {
    WebViewer({
      path: 'lib',
      initialDoc: require("../../assets/pdfs/DocWithAdvancedSig.pdf"),
      fullAPI: true
    }, viewerDiv.current as HTMLDivElement)
    .then ( async instance => {
      const { documentViewer, PDFNet, annotationManager, Annotations, SaveOptions } = instance.Core;

    })
  }, [])

  return (
    <Typography variant='h2' gutterBottom>
      Sign Document
      <div className="webviewer" ref={viewerDiv}></div>
    </Typography>
  );
}

export default SignDocument;
