//GET endpoint to fetch a specific question from a quiz session

export async function GET(request: Request) {
  try {
    // TODO: Implement question fetching logic
    return Response.json(
      { success: false, error: "Not implemented" },
      { status: 501 }
    );
  } catch (error) {
    return Response.json(
      { success: false, error: "Failed to fetch question" },
      { status: 500 }
    );
  }
}