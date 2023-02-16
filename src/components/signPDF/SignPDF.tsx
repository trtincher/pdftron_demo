import {
  useRef,
  useEffect,
  useState,
  FC,
  ChangeEvent,
  ChangeEventHandler,
  SyntheticEvent,
} from "react";
import { Typography, Box } from "@mui/material";
import WebViewer, { Core } from "@pdftron/webviewer";
import SideBar from "./SideBar";
import { AnnotationsMap, storedAnnotationsSymbol } from "mobx/dist/internal";
import { SettingsInputCompositeOutlined } from "@mui/icons-material";
import { SignPDFTronProps } from ".";

interface SignPDFDocumentProps extends SignPDFTronProps {}

const SignPDF: FC<SignPDFDocumentProps> = () => {
  const [annotationManager, setAnnotationManager] =
    useState<Core.AnnotationManager>();
  const [signatureAnnotations, setSignatureAnnotations] = useState<
    Core.Annotations.Annotation[]
  >([]);
  const [annotPosition, setAnnotPosition] = useState<number>(0);
  const [isDocumentComplete, setIsDocumentComplete] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string>("");

  const filePicker = useRef<any>(null);
  const viewerDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    WebViewer({ path: "lib" }, viewerDiv.current as HTMLDivElement).then(
      async (instance) => {
        const { documentViewer, annotationManager, Annotations, Tools } =
          instance.Core;

        // Allows the use of initials where enabled
        instance.UI.enableFeatures([instance.UI.Feature.Initials]);

        documentViewer.addEventListener("annotationsLoaded", () => {
          console.log("Annotations Loaded");
          setAnnotationManager(annotationManager);
          const signAnnots: Core.Annotations.Annotation[] =
            getSignatureAnnotations(annotationManager, Annotations);

          // setAnnotations(Annotations);
          setSignatureAnnotations(signAnnots);
          // updateSignatureFields(signAnnots, Annotations, annotationManager);
        });

        // Hides all annotations not assigned to the current user
        annotationManager.on(
          "annotationChanged",
          (annotations, action, { imported }) => {
            if (imported && action === "add") {
              annotations.forEach((annot) => {
                if (annot instanceof Annotations.WidgetAnnotation) {
                  // If the userEmail is not equal to the user signing the doc
                  // Hide the annotations and set ReadOnly to true, and Required flag to false
                  if (!annot.fieldName.includes(userEmail)) {
                    annot.Hidden = true;
                    annot.Listable = false;
                    annot.fieldFlags.set("ReadOnly", true);
                    annot.fieldFlags.set("Required", false);
                  }
                  // Otherwise, set ReadOnly to false and Required to true
                  else if (annot.fieldName.includes(userEmail)) {
                    annot.fieldFlags.set("ReadOnly", false);
                    annot.fieldFlags.set("Required", true);
                  }
                }
              });
            }
          }
        );

        // Checks to see if a file has been selected
        filePicker.current.onchange = (e: any) => {
          const file = e.target.files[0];
          if (file) {
            // Loads the file into the viewer
            instance.UI.loadDocument(file);
          }
        };
      }
    );
  }, []);

  const submitCompletedDocument = () => {
    console.log(annotationManager?.getFieldManager().areRequiredFieldsFilled());
  };

  const handleUploadClick: Function = () => {
    console.log("handleUploadClick");
    if (filePicker.current) {
      filePicker.current.click();
    }
  };

  /**
   * Find all Signature Annotations
   * @param annotationManager
   * @param Annotations
   * @returns
   */
  const getSignatureAnnotations = (
    annotationManager: Core.AnnotationManager,
    Annotations: typeof Core.Annotations
  ): Core.Annotations.Annotation[] => {
    // getAnnotationsList pulls all annotations
    const signatureWidgetAnnots: Core.Annotations.Annotation[] =
      annotationManager
        .getAnnotationsList()
        .filter((annot: Core.Annotations.Annotation): boolean => {
          // insanceof allows you to filter certain kinds of annotations
          // Here we want to pull the WidgetAnnotations where the field.name includes the word "Signature"
          // this will give use a full list of WidgetAnnotations that we want to turn into full Signature annotations
          if (annot instanceof Annotations.WidgetAnnotation) {
            let f = annot.getField();
            // return true if the field name indicates that this should be a signature field
            return f.name.includes("Signature");
          }
          // return false if none of the above returns true
          return false;
        });
    // return the gathers list of signature Widget Annotations
    return signatureWidgetAnnots;
  };

  /**
   * Gets the next signable field in the document. If no signable fields remaining, sets isDocumentComplete boolean to true and updates the "Next Field" button to a "Complete" button
   */
  const nextField = () => {
    let annots = signatureAnnotations;
    if (annots[annotPosition]) {
      annotationManager?.jumpToAnnotation(annots[annotPosition]);
      if (annots[annotPosition + 1]) {
        setAnnotPosition(annotPosition + 1);
      }
    }
  };

  /**
   * Gets the previous signable field in a document
   */
  const prevField = () => {
    let annots = signatureAnnotations;
    if (annots[annotPosition]) {
      annotationManager?.jumpToAnnotation(annots[annotPosition]);
      if (annots[annotPosition - 1]) {
        setAnnotPosition(annotPosition - 1);
      }
    }
  };

  /**
   * Completes the signing process once all of the fields have been signed
   */
  const completeSigning = async () => {
    const xfdf = await annotationManager?.exportAnnotations({
      widgets: false,
      links: false,
    });
    console.log({ xfdf });
    // await for function to submit document to hive
    // navigate or upload the next document if there are any left
  };

  return (
    <>
      <Box sx={{ display: "flex" }}>
        <SideBar
          handleUploadClick={handleUploadClick}
          nextField={nextField}
          prevField={prevField}
          isDocumentComplete={isDocumentComplete}
          completeSigning={submitCompletedDocument}
        />
        {/* <h1>Testing.....</h1> */}
        <div className="webviewer" ref={viewerDiv}></div>
      </Box>
      <input type="file" ref={filePicker} style={{ display: "none" }} />
    </>
  );
};

export default SignPDF;
