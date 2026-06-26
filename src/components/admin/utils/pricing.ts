export const getProjectPhases = (proj: any) => {
  if (!proj) return [];
  const phases: any[] = [];
  
  phases.push({
    id: 'primary',
    title: 'Phase 1',
    budgetLines: proj.budgetLines || [],
    customServices: proj.customServices || [],
    discountPercent: proj.discountPercent || "0",
    applyVat: proj.applyVat !== false,
    vatPercent: proj.vatPercent !== undefined ? proj.vatPercent : "23",
    paidStatus: proj.paidStatus || "Pending",
    price: proj.price || ""
  });

  const hasSec = (proj.secondaryBudgetLines && proj.secondaryBudgetLines.length > 0) || 
                 (proj.secondaryCustomServices && proj.secondaryCustomServices.length > 0) || 
                 proj.secondaryPrice || 
                 proj.hasSecondaryPhase;
                 
  if (hasSec) {
    phases.push({
      id: 'secondary',
      title: 'Phase 2',
      budgetLines: proj.secondaryBudgetLines || [],
      customServices: proj.secondaryCustomServices || [],
      discountPercent: proj.secondaryDiscountPercent || "0",
      applyVat: proj.secondaryApplyVat !== false,
      vatPercent: proj.secondaryVatPercent !== undefined ? proj.secondaryVatPercent : "23",
      paidStatus: proj.secondaryPaidStatus || "Pending",
      price: proj.secondaryPrice || ""
    });
  }

  if (proj.additionalPhases && Array.isArray(proj.additionalPhases)) {
    proj.additionalPhases.forEach((phase: any, index: number) => {
      phases.push({
        id: `phase_${index}`,
        title: phase.title || `Phase ${index + 3}`,
        budgetLines: phase.budgetLines || [],
        customServices: phase.customServices || [],
        discountPercent: phase.discountPercent || "0",
        applyVat: phase.applyVat !== false,
        vatPercent: phase.vatPercent !== undefined ? phase.vatPercent : "23",
        paidStatus: phase.paidStatus || "Pending",
        price: phase.price || ""
      });
    });
  }

  return phases;
};

export const updateProjectPhase = (proj: any, phaseId: string, updates: any) => {
  if (!proj) return proj;
  const newProj = { ...proj };
  
  if (phaseId === 'primary') {
    if (updates.budgetLines !== undefined) newProj.budgetLines = updates.budgetLines;
    if (updates.customServices !== undefined) newProj.customServices = updates.customServices;
    if (updates.discountPercent !== undefined) newProj.discountPercent = updates.discountPercent;
    if (updates.applyVat !== undefined) newProj.applyVat = updates.applyVat;
    if (updates.vatPercent !== undefined) newProj.vatPercent = updates.vatPercent;
    if (updates.paidStatus !== undefined) newProj.paidStatus = updates.paidStatus;
    if (updates.price !== undefined) newProj.price = updates.price;
  } else if (phaseId === 'secondary') {
    newProj.hasSecondaryPhase = true;
    if (updates.budgetLines !== undefined) newProj.secondaryBudgetLines = updates.budgetLines;
    if (updates.customServices !== undefined) newProj.secondaryCustomServices = updates.customServices;
    if (updates.discountPercent !== undefined) newProj.secondaryDiscountPercent = updates.discountPercent;
    if (updates.applyVat !== undefined) newProj.secondaryApplyVat = updates.applyVat;
    if (updates.vatPercent !== undefined) newProj.secondaryVatPercent = updates.vatPercent;
    if (updates.paidStatus !== undefined) newProj.secondaryPaidStatus = updates.secondaryPaidStatus !== undefined ? updates.secondaryPaidStatus : updates.paidStatus;
    if (updates.price !== undefined) newProj.secondaryPrice = updates.price;
  } else if (phaseId.startsWith('phase_')) {
    const idx = parseInt(phaseId.split('_')[1], 10);
    const api = [...(newProj.additionalPhases || [])];
    if (api[idx]) {
      api[idx] = {
        ...api[idx],
        ...updates
      };
      newProj.additionalPhases = api;
    }
  }
  return newProj;
};

export const updateEstimatorActivePhaseFields = (proj: any, adminEstimatorMode: string, updates: any) => {
  if (!proj) return proj;
  const newProj = { ...proj };
  const phaseId = adminEstimatorMode;
  
  if (phaseId === 'primary') {
    if (updates.discountPercent !== undefined) newProj.discountPercent = updates.discountPercent;
    if (updates.applyVat !== undefined) newProj.applyVat = updates.applyVat;
    if (updates.vatPercent !== undefined) newProj.vatPercent = updates.vatPercent;
  } else if (phaseId === 'secondary') {
    if (updates.discountPercent !== undefined) newProj.secondaryDiscountPercent = updates.discountPercent;
    if (updates.applyVat !== undefined) newProj.secondaryApplyVat = updates.applyVat;
    if (updates.vatPercent !== undefined) newProj.secondaryVatPercent = updates.vatPercent;
  } else if (phaseId.startsWith('phase_')) {
    const idx = parseInt(phaseId.split('_')[1], 10);
    const api = [...(newProj.additionalPhases || [])];
    if (api[idx]) {
      api[idx] = {
        ...api[idx],
        ...updates
      };
      newProj.additionalPhases = api;
    }
  }
  return newProj;
};
