import io
import csv
from typing import List
from fastapi.responses import StreamingResponse


def generate_csv_response(data: List[dict], filename: str) -> StreamingResponse:
    """Generate a StreamingResponse with CSV content from a list of dicts."""
    if not data:
        data = [{}]

    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=data[0].keys())
    writer.writeheader()
    writer.writerows(data)
    output.seek(0)

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
