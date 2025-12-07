import type { QCDetail } from '@/types/qc';

type QCEnriched<T> = T & {
  status: string;
  qcFlags: string;
  qcIssues: string;
  qcFlagCount: number;
};

export function mergeWithQC<T extends Record<string, any>>(
  projectData: T[],
  qcDetails: QCDetail[]
): QCEnriched<T>[] {
  const qcMap = new Map<number, QCDetail>();
  qcDetails.forEach((qc) => {
    qcMap.set(qc.sourceRow, qc);
  });

  return projectData.map((record, index) => {
    const rowNumber = index + 2; // adjust for header row + 1-based indexing
    const qcRecord = qcMap.get(rowNumber);

    if (qcRecord) {
      return {
        ...record,
        status: qcRecord.approval,
        qcFlags: qcRecord.qcFlags,
        qcIssues: qcRecord.qcIssues,
        qcFlagCount: qcRecord.qcFlagCount,
      } as QCEnriched<T>;
    }

    return {
      ...record,
      status: 'Approved',
      qcFlags: '',
      qcIssues: '',
      qcFlagCount: 0,
    } as QCEnriched<T>;
  });
}
