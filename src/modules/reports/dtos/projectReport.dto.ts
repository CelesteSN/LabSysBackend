type ProjectReportDto = {
  projectId: string;
  projectName: string;
  projectStatus: string;
  dateStart: string;
  dateEnd: string;
  progress: {
    totalTasks: number;
    completedTasks: number;
    percentage: number;
  };
  delayedTasksCount: number;
  participation: {
    name: string;
    count: number;
  }[];
  taskDistribution: {
    name: string;
    tasksByStatus: Record<string, number>;
  }[];
  delayedByStage: {
    user: string;
    stage: string;
    delayedCount: number;
  }[];
};
