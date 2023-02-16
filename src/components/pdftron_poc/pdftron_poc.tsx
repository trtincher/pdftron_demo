import React, { useRef, useEffect, useState } from 'react';
import SaveIcon from '@mui/icons-material/Save';
import WebViewer from '@pdftron/webviewer';
import fs from 'fs'
// import { useStore } from '@jmjfinancial/apis/lib';


function Pdftron() {
  // const [fields, setFields] = useState<any[]>([])
  // const { tasksService } = useStore();

  const viewerDiv = useRef<HTMLDivElement>(null)

  // Function for coverting base64 data to readable file blob
  function base64ToBlob(base64: any) {
    const binaryString = window.atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; ++i) {
      bytes[i] = binaryString.charCodeAt(i);
    }
  
    return new Blob([bytes], { type: 'application/pdf' });
  };

  async function createSignatureFields(annotationManager:any, Annotations:any) {
    const { WidgetFlags } = Annotations;

    // set flags for required
    const flags = new WidgetFlags();
    flags.set('Required', true);

    // create a form field
    const field = new Annotations.Forms.Field("some signature field name", { 
      type: 'Sig', 
      flags,
    });

    // create a widget annotation
    const widgetAnnot = new Annotations.SignatureWidgetAnnotation(field, {
      appearance: '_DEFAULT',
      appearances: {
        _DEFAULT: {
          Normal: {
            offset: {
              x: 100,
              y: 100,
            },
          },
        },
      },
    });

    // set position and size
    widgetAnnot.PageNumber = 1;
    widgetAnnot.X = 100;
    widgetAnnot.Y = 100;
    widgetAnnot.Width = 50;
    widgetAnnot.Height = 20;

    //add the form field and widget annotation
    annotationManager.getFieldManager().addField(field);
    annotationManager.addAnnotation(widgetAnnot);
    annotationManager.drawAnnotationsFromList([widgetAnnot]);

    const fields = await annotationManager.getAnnotationsList();
    const annotations = await annotationManager.getAnnotationById(fields[0].Id)
    console.log("Annotations: ", annotations.Author, annotations.Height, annotations.Width, annotations.X, annotations.Y, annotations.ToolName, annotations.ReplyType)
  }

  interface Fields {
    "topmostSubform[0].Page1[0]._1a_Security_1[0]": string,
    "topmostSubform[0].Page1[0]._1a_Security_2[0]": string,
    "topmostSubform[0].Page1[0]._1a_Security_3[0]": string,
  }

  function defineFields() {
    const field_names: Fields = {
      "topmostSubform[0].Page1[0]._1a_Security_1[0]": '123',
      "topmostSubform[0].Page1[0]._1a_Security_2[0]": '12',
      "topmostSubform[0].Page1[0]._1a_Security_3[0]": '1234'
    }

    return field_names
  }

  function fillFields(documentViewer: any, annotationManager: any) {
      // Example of Programmatically prefilling fields (for path "../../assets/images/URLA_2019_Addl_Borrower_encrypt.pdf")
      documentViewer.addEventListener('documentLoaded', () => {
        documentViewer.getAnnotationsLoadedPromise().then(() => {
          const fieldManager = annotationManager.getFieldManager();

          const field_names: any = defineFields

          // Set Values
          console.log('Setting test field values')
          for (const name in field_names) {
            let field = fieldManager.getField(name)
            let value = field_names[name as keyof Fields]
            field.setValue(value)
          }
        });
      });
  }


  function readFields(documentViewer: any, annotationManager: any) {
    const fieldManager = annotationManager.getFieldManager();

    // Read Values
    // console.log('Reading test field values')
    // for (const name in field_names) {
    //   let field = fieldManager.getField(name)
    //   let value = field.getValue()
    //   console.log(`name: ${name}, value: ${value}`)
    // }

    // let sigField = fieldManager.getField("some signature field name")
    // let sigValue = sigField.getValue()
    // console.log('sigValue', sigValue)
    const fields: any = []
    fieldManager.forEachField((field:any)=>{
      let name = field.name
      let value = field.getValue()
      fields.push(`name: ${name}, value: ${value}`)
    })
    console.log(fields)
  }

  async function simpleTextExtraction(doc:any, pageNumber: number){
    // Simple text extraction by page number
    const text = await doc.loadPageText(pageNumber);
    return text
  }

  async function xfdfStringExporter(annotationManager:any){
    // Create stringafied annotation data
    const xfdfString: string = await annotationManager.exportAnnotations();
    return xfdfString
  }

  async function createFileDateFromXFDF(doc:any, xfdfString: string){
    // Create file data from xfdfString
    const fileData = await doc.getFileData({
      // saves the document with annotations in it
      xfdfString
    });
    console.log("fileData: ", fileData)
    return fileData
  }

  function convertBlobToBase64(blob:any){
    //convert from blob to base64
    var reader = new FileReader();
    reader.readAsDataURL(blob); 
    reader.onloadend = function() {
      console.log("base64result", reader.result)
      return reader.result     
    }
  }

  function downloadPdfButton(instance:any, xfdfString:any, SaveOptions:any){
    // Code for immediate download of annotated PDF
    const options = {
      filename: 'myDocument.pdf',
      xfdfString,
      flags: SaveOptions.LINEARIZED,
      downloadType: 'pdf',
      flatten: true
    };   
    instance.UI.downloadPdf(options);
  }

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

  // async function getAttachments(){
  //   tasksService.getAttachment(
  //     document
  //   )
  // }

  useEffect(() => {
    WebViewer({
      path: 'lib',
      initialDoc: require("../../assets/pdfs/DocWithAdvancedSig.pdf"),
      fullAPI: true
    }, viewerDiv.current as HTMLDivElement)
    .then ( async instance => {
      const { documentViewer, PDFNet, annotationManager, Annotations, SaveOptions } = instance.Core;

      const getFieldNameAndValue = (field: any) => {
        // Do something with data
        const { name, value, type } = field;
        let t = field.getFieldType()
        let v = field.getValue()

        if(name === 'Mortgage Applied For') { 
          console.log('selection fires!!!!!!!!!!!!')
          field.setValue('Conventional') 
        } else {
          field.setValue(name)
        }
        console.log(`'${name}' ${type}, ${t}, '${v}'`)
   
        // Check children fields
        field.children.forEach(getFieldNameAndValue);
      }
    
      documentViewer.addEventListener('annotationsLoaded', () => {
        const fieldManager = annotationManager.getFieldManager();
        fieldManager.forEachField(getFieldNameAndValue);
        // let json = JSON.stringify(fields)
        // const blob = new Blob([json], { type: "text/plain" });
        // const url = URL.createObjectURL(blob);
        // window.open(url, '_blank')
      });

      // fillFields(documentViewer, annotationManager)
      // createSignatureFields(annotationManager, Annotations)

      // Add header button that will get file data on click
      instance.UI.setHeaderItems(header => {
        header.push({
            type: 'actionButton',
            img: require("../../assets/images/logo192.png"),
            onClick: async () => {
              const doc = documentViewer.getDocument();

              const fieldManager = annotationManager.getFieldManager();
              fieldManager.forEachField(getFieldNameAndValue);

              // let annot_arr = listAnnotations(annotationManager, documentViewer, PDFNet)
              // readTextUnderAnnotations(PDFNet, documentViewer, annotationManager, annot_arr) 

              // readFields(documentViewer, annotationManager)

              // Simple text extraction by page number
              // let text:any = await simpleTextExtraction(doc, 1)
              // console.log("text extraction output: ", text);

              // let json = JSON.stringify(fields)
              // const blob = new Blob([json], { type: "text/plain" });
              // const url = URL.createObjectURL(blob);
              // window.open(url, '_blank')
              // const link = document.createElement("a");
              // link.download = "1003FanneMaeFields.json";
              // link.href = url;
              // link.click();

              // Create and return annotation data as XFDF string
              let xfdfString: any = await xfdfStringExporter(annotationManager)
              // console.log("xfdfString: ", xfdfString)

              // // Create file data from xfdfString
              let fileData: any = await createFileDateFromXFDF(doc, xfdfString)

              // // Create Uint8array from fileData
              const arr = new Uint8Array(fileData);
              console.log("arr: ", arr)

              // // Create file data blob from Uint8Array arr
              const blob = new Blob([arr], { type: 'application/pdf' });
              console.log("blob: ", blob)

              // // Code for API call data object
              // const data = new FormData();
              // data.append("test", blob, "test.pdf")
              // console.log("Creating form data object result: ", data.getAll("test"))

              //convert from blob to base64
              let base64Data:any = await convertBlobToBase64(blob)
              console.log("base64data: ", base64Data);

              // Code for immediate download of annotated PDF
              // downloadPdfButton(instance, xfdfString, SaveOptions)
            }
        });

        const { Feature } = instance.UI;
        instance.UI.enableFeatures([Feature.FilePicker]);
      });
    })
  }, [])

  return (
    <div className="webviewer" ref={viewerDiv}></div>
  );
}

export default Pdftron;
