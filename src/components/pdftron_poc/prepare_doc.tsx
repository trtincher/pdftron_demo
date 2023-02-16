import { useRef, useEffect } from 'react';
import {Typography} from '@mui/material';
import WebViewer from '@pdftron/webviewer';

function PrepareDocument() {
  const viewerDiv = useRef<HTMLDivElement>(null)

  // the xfdf string is a stingagied version of the annotations and associated meta data
  async function xfdfStringExporter(annotationManager:any){
    // Create stringafied annotation data
    const xfdfString: string = await annotationManager.exportAnnotations();
    return xfdfString
  }

  // function that allows you to download the current pdf will all annotation data included
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
  function getSignatureAnnotations(annotationManager:any, Annotations:any) {
    // getAnnotationsList pulls all annotations
    const signatureWidgetAnnots: any = annotationManager.getAnnotationsList().filter(
      (annot: any) =>{ 
        // insanceof allows you to filter certain kinds of annotations
        // Here we want to pull the WidgetAnnotations where the field.name includes the word "Signature"
        // this will give use a full list of WidgetAnnotations that we want to turn into full Signature annotations
        if (annot instanceof Annotations.WidgetAnnotation)  {
          let f = annot.getField()
          // return true if the field name indicates that this should be a signature field
          return f.name.includes("Signature")
        }
        // return false if none of the above returns true
        return false
      }
    );
    // return the gathers list of signature Widget Annotations
    return signatureWidgetAnnots
  }

  // This function will insure that all signature fields are repsented by full signature annotations
  function updateSignatureFields(annotationManager:any, Annotations:any, Tools: any, documentViewer: any){
    const signatureAnnotations = getSignatureAnnotations(annotationManager, Annotations)

    const { WidgetFlags } = Annotations;

    // Create new full signature annotation for each text widget with signature indicator.
    signatureAnnotations.forEach( async (annot: any) => {
      let orginal_field = annot.getField()

      // set flags for required
      const flags = new WidgetFlags();
      flags.set('Required', true);

      // create a form field
      const field = new Annotations.Forms.Field("some signature field name", { 
        type: 'Sig',
        name: orginal_field.name,
        flags,
      });

      // create a widget annotation
      const widgetAnnot = new Annotations.SignatureWidgetAnnotation(field, {
        appearance: '_DEFAULT',
        appearances: {
          _DEFAULT: {
            Normal: {
              data:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuMWMqnEsAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC',
              offset: {
                x: 100,
                y: 100,
              },
            },
          },
        },
      });

      // set position and size
      widgetAnnot.PageNumber = await annot.getPageNumber();
      widgetAnnot.X = annot.getX();
      widgetAnnot.Y = annot.getY();
      widgetAnnot.Width = annot.getWidth();
      widgetAnnot.Height = annot.getHeight();

      //add the form field and widget annotation
      annotationManager.getFieldManager().addField(field);
      annotationManager.addAnnotation(widgetAnnot);
      annotationManager.drawAnnotationsFromList([widgetAnnot]);
    })

    // Delete Old Signature Annotations
    annotationManager.deleteAnnotations(signatureAnnotations)

  }

  useEffect(() => {
    WebViewer({
      path: 'lib',
      initialDoc: require("../../assets/pdfs/qc_1003_final.pdf"),
      fullAPI: true
    }, viewerDiv.current as HTMLDivElement)
    .then ( async instance => {
      const { documentViewer, PDFNet, annotationManager, Annotations, SaveOptions, Tools } = instance.Core;
      instance.UI.setHeaderItems(header => {
        // Add header button that will replace signature text form fields with actually signature fields on click
        header.push({
          type: 'actionButton',
          img: require("../../assets/images/logo-stacked.png"),
          onClick: async () => {
            const doc = documentViewer.getDocument();
            updateSignatureFields(annotationManager, Annotations, Tools, documentViewer)
          }
        });

        const { Feature } = instance.UI;
        instance.UI.enableFeatures([Feature.FilePicker]);
      });
    })
  }, [])

  return (
    <Typography variant='h2' gutterBottom>
      Prepare Document
      <div className="webviewer" ref={viewerDiv}></div>
    </Typography>
  );
}

export default PrepareDocument;
