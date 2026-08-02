/**
 * Laboratory Safety Acknowledgment — backend
 * Stores every submission as a row in a Google Sheet and (optionally)
 * saves a PDF copy of the signature into a Drive folder.
 *
 * SETUP (one time, ~10 min):
 *  1. Create a new Google Sheet. Note its ID (the long string in its URL).
 *  2. (Optional) Create a Drive folder for PDFs. Note its folder ID.
 *  3. In the Sheet: Extensions → Apps Script. Delete any code, paste this file.
 *  4. Put your IDs in the two constants below.
 *  5. Run `setup` once (authorize when asked) to create the header row.
 *  6. Deploy → New deployment → type "Web app"
 *       - Execute as: Me
 *       - Who has access: Anyone
 *     Copy the /exec URL it gives you.
 *  7. Paste that URL into BACKEND_URL at the top of index.html.
 */

const SHEET_ID  = "PASTE_YOUR_SHEET_ID_HERE";
const PDF_FOLDER_ID = "";            // leave "" to skip PDF archiving
const TAB_NAME  = "Signatures";

function setup() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sh = ss.getSheetByName(TAB_NAME) || ss.insertSheet(TAB_NAME);
  sh.clear();
  sh.appendRow(["Timestamp","Confirmation ID","Full name","Student ID",
                "Program & year","Language","Date signed","PDF link","Signature image"]);
  sh.getRange("A1:I1").setFontWeight("bold");
  sh.setFrozenRows(1);
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);
    const sh = ss.getSheetByName(TAB_NAME) || ss.insertSheet(TAB_NAME);

    let pdfLink = "", sigLink = "";
    if (PDF_FOLDER_ID) {
      try {
        const folder = DriveApp.getFolderById(PDF_FOLDER_ID);

        // The signature goes in as its own PNG. (An <img> inside the HTML below
        // cannot reference it — Drive's HTML-to-PDF converter fetches nothing.)
        if (d.sig) {
          const b64 = d.sig.split(",")[1];
          const img = Utilities.newBlob(Utilities.base64Decode(b64), "image/png",
                        `Signature_${d.sid}_${d.cid}.png`);
          sigLink = folder.createFile(img).getUrl();
        }

        const html = `<h2>Laboratory Safety Acknowledgment</h2>
          <p><b>Name:</b> ${esc(d.name)}<br><b>Student ID:</b> ${esc(d.sid)}<br>
          <b>Program:</b> ${esc(d.prog)}<br><b>Date:</b> ${esc(d.date)}<br>
          <b>Confirmation ID:</b> ${esc(d.cid)}</p>
          <p>Signature on file: ${esc(sigLink) || "not captured"}</p>`;
        const pdf = Utilities.newBlob(html, "text/html", "a.html")
                    .getAs("application/pdf")
                    .setName(`SafetyAck_${d.sid}_${d.cid}.pdf`);
        pdfLink = folder.createFile(pdf).getUrl();
      } catch (err) { pdfLink = "PDF error: " + err; }
    }

    sh.appendRow([new Date(), d.cid, d.name, d.sid, d.prog, d.lang, d.date, pdfLink, sigLink]);
    return json({ok:true, cid:d.cid});
  } catch (err) {
    return json({ok:false, error:String(err)});
  }
}

function esc(s){return String(s||"").replace(/[<>&]/g,c=>({"<":"&lt;",">":"&gt;","&":"&amp;"}[c]));}
function json(o){return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);}
