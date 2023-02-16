import { useRef, useEffect } from 'react';
import {Typography} from '@mui/material';
import WebViewer from '@pdftron/webviewer';

function ReviewDoc() {

  const viewerDiv = useRef<HTMLDivElement>(null)

  // returns an array of annotation summary objects. The summary object only pulls data that the backend needs.
  function listAnnotations(annotationManger: any, documentViewer: any, PDFNet: any) {
    let arr: any[] = []
    annotationManger.getAnnotationsList().forEach(async (annot: any) => {
      arr.push({
        elementName: annot.elementName, 
        author: annot.Author, 
        subject: annot.Subject, 
        contents: annot.getContents()
      })
    });
    return arr
  }

  // The function is passed an annotation summary array and adds the highlighted text to each summary object
  async function readTextUnderAnnotations(PDFNet: any, documentViewer: any, annotationManager: any, annot_arr: any) {
    await PDFNet.initialize();
    const doc = await documentViewer.getDocument().getPDFDoc();

    // export annotations from the document
    const annots = await annotationManager.exportAnnotations();
    let annot_count = annot_arr.length

    // Run PDFNet methods with memory management
    await PDFNet.runWithCleanup(async () => {
      // lock the document before a write operation
      // runWithCleanup will auto unlock when complete
      doc.lock();

      // import annotations to PDFNet
      const fdf_doc = await PDFNet.FDFDoc.createFromXFDF(annots);
      await doc.fdfUpdate(fdf_doc);

      const page = await doc.getPage(1);
      const rect = await page.getCropBox();

      for( let i = 0; i < annot_count; i++ ) {
        const annotation = await page.getAnnot(i);
        const te = await PDFNet.TextExtractor.create();
        te.begin(page, rect);
        const textData = await te.getTextUnderAnnot(annotation);
        annot_arr[i].text = textData 
        console.log(annot_arr[i]);
      }
    })
  }

  useEffect(() => {
    WebViewer({
      path: 'lib',
      initialDoc: require("../../assets/pdfs/annotated_doc.pdf"),
      fullAPI: true
    }, viewerDiv.current as HTMLDivElement)
    .then ( async instance => {
      const { documentViewer, PDFNet, annotationManager, Annotations, SaveOptions } = instance.Core;

      // Add header button that will programatically read highlight annotations
      instance.UI.setHeaderItems(header => {
        header.push({
            type: 'actionButton',
            img: require("../../assets/images/logo-stacked.png"),
            onClick: async () => {
              const doc = documentViewer.getDocument();

              let annot_arr = listAnnotations(annotationManager, documentViewer, PDFNet)
              readTextUnderAnnotations(PDFNet, documentViewer, annotationManager, annot_arr) 
            }
        });

        const { Feature } = instance.UI;
        instance.UI.enableFeatures([Feature.FilePicker]);
      });
    })
  }, [])

  return (
    <Typography variant='h2' gutterBottom>
      Review Document
      <div className="webviewer" ref={viewerDiv}></div>
    </Typography>
  );
}

export default ReviewDoc;
