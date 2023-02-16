import { useRef, useEffect, useState } from "react";
import { Box } from "@mui/material";
import WebViewer, { Core, WebViewerInstance } from "@pdftron/webviewer";
import SideBar from "./SideBar";

const PDF = () => {
  const [annotationManager, setAnnotationManager] =
    useState<Core.AnnotationManager>();
  const [annotations, setAnnotations] = useState<typeof Core.Annotations>();
  const [signatureAnnotations, setSignatureAnnotations] =
    useState<Core.Annotations.Annotation[]>();
  const [annotPosition, setAnnotPosition] = useState<number>(0);
  const [signerRows, setSignerRows] = useState<
    { name: string; email: string; type: string; field: string }[]
  >([]);
  const [potentialSigners, setPotentialSigners] = useState<
    { id: number; name: string; email: string; type: string }[]
  >([]);
  const [uniqueSignFields, setUniqueSignFields] = useState<Object>({});

  // Reference Variables
  const filePicker = useRef<HTMLInputElement>(null);
  const viewerDiv = useRef<HTMLDivElement>(null);
  const instance = useRef<WebViewerInstance>();

  // Create WebViewer
  useEffect(() => {
    WebViewer(
      {
        path: "lib",
        fullAPI: true,
      },
      viewerDiv.current as HTMLDivElement
    ).then((inst) => {
      // inst = in scope instance of WebViewer
      // instance.current is the reference for out of scope use
      const { documentViewer, annotationManager, Annotations, Tools } =
        inst.Core;
      instance.current = inst;

      // this is signer stub data
      // TODO: replace with api call data
      const signers = [
        {
          id: 1,
          name: "Travis Tincher",
          email: "trtincher@email.com",
          type: "Borrower",
        },
        {
          id: 2,
          name: "Robin Tincher",
          email: "robintincher@email.com",
          type: "CoBorrower",
        },
        {
          id: 3,
          name: "Ryan Robertson",
          email: "rr@email.com",
          type: "Employee",
        },
      ];

      // Set the potential signer data state from signer api call data
      setPotentialSigners(signers);

      // Filepicker listener for file(s) upload
      const currentFilePicker = filePicker.current as HTMLInputElement;
      currentFilePicker.onchange = async (e) => {
        // files are uploaded into an object
        const files_object: FileList | {} =
          (e.target as HTMLInputElement).files || {};
        // Pull the file values into an array for iteration
        const files_array: Array<File> = Object.values(files_object);

        // use the first file in the array as base doc
        let baseDoc = await inst.Core.createDocument(files_array[0]);

        // Iterate through the rest of the files and attach them to the base doc
        files_array.forEach(async (file: File, index: number) => {
          // skip first file as it is the base doc
          if (index !== 0) {
            // Create a new document from the next file in line
            const nextDoc = await inst.Core.createDocument(file);
            // Extract the page count
            const nextDocPageCount: number = nextDoc.getPageCount();
            // Create an array of pages from the extracted page count
            const pagesToInsert = Array.from(
              Array(nextDocPageCount).keys()
            ).map((pgNum) => pgNum + 1);
            // Extract page count from base doc and add one for the index to insert
            const pageIndexToInsert = baseDoc.getPageCount() + 1;
            // Run the instertPages function to add the pages from next document into the base document.
            await baseDoc.insertPages(
              nextDoc,
              pagesToInsert,
              pageIndexToInsert
            );
          }
        });

        // load the merged documents as baseDoc into the WebViewer
        inst.UI.loadDocument(baseDoc);
      };

      // Annotations are loaded after the document is loaded and in parallel with the document being rendered.
      documentViewer.addEventListener("annotationsLoaded", () => {
        console.log("Annotations Loaded");
        // reset the current instance to insure that it is up to date
        instance.current = inst;
        // Set the annotation tools to state for use outside of the useEffect scope
        setAnnotationManager(annotationManager);
        setAnnotations(Annotations);
        // Get all signature type annotations in an array
        const signAnnots = getSignatureAnnotations(
          annotationManager,
          Annotations
        );
        // Extract all the unique signature field names into an array
        const uniqueSignatureFields: string[] =
          getUniqueSignatureFields(signAnnots);
        // Set those fields as an object
        const uniqueSignFieldsObj = Object.assign({}, uniqueSignatureFields);
        // Update and set the unique Signature fields state
        setUniqueSignFields({ ...uniqueSignFields, ...uniqueSignFieldsObj });
        // Create the table rows for pairing the signature fields with the potential signers
        const r = createSignatureRows(uniqueSignatureFields, signers);
        // Set those rows to state for use in the table component
        setSignerRows(r);
        // set the signature annotations to state for use in other functions
        setSignatureAnnotations(signAnnots);
      });
    });
  }, [filePicker]);

  // Calls the filePicker for uploading a file
  const handleUploadClick = () => {
    if (filePicker.current) {
      filePicker.current.click();
    }
  };

  // Calls update signature fields on click
  const handleUpdateSignFieldClick = (fields: { [key: number]: string }) => {
    updateSignatureFields(
      signatureAnnotations,
      annotations,
      annotationManager,
      fields
    );
  };

  // Find all Signature Annotations
  const getSignatureAnnotations = (
    annotationManager: Core.AnnotationManager,
    annotations: typeof Core.Annotations
  ) => {
    // getAnnotationsList pulls all annotations
    const allAnnots = annotationManager.getAnnotationsList();
    const signatureWidgetAnnots = allAnnots.filter(
      (annot: Core.Annotations.Annotation): boolean => {
        // insanceof allows you to filter certain kinds of annotations
        // Here we want to pull the WidgetAnnotations where the field.name includes the word "Signature"
        // this will give use a full list of WidgetAnnotations that we want to turn into full Signature annotations
        if (annot instanceof annotations.WidgetAnnotation) {
          let f = annot.getField();
          // return true if the field name indicates that this should be a signature field
          return f.name.includes("Signature");
        }
        // return false if none of the above returns true
        return false;
      }
    );
    // return the gathers list of signature Widget Annotations
    return signatureWidgetAnnots;
  };

  const getUniqueSignatureFields = (
    signatureAnnotations: Core.Annotations.Annotation[]
  ): string[] => {
    const fieldNames = signatureAnnotations.map(
      (annot: Core.Annotations.Annotation) => {
        if (annotations && annot instanceof annotations.WidgetAnnotation) {
          let field = annot.getField();
          return field.name;
        }
      }
    );

    // Set() condenses array to only unique values
    let uniqueFields = Array.from(new Set(fieldNames)) as string[];

    return uniqueFields;
  };

  // This function will insure that all signature fields are updated to full signature annotations
  const updateSignatureFields = (
    signatureAnnotations: Core.Annotations.Annotation[] | undefined,
    annotations: typeof Core.Annotations | undefined,
    annotationManager: Core.AnnotationManager | undefined,
    fields: { [key: number]: string }
  ) => {
    if (signatureAnnotations && annotations && annotationManager) {
      console.log("updateSignatureFields");
      const WidgetFlags = annotations?.WidgetFlags;
      console.log("fields", fields);
      let fieldRows = signerRows.map(
        (
          row: { name: string; email: string; type: string; field: string },
          index: number
        ) => {
          row.field = fields[index];
          return row;
        }
      );
      console.log("fieldRows", fieldRows);

      // Create new full signature annotation for each text widget with signature indicator.
      signatureAnnotations?.forEach(
        async (annot: Core.Annotations.Annotation) => {
          let original_field: Core.Annotations.Forms.Field | undefined;
          if (annot instanceof Core.Annotations.WidgetAnnotation) {
            original_field = annot.getField();
          }

          let signerRow = fieldRows.find((row) => {
            return row.field === original_field?.name;
          }) || { email: null };
          let field_name = `${signerRow.email}_${original_field?.name}`;

          // set flags for required
          let flags;
          if (WidgetFlags) {
            flags = new WidgetFlags({});
            flags.set("Required", true);
          }

          // create a form Annotations
          const field = new annotations.Forms.Field(field_name, {
            type: "Sig",
            flags,
          });

          // create a widget annotation
          const widgetAnnot = new annotations.SignatureWidgetAnnotation(field, {
            appearance: "_DEFAULT",
            appearances: {
              _DEFAULT: {
                Normal: {
                  data: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAHBhaW50Lm5ldCA0LjEuMWMqnEsAAAANSURBVBhXY/j//z8DAAj8Av6IXwbgAAAAAElFTkSuQmCC",
                  offset: {
                    x: 100,
                    y: 100,
                  },
                },
              },
            },
          });

          // set position and size
          widgetAnnot.PageNumber = annot.getPageNumber();
          widgetAnnot.X = annot.getX();
          widgetAnnot.Y = annot.getY();
          widgetAnnot.Width = annot.getWidth();
          widgetAnnot.Height = annot.getHeight();

          //add the form field and widget annotation
          annotationManager?.getFieldManager().addField(field);
          annotationManager?.addAnnotation(widgetAnnot);
          annotationManager?.drawAnnotationsFromList([widgetAnnot]);
        }
      );

      // Delete Old Signature Annotations
      annotationManager?.deleteAnnotations(signatureAnnotations);
      const newSigAnnots = getSignatureAnnotations(
        annotationManager,
        annotations
      );
      setSignatureAnnotations(newSigAnnots);
    }
  };

  // Gets Next Signature Field
  const nextField = () => {
    let annots = signatureAnnotations;
    if (annots && annots[annotPosition]) {
      annotationManager?.jumpToAnnotation(annots[annotPosition]);
      if (annots[annotPosition + 1]) {
        setAnnotPosition(annotPosition + 1);
      }
    }
  };

  // Gets Previous Signature Field
  const prevField = () => {
    let annots = signatureAnnotations;
    if (annots && annots[annotPosition]) {
      annotationManager?.jumpToAnnotation(annots[annotPosition]);
      if (annots[annotPosition - 1]) {
        setAnnotPosition(annotPosition - 1);
      }
    }
  };

  // Matches user data with signature field data
  const createSignatureRows = (
    uniqueSignatureFields: string[],
    signers: { name: string, email: string, type: string }[]
  ) => {
    const createData = (
      name: string,
      email: string,
      type: string,
      field: string
    ) => {
      return { name, email, type, field };
    };
    console.log(signers);

    const rows = uniqueSignatureFields.map((field: string, index: number) => {
      return createData(
        signers[index].name,
        signers[index].email,
        signers[index].type,
        field
      );
    });

    return rows;
  };

  return (
    <>
      <Box sx={{ display: "flex", minWidth: "1000" }}>
        {/* SideBar contains all the main UI functionality for  uploading and matching signers to signer fields*/}
        <SideBar
          handleUploadClick={handleUploadClick}
          handleUpdateSignFieldClick={handleUpdateSignFieldClick}
          nextField={nextField}
          prevField={prevField}
          uniqueSignFields={uniqueSignFields}
          potentialSigners={potentialSigners}
        />
        {/* This is the div for the PDFtron WebViewer */}
        <div className="webviewer" ref={viewerDiv}></div>
      </Box>
      {/* This is the input for uploading documents */}
      <input
        type="file"
        multiple={true}
        ref={filePicker}
        style={{ display: "none" }}
      />
    </>
  );
};

export default PDF;
