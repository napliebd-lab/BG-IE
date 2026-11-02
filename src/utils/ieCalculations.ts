import { Operation } from '../types';

export interface IEKPIMetrics {
  totalSmv: number;
  totalOps: number;
  pitchTime: number; // in minutes
  targetHourly: number;
  theoreticalOps: number;
  maxCycleTime: number;
  lineEfficiency: number; // percentage
  balancingLoss: number; // percentage
  smoothnessIndex: number;
  bottleneckCount: number;
  machineBreakdown: Record<string, number>;
}

export function calculateIEKPIs(operations: Operation[], targetHourly: number): IEKPIMetrics {
  const totalSmv = operations.reduce((sum, op) => sum + (Number(op.smv) || 0), 0);
  const totalOps = operations.reduce((sum, op) => sum + (Number(op.ops) || 0), 0);
  
  // Pitch Time is the average cycle time per operator: Total SMV / Total Operators
  const pitchTime = totalOps > 0 ? totalSmv / totalOps : 0;
  
  // Theoretical operators needed for target output
  const theoreticalOps = totalSmv > 0 ? (totalSmv * targetHourly) / 60 : 0;

  // Workstation cycle times
  const cycleTimes = operations.map(op => {
    const ops = Number(op.ops) || 1;
    const smv = Number(op.smv) || 0;
    return ops > 0 ? smv / ops : smv;
  });

  const maxCycleTime = cycleTimes.length > 0 ? Math.max(...cycleTimes, pitchTime > 0 ? pitchTime : 0.01) : 0;

  // Industrial Engineering Line Efficiency = Total SMV / (Total Operators * Max Workstation Cycle Time) * 100
  let lineEfficiency = 0;
  if (totalOps > 0 && maxCycleTime > 0) {
    lineEfficiency = Math.min(100, Math.round((totalSmv / (totalOps * maxCycleTime)) * 100));
  }

  const balancingLoss = Math.max(0, 100 - lineEfficiency);

  // Smoothness Index: SI = sqrt(sum of (Max Cycle Time - Cycle Time)^2)
  let sumSquaredDiff = 0;
  cycleTimes.forEach(ct => {
    sumSquaredDiff += Math.pow(maxCycleTime - ct, 2);
  });
  const smoothnessIndex = Math.sqrt(sumSquaredDiff);

  // Bottlenecks are workstations where cycle time exceeds pitch time
  const bottleneckCount = cycleTimes.filter(ct => ct > (pitchTime * 1.02)).length;

  // Count machine requirement on line
  const machineBreakdown: Record<string, number> = {};
  operations.forEach(op => {
    const m = op.machine;
    machineBreakdown[m] = (machineBreakdown[m] || 0) + (Number(op.ops) || 1);
  });

  return {
    totalSmv: Number(totalSmv.toFixed(2)),
    totalOps: Number(totalOps.toFixed(1)),
    pitchTime: Number(pitchTime.toFixed(3)),
    targetHourly,
    theoreticalOps: Number(theoreticalOps.toFixed(1)),
    maxCycleTime: Number(maxCycleTime.toFixed(3)),
    lineEfficiency,
    balancingLoss,
    smoothnessIndex: Number(smoothnessIndex.toFixed(2)),
    bottleneckCount,
    machineBreakdown,
  };
}

export function calculateTimeStudyValues(
  timesInSeconds: number[],
  ratingPercent: number,
  allowancePercent: number
) {
  if (timesInSeconds.length === 0) {
    return {
      averageSeconds: 0,
      basicTimeMin: 0,
      samMinutes: 0,
      minSeconds: 0,
      maxSeconds: 0,
      stdDevSeconds: 0,
    };
  }

  const validTimes = timesInSeconds.filter(t => t > 0);
  if (validTimes.length === 0) {
    return {
      averageSeconds: 0,
      basicTimeMin: 0,
      samMinutes: 0,
      minSeconds: 0,
      maxSeconds: 0,
      stdDevSeconds: 0,
    };
  }

  const sum = validTimes.reduce((acc, t) => acc + t, 0);
  const averageSeconds = sum / validTimes.length;
  const minSeconds = Math.min(...validTimes);
  const maxSeconds = Math.max(...validTimes);

  // Standard deviation
  const variance = validTimes.reduce((acc, t) => acc + Math.pow(t - averageSeconds, 2), 0) / validTimes.length;
  const stdDevSeconds = Math.sqrt(variance);

  // Formulas:
  // Observed Time (min) = averageSeconds / 60
  // Basic Time (min) = Observed Time * (Rating / 100)
  // Standard Allowed Minute (SAM / SMV) = Basic Time * (1 + Allowance / 100)
  const observedTimeMin = averageSeconds / 60;
  const ratingFactor = ratingPercent / 100;
  const basicTimeMin = observedTimeMin * ratingFactor;
  const samMinutes = basicTimeMin * (1 + allowancePercent / 100);

  return {
    averageSeconds: Number(averageSeconds.toFixed(2)),
    basicTimeMin: Number(basicTimeMin.toFixed(3)),
    samMinutes: Number(samMinutes.toFixed(2)),
    minSeconds: Number(minSeconds.toFixed(2)),
    maxSeconds: Number(maxSeconds.toFixed(2)),
    stdDevSeconds: Number(stdDevSeconds.toFixed(2)),
  };
}

export interface BalancingSuggestion {
  opId: string;
  opSeq: number;
  opName: string;
  machine: string;
  currentSmv: number;
  currentOps: number;
  currentCycleTime: number;
  pitchTime: number;
  recommendedOps: number;
  projectedCycleTime: number;
  severity: 'critical' | 'moderate' | 'balanced';
  action: string;
}

export function generateBalancingSuggestions(
  operations: Operation[],
  pitchTime: number
): BalancingSuggestion[] {
  if (pitchTime <= 0) return [];

  const suggestions: BalancingSuggestion[] = [];

  operations.forEach((op) => {
    const ops = Number(op.ops) || 1;
    const smv = Number(op.smv) || 0;
    const cycleTime = ops > 0 ? smv / ops : smv;

    if (cycleTime > pitchTime * 1.02) {
      // It's a bottleneck
      const recOps = Math.ceil(smv / pitchTime);
      const projCycle = smv / recOps;
      const severity = cycleTime > pitchTime * 1.3 ? 'critical' : 'moderate';

      let actionText = '';
      if (recOps > ops) {
        actionText = `Add ${recOps - ops} operator(s) or allocate float helper. This drops cycle time from ${cycleTime.toFixed(2)}m to ${projCycle.toFixed(2)}m.`;
      } else {
        actionText = `De-skill operation or separate manual trimming / folder preparation to a helper.`;
      }

      suggestions.push({
        opId: op.id,
        opSeq: op.seq,
        opName: op.name,
        machine: op.machine,
        currentSmv: smv,
        currentOps: ops,
        currentCycleTime: Number(cycleTime.toFixed(2)),
        pitchTime: Number(pitchTime.toFixed(2)),
        recommendedOps: recOps,
        projectedCycleTime: Number(projCycle.toFixed(2)),
        severity,
        action: actionText,
      });
    }
  });

  return suggestions;
}
