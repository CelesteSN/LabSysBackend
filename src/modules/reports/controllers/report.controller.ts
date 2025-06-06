import { Request, Response } from "express";
import { parseDateRangeFromQuery,getFullProjectReport } from "../services/report.service";
import { catchAsync } from "../../../utils/catchAsync";


export const getFullReport = catchAsync(async (req: Request, res: Response) => {
  const projectId = req.params.projectId;

  const { fromDate, toDate } = parseDateRangeFromQuery(
    req.query.from as string,
    req.query.to as string
  );

  const report = await getFullProjectReport(projectId, fromDate, toDate);

  res.status(200).json({
    success: true,
    ...report
  });
});















