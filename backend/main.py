
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import csv
import datetime
import os
import base64
import io
import tempfile
import re
import fitz  # PyMuPDF
from collections import defaultdict, Counter
from statistics import mean
from typing import List, Optional, Dict, Any
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# PhonePe parsing constants and patterns
START_OF_RECORD_MARKER = re.compile(r'^[A-Z][a-z][a-z]\s\d{2},\s20\d{2}$')

app = FastAPI(title="Statement Parser Backend", version="1.0.0")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PDFProcessRequest(BaseModel):
    pdf_data: str  # Base64 encoded PDF data URI

class PhonePeTxn:
    """PhonePe transaction data structure"""
    def __init__(self, date, time, payee, txn_id, utr_no, payer, kind, amount):
        self.date = date
        self.time = time
        self.payee = payee
        self.txn_id = txn_id
        self.utr_no = utr_no
        self.payer = payer
        self.kind = kind
        self.amount = amount

    def to_row(self):
        return [self.date, self.time, self.payee, self.txn_id, self.utr_no, self.payer, self.kind, self.amount]

class Transaction:
    """Transaction data structure matching your export function"""
    def __init__(self, date: str, time: str, amount: str, kind: str, payee: str, 
                 category: str = "", note: str = ""):
        self.date = date
        self.time = time
        self.amount = amount
        self.kind = kind  # "DEBIT" or "CREDIT"
        self.payee = payee
        self.category = category
        self.note = note

def export_for_cashew(txns: List[Transaction], payee_category_map: Optional[Dict[str, str]] = None) -> str:
    """
    Convert transactions to CSV format for Cashew app
    Returns CSV content as string
    """
    payee_category_map = payee_category_map or {}
    
    # Create CSV content in memory
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Date", "Amount", "Category", "Title", "Note", "Account"])
    
    for txn in txns:
        try:
            # Parse date and time
            dt = datetime.datetime.strptime(f"{txn.date} {txn.time}", "%Y-%m-%d %I:%M %p")
            formatted_date = dt.strftime("%d-%m-%Y %H:%M")
            
            # Process amount
            amount = float(txn.amount.replace("₹", "").replace(",", ""))
            if txn.kind == "DEBIT":
                amount = -amount # Make amount negative for debits
            
            # Determine category
            category = ""
            if txn.payee in payee_category_map:
                category = payee_category_map[txn.payee]
            elif hasattr(txn, 'category') and txn.category:
                category = txn.category
            
            # Determine title
            title = txn.payee or ("Received" if txn.kind == "CREDIT" else "Paid")
            
            # Get note
            note = getattr(txn, 'note', "") if hasattr(txn, 'note') else ""
            
            writer.writerow([formatted_date, amount, category, title, note, ""])
            
        except Exception as e:
            logger.error(f"Error processing transaction: {e}")
            continue
    
    csv_content = output.getvalue()
    output.close()
    return csv_content

def extract_text_from_pdf_bytes(pdf_content: bytes, password: str = None) -> str:
    """Extract text from PDF bytes using PyMuPDF"""
    try:
        with fitz.open(stream=pdf_content, filetype="pdf") as doc:
            if doc.needs_pass:
                if not password or not doc.authenticate(password):
                    raise RuntimeError("Password required or incorrect password.")
            text = ""
            for page in doc:
                text += page.get_text()
            return text
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
        raise e

def parse_phonepe_transactions(text: str) -> List[PhonePeTxn]:
    """Parse PhonePe transactions from extracted text"""
    lines = text.strip().split('\n')
    records = []
    rec = []
    txns = []

    for l in lines:
        if START_OF_RECORD_MARKER.match(l):
            if rec:
                txn = try_all_parsers(rec)
                if txn:
                    txns.append(txn)
            rec = [l]
        else:
            rec.append(l)

    if rec:
        txn = try_all_parsers(rec)
        if txn:
            txns.append(txn)

    return txns

def try_all_parsers(rec):
    """Try all available parsers for a record"""
    for parser in [mk_record_v1, mk_record_v2]:
        txn = parser(rec)
        if txn:
            return txn
    return None

def mk_record_v1(r):
    """Parse PhonePe transaction format v1"""
    try:
        if len(r) < 8:
            return None
        # Check if r[2] is a known kind and r[3] starts with ₹ or is numeric
        if not r[3].lstrip().startswith("₹") and not r[3].replace(",", "").strip().replace(".", "").isdigit():
            return None
        dt = datetime.datetime.strptime(r[0] + " " + r[1], "%b %d, %Y %I:%M %p")
        kind = r[2].strip()
        amount_str = "₹" + r[3].replace("₹", "").replace(",", "").strip()
        payee = r[4].strip()
        txn_id = r[5].split()[-1] if len(r) > 5 else ""
        utr_no = "\t" + r[6].split()[-1] if len(r) > 6 else ""
        payer = r[8] if len(r) > 8 else ""
        return PhonePeTxn(
            date=dt.strftime("%Y-%m-%d"),
            time=dt.strftime("%I:%M %p"),
            payee=payee,
            txn_id=txn_id,
            utr_no=utr_no,
            payer=payer,
            kind=kind,
            amount=amount_str
        )
    except Exception:
        return None

def mk_record_v2(r):
    """Parse PhonePe transaction format v2"""
    try:
        if len(r) < 8:
            return None
        if not any(keyword in r[2] for keyword in ["Paid to", "Received from", "Refund", "Payment to"]):
            return None

        dt = datetime.datetime.strptime(r[0] + " " + r[1], "%b %d, %Y %I:%M %p")
        payee = r[2].strip()
        txn_id = r[3].split()[-1]
        utr_no = "\t" + r[4].split()[-1]
        payer = r[5].strip()
        kind = r[6].strip()
        amount_line = r[8].strip() if len(r) > 8 and r[7].strip().endswith("INR") else r[7].strip()
        match = re.search(r'[\d,]+(?:\.\d+)?', amount_line)
        amount_val = float(match.group().replace(',', '')) if match else 0.0
        amount_str = f"₹{amount_val:.2f}"

        return PhonePeTxn(
            date=dt.strftime("%Y-%m-%d"),
            time=dt.strftime("%I:%M %p"),
            payee=payee,
            txn_id=txn_id,
            utr_no=utr_no,
            payer=payer,
            kind=kind,
            amount=amount_str
        )
    except Exception:
        return None

def convert_phonepe_to_transactions(phonepe_txns: List[PhonePeTxn]) -> List[Transaction]:
    """Convert PhonePeTxn objects to Transaction objects for CSV export"""
    transactions = []
    
    for txn in phonepe_txns:
        # Map PhonePe transaction types to DEBIT/CREDIT
        kind = "DEBIT"  # Default assumption
        
        # Determine transaction type based on PhonePe kind or payee description
        if txn.kind.lower() in ["credit", "received", "refund"]:
            kind = "CREDIT"
        elif "received from" in txn.payee.lower() or "refund" in txn.payee.lower():
            kind = "CREDIT"
        elif txn.kind.lower() in ["debit", "paid"]:
            kind = "DEBIT"
        elif "paid to" in txn.payee.lower() or "payment to" in txn.payee.lower():
            kind = "DEBIT"
        
        # Create Transaction object
        transaction = Transaction(
            date=txn.date,
            time=txn.time,
            amount=txn.amount,
            kind=kind,
            payee=txn.payee,
            category="",  # Will be determined by AI
            note=f"TxnID: {txn.txn_id}, UTR: {txn.utr_no.strip()}" if txn.txn_id else ""
        )
        
        transactions.append(transaction)
    
    return transactions

def parse_pdf_statement(pdf_content: bytes) -> List[Transaction]:
    """
    Main function to parse PDF statement and return transactions
    This was the missing function causing the error!
    """
    try:
        # Extract text from PDF
        text = extract_text_from_pdf_bytes(pdf_content)
        logger.info(f"Extracted text length: {len(text)} characters")
        
        # Parse PhonePe transactions from text
        phonepe_txns = parse_phonepe_transactions(text)
        logger.info(f"Parsed {len(phonepe_txns)} PhonePe transactions")
        
        # Convert to Transaction objects
        transactions = convert_phonepe_to_transactions(phonepe_txns)
        logger.info(f"Converted to {len(transactions)} Transaction objects")
        
        return transactions
        
    except Exception as e:
        logger.error(f"Error in parse_pdf_statement: {e}")
        # Try generic text parsing if PhonePe parsing fails
        try:
            text = extract_text_from_pdf_bytes(pdf_content)
            # Add generic parsing logic here if needed
            return []
        except Exception as e2:
            logger.error(f"Error in fallback parsing: {e2}")
            raise e2

@app.post("/process-statement")
async def process_statement(request: PDFProcessRequest):
    """
    Process PDF statement and return CSV data
    """
    try:
        # Decode base64 PDF data
        if not request.pdf_data.startswith("data:application/pdf;base64,"):
            raise HTTPException(status_code=400, detail="Invalid PDF data URI format")
        
        base64_data = request.pdf_data.split(",")[1]
        pdf_content = base64.b64decode(base64_data)
        
        logger.info(f"Received PDF data, size: {len(pdf_content)} bytes")
        
        # Parse PDF and extract transactions
        transactions = parse_pdf_statement(pdf_content)
        
        if not transactions:
            logger.warning("No transactions found in PDF")
            return {"csv_content": "", "transaction_count": 0}
        
        # Convert to CSV format
        csv_content = export_for_cashew(transactions)
        
        logger.info(f"Successfully processed {len(transactions)} transactions")
        
        return {
            "csv_content": csv_content,
            "transaction_count": len(transactions),
            "message": f"Successfully processed {len(transactions)} transactions"
        }
        
    except Exception as e:
        logger.error(f"Error processing statement: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing statement: {str(e)}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Statement parser backend is running"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
