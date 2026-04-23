import React, { useState, useEffect, useMemo } from 'react';
import { Home, Building2, Layers, GitCompare, Save, Trash2, FolderOpen, Plus, X, TrendingUp, TrendingDown, FileText } from 'lucide-react';

// ============================================================
// ACOSTA BRAND TOKENS
// Navy #434A60 | Slate #9AAAB1 | Cream #E8E5DE | Charcoal #383736
// Display: Cormorant Garamond (Caslon alternative) | Body: Open Sans | Mono: JetBrains Mono
// ============================================================
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&family=Open+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

    .font-display { font-family: 'Cormorant Garamond', 'Adobe Caslon Pro', Georgia, serif; }
    .font-body { font-family: 'Open Sans', system-ui, sans-serif; }
    .font-mono { font-family: 'JetBrains Mono', monospace; }

    .bg-cream { background-color: #E8E5DE; }
    .bg-cream-light { background-color: #F3F1EC; }
    .bg-cream-dark { background-color: #D8D3C8; }
    .bg-navy { background-color: #434A60; }
    .bg-navy-dark { background-color: #353A4D; }
    .bg-slate-blue { background-color: #9AAAB1; }
    .bg-slate-soft { background-color: #D4DCE0; }
    .bg-charcoal { background-color: #383736; }
    .bg-white-pure { background-color: #FFFFFF; }

    .text-navy { color: #434A60; }
    .text-slate-blue { color: #9AAAB1; }
    .text-charcoal { color: #383736; }
    .text-charcoal-soft { color: #5C5B5A; }
    .text-charcoal-muted { color: #8A8987; }
    .text-cream { color: #E8E5DE; }
    .text-positive { color: #4A6B52; }
    .text-negative { color: #8B3A3A; }

    .border-navy { border-color: #434A60; }
    .border-slate { border-color: #9AAAB1; }
    .border-slate-soft { border-color: #C4CCD0; }
    .border-cream-dark { border-color: #D8D3C8; }

    input[type="number"]::-webkit-outer-spin-button,
    input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
    input[type="number"] { -moz-appearance: textfield; }

    .metric-enter { animation: fadeUp 0.35s ease-out; }
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(3px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .display-italic { font-style: italic; font-weight: 500; }

    .paper-bg {
      background-color: #E8E5DE;
      background-image: radial-gradient(circle at 20% 30%, rgba(67, 74, 96, 0.03) 0%, transparent 40%),
                        radial-gradient(circle at 80% 70%, rgba(56, 55, 54, 0.02) 0%, transparent 40%);
    }
  `}</style>
);

const fmtMoney = (n, decimals = 0) => {
  if (n === null || n === undefined || isNaN(n)) return '—';
  const neg = n < 0;
  const abs = Math.abs(n);
  const formatted = abs.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return neg ? `-$${formatted}` : `$${formatted}`;
};
const fmtPct = (n, decimals = 2) => {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return '—';
  return `${(n * 100).toFixed(decimals)}%`;
};
const fmtNum = (n, decimals = 2) => {
  if (n === null || n === undefined || isNaN(n) || !isFinite(n)) return '—';
  return n.toFixed(decimals);
};

const pmt = (principal, annualRate, years) => {
  if (principal <= 0 || years <= 0) return 0;
  if (annualRate === 0) return principal / (years * 12);
  const r = annualRate / 12;
  const n = years * 12;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
};

const NumberInput = ({ label, value, onChange, prefix, suffix, hint, step = 1 }) => (
  <label className="block">
    <div className="flex items-baseline justify-between mb-1.5">
      <span className="text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-soft">{label}</span>
      {hint && <span className="text-[10px] font-body italic text-charcoal-muted">{hint}</span>}
    </div>
    <div className="relative flex items-center border border-slate-soft bg-white-pure rounded focus-within:border-navy focus-within:shadow-sm transition-all">
      {prefix && <span className="pl-3 pr-1 font-mono text-sm text-charcoal-muted">{prefix}</span>}
      <input
        type="number"
        value={value === 0 ? '' : value}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        step={step}
        placeholder="0"
        className={`w-full py-2.5 ${prefix ? 'pl-0' : 'pl-3'} ${suffix ? 'pr-1' : 'pr-3'} bg-transparent font-mono text-sm text-charcoal outline-none`}
      />
      {suffix && <span className="pr-3 pl-1 font-mono text-sm text-charcoal-muted">{suffix}</span>}
    </div>
  </label>
);

const Output = ({ label, value, emphasis, status, sublabel }) => {
  const colorClass =
    status === 'positive' ? 'text-positive' :
    status === 'negative' ? 'text-negative' :
    emphasis ? 'text-navy' : 'text-charcoal';
  const sizeClass = emphasis ? 'text-3xl font-display display-italic' : 'text-base font-mono';
  return (
    <div className="metric-enter flex items-baseline justify-between py-2.5 border-b border-cream-dark last:border-b-0">
      <div className="flex flex-col">
        <span className={`text-[10px] font-body font-semibold uppercase tracking-[0.12em] ${emphasis ? 'text-charcoal' : 'text-charcoal-soft'}`}>
          {label}
        </span>
        {sublabel && <span className="text-[10px] font-body italic text-charcoal-muted mt-0.5">{sublabel}</span>}
      </div>
      <span className={`${sizeClass} ${colorClass} tabular-nums`}>{value}</span>
    </div>
  );
};

const Section = ({ title, children, icon: Icon }) => (
  <div className="mb-7">
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate">
      {Icon && <Icon size={13} className="text-slate-blue" strokeWidth={1.5} />}
      <h3 className="text-[10px] font-body font-semibold uppercase tracking-[0.18em] text-navy">{title}</h3>
    </div>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
  </div>
);

const defaultRent = {
  purchasePrice: 0, rehab: 0, closingCosts: 0,
  grossMonthlyRent: 0, otherIncomeMonthly: 0, vacancyPct: 5,
  taxesAnnual: 0, insuranceAnnual: 0, pmPctOfEGI: 8, maintenancePctOfEGI: 5,
  reservesPerUnit: 300, units: 1, utilitiesAnnual: 0, otherOpexAnnual: 0,
  ltvPct: 75, ratePct: 7.0, amortYears: 25,
};

const calcRent = (d) => {
  const totalAcq = d.purchasePrice + d.rehab + d.closingCosts;
  const gsi = d.grossMonthlyRent * 12;
  const vacancy = gsi * (d.vacancyPct / 100);
  const egi = gsi - vacancy + d.otherIncomeMonthly * 12;
  const pmCost = egi * (d.pmPctOfEGI / 100);
  const maintCost = egi * (d.maintenancePctOfEGI / 100);
  const reserves = d.reservesPerUnit * d.units;
  const opex = d.taxesAnnual + d.insuranceAnnual + pmCost + maintCost + reserves + d.utilitiesAnnual + d.otherOpexAnnual;
  const noi = egi - opex;
  const capRate = totalAcq > 0 ? noi / totalAcq : 0;
  const loanAmt = totalAcq * (d.ltvPct / 100);
  const downPayment = totalAcq - loanAmt;
  const monthlyPmt = pmt(loanAmt, d.ratePct / 100, d.amortYears);
  const annualDebtService = monthlyPmt * 12;
  const dscr = annualDebtService > 0 ? noi / annualDebtService : 0;
  const cashFlow = noi - annualDebtService;
  const coc = downPayment > 0 ? cashFlow / downPayment : 0;
  const opexRatio = egi > 0 ? opex / egi : 0;
  return { totalAcq, gsi, vacancy, egi, opex, noi, capRate, loanAmt, downPayment, annualDebtService, dscr, cashFlow, coc, opexRatio, pmCost, maintCost, reserves };
};

const RentCalculator = ({ data, setData, results }) => {
  const up = (k) => (v) => setData({ ...data, [k]: v });
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <Section title="Acquisition" icon={Home}>
          <NumberInput label="Purchase Price" prefix="$" value={data.purchasePrice} onChange={up('purchasePrice')} step={1000} />
          <NumberInput label="Rehab / Capex" prefix="$" value={data.rehab} onChange={up('rehab')} step={1000} />
          <NumberInput label="Closing Costs" prefix="$" value={data.closingCosts} onChange={up('closingCosts')} step={500} />
          <NumberInput label="Units" value={data.units} onChange={up('units')} step={1} />
        </Section>
        <Section title="Income">
          <NumberInput label="Gross Rent (monthly)" prefix="$" value={data.grossMonthlyRent} onChange={up('grossMonthlyRent')} step={50} hint="all units" />
          <NumberInput label="Other Income (monthly)" prefix="$" value={data.otherIncomeMonthly} onChange={up('otherIncomeMonthly')} step={25} hint="laundry, parking" />
          <NumberInput label="Vacancy" suffix="%" value={data.vacancyPct} onChange={up('vacancyPct')} step={0.5} />
        </Section>
        <Section title="Operating Expenses">
          <NumberInput label="Property Taxes (annual)" prefix="$" value={data.taxesAnnual} onChange={up('taxesAnnual')} step={100} />
          <NumberInput label="Insurance (annual)" prefix="$" value={data.insuranceAnnual} onChange={up('insuranceAnnual')} step={100} />
          <NumberInput label="Property Mgmt" suffix="% of EGI" value={data.pmPctOfEGI} onChange={up('pmPctOfEGI')} step={0.5} />
          <NumberInput label="Maintenance" suffix="% of EGI" value={data.maintenancePctOfEGI} onChange={up('maintenancePctOfEGI')} step={0.5} />
          <NumberInput label="Reserves" prefix="$" suffix="/unit/yr" value={data.reservesPerUnit} onChange={up('reservesPerUnit')} step={50} />
          <NumberInput label="Utilities (annual)" prefix="$" value={data.utilitiesAnnual} onChange={up('utilitiesAnnual')} step={100} />
          <NumberInput label="Other OpEx (annual)" prefix="$" value={data.otherOpexAnnual} onChange={up('otherOpexAnnual')} step={100} />
        </Section>
        <Section title="Financing">
          <NumberInput label="LTV" suffix="%" value={data.ltvPct} onChange={up('ltvPct')} step={1} />
          <NumberInput label="Interest Rate" suffix="%" value={data.ratePct} onChange={up('ratePct')} step={0.125} />
          <NumberInput label="Amortization" suffix="years" value={data.amortYears} onChange={up('amortYears')} step={1} />
        </Section>
      </div>
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-6 bg-white-pure border border-slate-soft shadow-sm p-6 rounded">
          <div className="mb-5">
            <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Returns</div>
            <h3 className="font-display text-3xl display-italic text-navy leading-none">Year One</h3>
          </div>
          <Output label="Cap Rate" value={fmtPct(results.capRate)} emphasis status={results.capRate >= 0.07 ? 'positive' : results.capRate >= 0.05 ? undefined : 'negative'} />
          <Output label="DSCR" value={fmtNum(results.dscr)} emphasis status={results.dscr >= 1.25 ? 'positive' : results.dscr >= 1.0 ? undefined : 'negative'} />
          <Output label="Cash-on-Cash" value={fmtPct(results.coc)} emphasis status={results.coc >= 0.08 ? 'positive' : results.coc >= 0 ? undefined : 'negative'} />
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <Output label="Total Acquisition" value={fmtMoney(results.totalAcq)} />
            <Output label="Effective Gross Income" value={fmtMoney(results.egi)} />
            <Output label="Operating Expenses" value={fmtMoney(results.opex)} sublabel={`${fmtPct(results.opexRatio, 0)} of EGI`} />
            <Output label="Net Operating Income" value={fmtMoney(results.noi)} />
            <Output label="Loan Amount" value={fmtMoney(results.loanAmt)} />
            <Output label="Down Payment" value={fmtMoney(results.downPayment)} />
            <Output label="Annual Debt Service" value={fmtMoney(results.annualDebtService)} />
            <Output label="Cash Flow" value={fmtMoney(results.cashFlow)} status={results.cashFlow >= 0 ? 'positive' : 'negative'} />
          </div>
        </div>
      </div>
    </div>
  );
};

const defaultSale = {
  units: 1, landCost: 0, hardCosts: 0, softCostsPct: 20,
  financingCostsPct: 5, contingencyPct: 10, devFeePct: 0,
  salePricePerUnit: 0, saleCostsPct: 6,
};

const calcSale = (d) => {
  const softCosts = d.hardCosts * (d.softCostsPct / 100);
  const financingCosts = (d.hardCosts + softCosts) * (d.financingCostsPct / 100);
  const subtotal = d.landCost + d.hardCosts + softCosts + financingCosts;
  const contingency = subtotal * (d.contingencyPct / 100);
  const preDevFee = subtotal + contingency;
  const devFee = preDevFee * (d.devFeePct / 100);
  const tdc = preDevFee + devFee;
  const grossSale = d.salePricePerUnit * d.units;
  const saleCosts = grossSale * (d.saleCostsPct / 100);
  const netSale = grossSale - saleCosts;
  const profit = netSale - tdc;
  const margin = netSale > 0 ? profit / netSale : 0;
  const returnOnCost = tdc > 0 ? profit / tdc : 0;
  const costPerUnit = d.units > 0 ? tdc / d.units : 0;
  return { softCosts, financingCosts, contingency, devFee, tdc, grossSale, saleCosts, netSale, profit, margin, returnOnCost, costPerUnit };
};

const SaleCalculator = ({ data, setData, results }) => {
  const up = (k) => (v) => setData({ ...data, [k]: v });
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <Section title="Project" icon={Building2}>
          <NumberInput label="Units" value={data.units} onChange={up('units')} step={1} />
          <NumberInput label="Land / Acquisition" prefix="$" value={data.landCost} onChange={up('landCost')} step={1000} />
        </Section>
        <Section title="Development Costs">
          <NumberInput label="Hard Costs (total)" prefix="$" value={data.hardCosts} onChange={up('hardCosts')} step={1000} hint="construction" />
          <NumberInput label="Soft Costs" suffix="% of hard" value={data.softCostsPct} onChange={up('softCostsPct')} step={1} hint="arch, eng, legal" />
          <NumberInput label="Financing Costs" suffix="% of H+S" value={data.financingCostsPct} onChange={up('financingCostsPct')} step={0.5} hint="interest, fees" />
          <NumberInput label="Contingency" suffix="%" value={data.contingencyPct} onChange={up('contingencyPct')} step={1} />
          <NumberInput label="Developer Fee" suffix="% of TDC" value={data.devFeePct} onChange={up('devFeePct')} step={1} />
        </Section>
        <Section title="Sale">
          <NumberInput label="Sale Price (per unit)" prefix="$" value={data.salePricePerUnit} onChange={up('salePricePerUnit')} step={1000} />
          <NumberInput label="Sale Costs" suffix="%" value={data.saleCostsPct} onChange={up('saleCostsPct')} step={0.5} hint="commission, closing" />
        </Section>
      </div>
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-6 bg-white-pure border border-slate-soft shadow-sm p-6 rounded">
          <div className="mb-5">
            <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Returns</div>
            <h3 className="font-display text-3xl display-italic text-navy leading-none">Development</h3>
          </div>
          <Output label="Profit" value={fmtMoney(results.profit)} emphasis status={results.profit >= 0 ? 'positive' : 'negative'} />
          <Output label="Profit Margin" value={fmtPct(results.margin)} emphasis status={results.margin >= 0.15 ? 'positive' : results.margin >= 0.10 ? undefined : 'negative'} sublabel="Profit ÷ Net Sale" />
          <Output label="Return on Cost" value={fmtPct(results.returnOnCost)} emphasis status={results.returnOnCost >= 0.20 ? 'positive' : results.returnOnCost >= 0.10 ? undefined : 'negative'} sublabel="Profit ÷ TDC" />
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <Output label="Soft Costs" value={fmtMoney(results.softCosts)} />
            <Output label="Financing Costs" value={fmtMoney(results.financingCosts)} />
            <Output label="Contingency" value={fmtMoney(results.contingency)} />
            <Output label="Developer Fee" value={fmtMoney(results.devFee)} />
            <Output label="Total Development Cost" value={fmtMoney(results.tdc)} />
            <Output label="Cost / Unit" value={fmtMoney(results.costPerUnit)} />
            <Output label="Gross Sale" value={fmtMoney(results.grossSale)} />
            <Output label="Sale Costs" value={fmtMoney(results.saleCosts)} />
            <Output label="Net Sale Proceeds" value={fmtMoney(results.netSale)} />
          </div>
        </div>
      </div>
    </div>
  );
};

const defaultGap = {
  tdc: 0, supportableDebt: 0, developerEquity: 0,
  subsidies: [
    { id: 1, name: 'HOME Funds', amount: 0 },
    { id: 2, name: 'LIHTC Equity', amount: 0 },
  ],
};

const calcGap = (d) => {
  const subsidyTotal = d.subsidies.reduce((sum, s) => sum + (s.amount || 0), 0);
  const totalSources = d.supportableDebt + d.developerEquity + subsidyTotal;
  const gap = d.tdc - totalSources;
  const debtPct = d.tdc > 0 ? d.supportableDebt / d.tdc : 0;
  const equityPct = d.tdc > 0 ? d.developerEquity / d.tdc : 0;
  const subsidyPct = d.tdc > 0 ? subsidyTotal / d.tdc : 0;
  const gapPct = d.tdc > 0 ? gap / d.tdc : 0;
  return { subsidyTotal, totalSources, gap, debtPct, equityPct, subsidyPct, gapPct };
};

const GapCalculator = ({ data, setData, results }) => {
  const up = (k) => (v) => setData({ ...data, [k]: v });
  const updateSubsidy = (id, field, value) => {
    setData({ ...data, subsidies: data.subsidies.map(s => s.id === id ? { ...s, [field]: value } : s) });
  };
  const addSubsidy = () => {
    const newId = Math.max(0, ...data.subsidies.map(s => s.id)) + 1;
    setData({ ...data, subsidies: [...data.subsidies, { id: newId, name: 'New Source', amount: 0 }] });
  };
  const removeSubsidy = (id) => {
    setData({ ...data, subsidies: data.subsidies.filter(s => s.id !== id) });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div className="lg:col-span-3">
        <Section title="Total Uses" icon={Layers}>
          <NumberInput label="Total Development Cost" prefix="$" value={data.tdc} onChange={up('tdc')} step={10000} hint="from Sale tab" />
        </Section>
        <Section title="Primary Sources">
          <NumberInput label="Supportable Debt" prefix="$" value={data.supportableDebt} onChange={up('supportableDebt')} step={10000} hint="from NOI / sale" />
          <NumberInput label="Developer Equity" prefix="$" value={data.developerEquity} onChange={up('developerEquity')} step={10000} />
        </Section>
        <div className="mb-7">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate">
            <div className="flex items-center gap-2">
              <Layers size={13} className="text-slate-blue" strokeWidth={1.5} />
              <h3 className="text-[10px] font-body font-semibold uppercase tracking-[0.18em] text-navy">Subsidy Stack</h3>
            </div>
            <button onClick={addSubsidy} className="flex items-center gap-1 text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-slate-blue hover:text-navy transition-colors">
              <Plus size={11} strokeWidth={2} /> Add Source
            </button>
          </div>
          <div className="space-y-2">
            {data.subsidies.map(s => (
              <div key={s.id} className="flex items-center gap-2 p-3 bg-white-pure border border-slate-soft rounded">
                <input
                  type="text"
                  value={s.name}
                  onChange={(e) => updateSubsidy(s.id, 'name', e.target.value)}
                  className="flex-1 font-body text-sm text-charcoal outline-none bg-transparent"
                  placeholder="Source name"
                />
                <span className="font-mono text-sm text-charcoal-muted">$</span>
                <input
                  type="number"
                  value={s.amount === 0 ? '' : s.amount}
                  onChange={(e) => updateSubsidy(s.id, 'amount', parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-32 text-right font-mono text-sm text-charcoal outline-none bg-transparent"
                />
                <button onClick={() => removeSubsidy(s.id)} className="text-charcoal-muted hover:text-negative transition-colors">
                  <X size={14} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="lg:col-span-2">
        <div className="lg:sticky lg:top-6 bg-white-pure border border-slate-soft shadow-sm p-6 rounded">
          <div className="mb-5">
            <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Analysis</div>
            <h3 className="font-display text-3xl display-italic text-navy leading-none">Capital Stack</h3>
          </div>
          <Output
            label={results.gap > 0 ? 'Funding Gap' : results.gap < 0 ? 'Surplus' : 'Balanced'}
            value={fmtMoney(Math.abs(results.gap))}
            emphasis
            status={results.gap > 0 ? 'negative' : results.gap < 0 ? 'positive' : undefined}
            sublabel={fmtPct(Math.abs(results.gapPct), 1) + ' of TDC'}
          />
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <Output label="Total Uses (TDC)" value={fmtMoney(data.tdc)} />
            <Output label="Debt" value={fmtMoney(data.supportableDebt)} sublabel={fmtPct(results.debtPct, 1)} />
            <Output label="Equity" value={fmtMoney(data.developerEquity)} sublabel={fmtPct(results.equityPct, 1)} />
            <Output label="Subsidy Total" value={fmtMoney(results.subsidyTotal)} sublabel={fmtPct(results.subsidyPct, 1)} />
            <Output label="Total Sources" value={fmtMoney(results.totalSources)} />
          </div>
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <div className="text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-soft mb-2">Stack Composition</div>
            <div className="h-7 flex overflow-hidden border border-slate-soft rounded-sm">
              {data.tdc > 0 && (
                <>
                  <div className="bg-navy" style={{ width: `${Math.max(0, Math.min(100, results.debtPct * 100))}%` }} title="Debt" />
                  <div className="bg-slate-blue" style={{ width: `${Math.max(0, Math.min(100, results.equityPct * 100))}%` }} title="Equity" />
                  <div className="bg-charcoal" style={{ width: `${Math.max(0, Math.min(100, results.subsidyPct * 100))}%` }} title="Subsidy" />
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3 mt-2 text-[10px] font-body text-charcoal-soft">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-navy inline-block rounded-full"></span>Debt</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-slate-blue inline-block rounded-full"></span>Equity</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-charcoal inline-block rounded-full"></span>Subsidy</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const defaultComp = { holdYears: 5, rentGrowthPct: 3, expenseGrowthPct: 2.5, exitCapPct: 7, saleAppreciationPct: 3 };

const calcComparison = (rent, sale, comp) => {
  const rentResults = calcRent(rent);
  const saleResults = calcSale(sale);
  const saleYearN = saleResults.profit * Math.pow(1 + comp.saleAppreciationPct / 100, comp.holdYears);
  let cumulativeCF = 0;
  let currentNOI = rentResults.noi;
  const annualDS = rentResults.annualDebtService;
  for (let y = 1; y <= comp.holdYears; y++) {
    const yearIncome = rentResults.egi * Math.pow(1 + comp.rentGrowthPct / 100, y - 1);
    const yearOpex = rentResults.opex * Math.pow(1 + comp.expenseGrowthPct / 100, y - 1);
    const yearNOI = yearIncome - yearOpex;
    if (y === comp.holdYears) currentNOI = yearNOI;
    cumulativeCF += yearNOI - annualDS;
  }
  const exitValue = comp.exitCapPct > 0 ? currentNOI / (comp.exitCapPct / 100) : 0;
  const r = rent.ratePct / 100 / 12;
  const monthlyPmt = pmt(rentResults.loanAmt, rent.ratePct / 100, rent.amortYears);
  let balance = rentResults.loanAmt;
  for (let m = 0; m < comp.holdYears * 12 && balance > 0; m++) {
    const interest = balance * r;
    const principal = monthlyPmt - interest;
    balance -= principal;
  }
  const netReversion = exitValue - Math.max(0, balance) - exitValue * 0.06;
  const rentTotalReturn = cumulativeCF + netReversion - rentResults.downPayment;
  const rentEquityMultiple = rentResults.downPayment > 0 ? (cumulativeCF + netReversion) / rentResults.downPayment : 0;
  return { rentResults, saleResults, saleYearN, cumulativeCF, exitValue, loanBalance: Math.max(0, balance), netReversion, rentTotalReturn, rentEquityMultiple, winner: rentTotalReturn > saleResults.profit ? 'rent' : 'sale' };
};

const ComparisonView = ({ rent, sale, comp, setComp, results }) => {
  const up = (k) => (v) => setComp({ ...comp, [k]: v });
  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate">
          <GitCompare size={13} className="text-slate-blue" strokeWidth={1.5} />
          <h3 className="text-[10px] font-body font-semibold uppercase tracking-[0.18em] text-navy">Comparison Assumptions</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <NumberInput label="Hold Period" suffix="years" value={comp.holdYears} onChange={up('holdYears')} step={1} />
          <NumberInput label="Rent Growth" suffix="%/yr" value={comp.rentGrowthPct} onChange={up('rentGrowthPct')} step={0.25} />
          <NumberInput label="Expense Growth" suffix="%/yr" value={comp.expenseGrowthPct} onChange={up('expenseGrowthPct')} step={0.25} />
          <NumberInput label="Exit Cap" suffix="%" value={comp.exitCapPct} onChange={up('exitCapPct')} step={0.25} />
          <NumberInput label="Sale Proceeds Growth" suffix="%/yr" value={comp.saleAppreciationPct} onChange={up('saleAppreciationPct')} step={0.5} />
        </div>
        <p className="text-xs font-body italic text-charcoal-muted mt-3">
          Uses inputs from the For-Rent and For-Sale tabs. Update those tabs to change the underlying deal.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white-pure border border-slate-soft shadow-sm rounded">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-dark">
            <div>
              <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Scenario</div>
              <h3 className="font-display text-3xl display-italic text-navy leading-none">Sell</h3>
            </div>
            {results.winner === 'sale' && <span className="text-[9px] font-body font-semibold uppercase tracking-[0.15em] bg-navy text-cream px-2 py-1 rounded">Higher Return</span>}
          </div>
          <Output label="Year 0 Profit" value={fmtMoney(results.saleResults.profit)} emphasis status={results.saleResults.profit >= 0 ? 'positive' : 'negative'} />
          <Output label="Profit Margin" value={fmtPct(results.saleResults.margin)} />
          <Output label={`Value at Year ${comp.holdYears}`} value={fmtMoney(results.saleYearN)} sublabel="reinvested at assumed growth" />
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <Output label="Total Development Cost" value={fmtMoney(results.saleResults.tdc)} />
            <Output label="Net Sale Proceeds" value={fmtMoney(results.saleResults.netSale)} />
          </div>
        </div>

        <div className="p-6 bg-white-pure border border-slate-soft shadow-sm rounded">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-cream-dark">
            <div>
              <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Scenario</div>
              <h3 className="font-display text-3xl display-italic text-navy leading-none">Hold &amp; Rent</h3>
            </div>
            {results.winner === 'rent' && <span className="text-[9px] font-body font-semibold uppercase tracking-[0.15em] bg-navy text-cream px-2 py-1 rounded">Higher Return</span>}
          </div>
          <Output label={`${comp.holdYears}-Yr Total Return`} value={fmtMoney(results.rentTotalReturn)} emphasis status={results.rentTotalReturn >= 0 ? 'positive' : 'negative'} sublabel="after return of equity" />
          <Output label="Equity Multiple" value={`${fmtNum(results.rentEquityMultiple)}x`} />
          <Output label="Year 1 Cap Rate" value={fmtPct(results.rentResults.capRate)} />
          <div className="mt-5 pt-4 border-t border-cream-dark">
            <Output label="Cumulative Cash Flow" value={fmtMoney(results.cumulativeCF)} />
            <Output label={`Exit Value (${comp.exitCapPct}% cap)`} value={fmtMoney(results.exitValue)} />
            <Output label="Loan Balance at Exit" value={fmtMoney(results.loanBalance)} />
            <Output label="Net Reversion" value={fmtMoney(results.netReversion)} sublabel="after 6% sale costs" />
            <Output label="Equity Invested" value={fmtMoney(results.rentResults.downPayment)} />
          </div>
        </div>
      </div>

      <div className="mt-6 p-5 bg-slate-soft border-l-4 border-navy rounded-r">
        <div className="flex items-start gap-3">
          {results.rentTotalReturn > results.saleResults.profit ? <TrendingUp size={16} className="text-slate-blue mt-0.5" strokeWidth={2} /> : <TrendingDown size={16} className="text-slate-blue mt-0.5" strokeWidth={2} />}
          <div className="text-sm font-body text-charcoal">
            <span className="font-semibold">{results.winner === 'rent' ? 'Hold & rent' : 'Sell'}{' '}</span>
            produces a higher nominal return over {comp.holdYears} years, assuming the inputs above.
            Difference: <span className="font-mono font-semibold">{fmtMoney(Math.abs(results.rentTotalReturn - results.saleResults.profit))}</span>.
            Consider risk, liquidity, and tax treatment separately.
          </div>
        </div>
      </div>
    </div>
  );
};

const EmailCaptureModal = ({ open, onSubmit, onSkip }) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleSubmit = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      setError('Please enter a valid email');
      return;
    }
    setSubmitting(true);
    setError('');

    // Submits to Formspree (endpoint set via VITE_FORMSPREE_ENDPOINT env var)
    // Swap to Mailchimp/ConvertKit/etc. by updating this function.
    const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT;
    try {
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail, name: name.trim(), source: 'Deal Lab' }),
        });
      }
      onSubmit();
    } catch (e) {
      // Fail silently, still let them in — they'll still be captured locally
      onSubmit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 flex items-center justify-center p-4">
      <div className="bg-cream-light border-2 border-navy max-w-md w-full overflow-hidden rounded shadow-2xl">
        <div className="p-6 bg-navy">
          <div className="text-[10px] font-body uppercase tracking-[0.25em] text-slate-blue mb-1">Before you begin</div>
          <h3 className="font-display text-3xl display-italic text-cream leading-none">Stay in the loop</h3>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm font-body text-charcoal leading-relaxed">
            Get occasional updates on new calculators, housing finance insights, and tools from Acosta Development. No spam, unsubscribe anytime.
          </p>
          <div className="space-y-3">
            <label className="block">
              <span className="text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-soft">First Name (optional)</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full px-3 py-2.5 text-sm font-body bg-white-pure border border-slate-soft focus:border-navy outline-none rounded text-charcoal"
                placeholder="Jenifer"
              />
            </label>
            <label className="block">
              <span className="text-[10px] font-body font-semibold uppercase tracking-[0.12em] text-charcoal-soft">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                className="mt-1 w-full px-3 py-2.5 text-sm font-body bg-white-pure border border-slate-soft focus:border-navy outline-none rounded text-charcoal"
                placeholder="you@example.com"
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              {error && <span className="text-xs text-negative mt-1 block">{error}</span>}
            </label>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              onClick={onSkip}
              className="flex-1 py-2.5 font-body font-semibold uppercase tracking-[0.12em] text-[10px] text-charcoal-soft hover:text-navy transition-colors"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="flex-[2] py-2.5 font-body font-semibold uppercase tracking-[0.15em] text-[10px] bg-navy text-cream hover:bg-charcoal transition-colors rounded disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Enter Deal Lab'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const SavedDeals = ({ open, onClose, deals, onLoad, onDelete }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-charcoal/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-cream-light border border-navy max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col rounded shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-slate">
          <div>
            <div className="text-[10px] font-body uppercase tracking-[0.2em] text-slate-blue mb-1">Archive</div>
            <h3 className="font-display text-3xl display-italic text-navy leading-none">Saved Deals</h3>
          </div>
          <button onClick={onClose} className="text-charcoal hover:text-slate-blue transition-colors"><X size={18} strokeWidth={2} /></button>
        </div>
        <div className="overflow-y-auto">
          {deals.length === 0 ? (
            <div className="p-10 text-center font-body italic text-charcoal-muted text-sm">No saved deals yet. Save a deal to see it here.</div>
          ) : (
            deals.map(d => (
              <div key={d.id} className="flex items-center justify-between p-4 border-b border-cream-dark hover:bg-cream transition-colors">
                <div>
                  <div className="font-display text-xl text-navy">{d.name}</div>
                  <div className="text-[10px] font-body italic text-charcoal-muted mt-0.5">
                    {new Date(d.savedAt).toLocaleString()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => onLoad(d)} className="px-3 py-1.5 text-[10px] font-body font-semibold uppercase tracking-[0.12em] bg-navy text-cream hover:bg-charcoal transition-colors rounded">Load</button>
                  <button onClick={() => onDelete(d.id)} className="p-1.5 text-charcoal-muted hover:text-negative transition-colors"><Trash2 size={14} strokeWidth={1.5} /></button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const TermsModal = ({ open, onAccept, viewOnly, onClose }) => {
  const [agreed, setAgreed] = useState(false);
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-charcoal/60 flex items-center justify-center p-4">
      <div className="bg-cream-light border-2 border-navy max-w-2xl w-full max-h-[85vh] overflow-hidden flex flex-col rounded shadow-2xl">
        <div className="p-6 border-b border-slate bg-navy">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-body uppercase tracking-[0.25em] text-slate-blue mb-1">Please Read</div>
              <h3 className="font-display text-3xl display-italic text-cream leading-none">Terms of Use</h3>
            </div>
            {viewOnly && <button onClick={onClose} className="text-cream hover:text-slate-blue transition-colors"><X size={20} strokeWidth={2} /></button>}
          </div>
        </div>

        <div className="overflow-y-auto p-6 font-body text-sm text-charcoal leading-relaxed space-y-4">
          <div className="p-4 bg-slate-soft border-l-4 border-navy rounded-r">
            <p className="font-semibold text-navy mb-1">Educational purpose only.</p>
            <p>This tool is provided for educational and illustrative purposes. It is not professional financial, legal, tax, investment, real estate, or accounting advice. Outputs are estimates based on the inputs you provide.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">No professional relationship</h4>
            <p>Use of this tool does not create any advisor, broker, consultant, or fiduciary relationship between you and Acosta Development or Jenifer Acosta.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Your responsibility</h4>
            <p>You are responsible for verifying all inputs, assumptions, and outputs. Engage licensed professionals (attorneys, CPAs, underwriters, appraisers, real estate brokers) before making any real estate, financing, or investment decision.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">No warranty</h4>
            <p>This tool is provided "as is" without warranty of any kind. We do not guarantee accuracy, completeness, or fitness for any purpose.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Limitation of liability</h4>
            <p>To the maximum extent permitted by law, Acosta Development is not liable for any damages, losses, or costs arising from your use of this tool, including lost profits, failed deals, or investment outcomes.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Intellectual property</h4>
            <p>The tool, its code, design, and content are owned by Acosta Development. You may not copy, redistribute, or resell it without written permission.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Governing law</h4>
            <p>These terms are governed by the laws of the State of Michigan. Any disputes will be resolved in Midland County, Michigan.</p>
          </div>

          <div>
            <h4 className="font-display text-xl text-navy mb-1">Changes</h4>
            <p>We may update these terms at any time. Continued use means you accept the changes.</p>
          </div>

          <div className="pt-2 border-t border-cream-dark text-xs italic text-charcoal-muted">
            Last updated: April 2026. Questions: contact Acosta Development.
          </div>
        </div>

        {!viewOnly && (
          <div className="p-5 border-t border-slate bg-cream-light">
            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[#434A60]"
              />
              <span className="text-sm font-body text-charcoal">
                I have read and agree to the Terms of Use. I understand this tool is for educational purposes and I will consult licensed professionals before making financial decisions.
              </span>
            </label>
            <button
              onClick={onAccept}
              disabled={!agreed}
              className={`w-full py-3 font-body font-semibold uppercase tracking-[0.15em] text-sm rounded transition-all ${agreed ? 'bg-navy text-cream hover:bg-charcoal shadow-md' : 'bg-slate-soft text-charcoal-muted cursor-not-allowed'}`}
            >
              Accept &amp; Continue
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default function HousingFinanceApp() {
  const [tab, setTab] = useState('rent');
  const [rent, setRent] = useState(defaultRent);
  const [sale, setSale] = useState(defaultSale);
  const [gap, setGap] = useState(defaultGap);
  const [comp, setComp] = useState(defaultComp);
  const [deals, setDeals] = useState([]);
  const [showDeals, setShowDeals] = useState(false);
  const [dealName, setDealName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(null);
  const [emailCaptured, setEmailCaptured] = useState(null);
  const [showTermsView, setShowTermsView] = useState(false);

  const rentResults = useMemo(() => calcRent(rent), [rent]);
  const saleResults = useMemo(() => calcSale(sale), [sale]);
  const gapResults = useMemo(() => calcGap(gap), [gap]);
  const compResults = useMemo(() => calcComparison(rent, sale, comp), [rent, sale, comp]);

  useEffect(() => {
    try {
      const storedDeals = localStorage.getItem('dealLab:deals');
      const storedTerms = localStorage.getItem('dealLab:termsAccepted');
      const storedEmail = localStorage.getItem('dealLab:emailCaptured');
      if (storedDeals) {
        try { setDeals(JSON.parse(storedDeals)); } catch (e) { /* noop */ }
      }
      setTermsAccepted(storedTerms === 'true');
      setEmailCaptured(storedEmail === 'true');
    } catch (e) {
      setTermsAccepted(false);
      setEmailCaptured(false);
    }
  }, []);

  const acceptTerms = () => {
    setTermsAccepted(true);
    try { localStorage.setItem('dealLab:termsAccepted', 'true'); } catch (e) { /* noop */ }
  };

  const saveDeal = () => {
    if (!dealName.trim()) {
      setSaveStatus('Enter a deal name');
      setTimeout(() => setSaveStatus(''), 2000);
      return;
    }
    const newDeal = { id: Date.now().toString(), name: dealName.trim(), savedAt: new Date().toISOString(), rent, sale, gap, comp };
    const newDeals = [newDeal, ...deals];
    setDeals(newDeals);
    setDealName('');
    setSaveStatus('Saved');
    setTimeout(() => setSaveStatus(''), 2000);
    try { localStorage.setItem('dealLab:deals', JSON.stringify(newDeals)); } catch (e) { /* noop */ }
  };

  const loadDeal = (deal) => {
    if (deal.rent) setRent(deal.rent);
    if (deal.sale) setSale(deal.sale);
    if (deal.gap) setGap(deal.gap);
    if (deal.comp) setComp(deal.comp);
    setDealName(deal.name);
    setShowDeals(false);
  };

  const deleteDeal = (id) => {
    const newDeals = deals.filter(d => d.id !== id);
    setDeals(newDeals);
    try { localStorage.setItem('dealLab:deals', JSON.stringify(newDeals)); } catch (e) { /* noop */ }
  };

  const tabs = [
    { id: 'rent', label: 'For Rent', icon: Home },
    { id: 'sale', label: 'For Sale', icon: Building2 },
    { id: 'gap', label: 'Gap Financing', icon: Layers },
    { id: 'compare', label: 'Rent vs Sale', icon: GitCompare },
  ];

  useEffect(() => {
    if (saleResults.tdc > 0 && gap.tdc === 0) {
      setGap(g => ({ ...g, tdc: saleResults.tdc }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saleResults.tdc]);

  if (termsAccepted === null || emailCaptured === null) {
    return (
      <div className="paper-bg min-h-screen flex items-center justify-center">
        <GlobalStyles />
        <div className="font-display display-italic text-2xl text-navy">Loading...</div>
      </div>
    );
  }

  return (
    <div className="paper-bg min-h-screen font-body text-charcoal">
      <GlobalStyles />

      <header className="bg-navy">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row md:items-end md:justify-between gap-5">
          <div>
            <div className="text-[10px] font-body uppercase tracking-[0.3em] text-slate-blue mb-2">Acosta Development</div>
            <h1 className="font-display text-5xl md:text-6xl text-cream leading-none">
              <span className="display-italic">Deal</span> <span>Lab</span>
            </h1>
            <div className="text-xs font-body italic text-slate-blue mt-3 tracking-wide">
              Housing finance calculators for sale, rent, and gap analysis.
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <input
              type="text"
              value={dealName}
              onChange={(e) => setDealName(e.target.value)}
              placeholder="Deal name"
              className="px-3 py-2 text-sm font-body bg-cream-light border border-slate-soft focus:border-navy outline-none transition-colors rounded text-charcoal"
            />
            <button onClick={saveDeal} className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-body font-semibold uppercase tracking-[0.15em] bg-cream text-navy hover:bg-white-pure transition-colors rounded shadow-sm">
              <Save size={12} strokeWidth={2} /> {saveStatus || 'Save'}
            </button>
            <button onClick={() => setShowDeals(true)} className="flex items-center gap-1.5 px-4 py-2 text-[10px] font-body font-semibold uppercase tracking-[0.15em] border border-cream text-cream hover:bg-cream hover:text-navy transition-colors rounded">
              <FolderOpen size={12} strokeWidth={2} /> Load
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate bg-cream-light sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex overflow-x-auto">
          {tabs.map(t => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-2 px-4 md:px-6 py-4 text-[10px] font-body font-semibold uppercase tracking-[0.18em] border-b-2 transition-all whitespace-nowrap ${active ? 'border-navy text-navy' : 'border-transparent text-charcoal-soft hover:text-navy'}`}
              >
                <Icon size={13} strokeWidth={1.5} />
                {t.label}
              </button>
            );
          })}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {tab === 'rent' && <RentCalculator data={rent} setData={setRent} results={rentResults} />}
        {tab === 'sale' && <SaleCalculator data={sale} setData={setSale} results={saleResults} />}
        {tab === 'gap' && <GapCalculator data={gap} setData={setGap} results={gapResults} />}
        {tab === 'compare' && <ComparisonView rent={rent} sale={sale} comp={comp} setComp={setComp} results={compResults} />}
      </main>

      <footer className="border-t border-slate bg-cream-light mt-12">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[10px] font-body italic text-charcoal-muted">
            <span>© Acosta Development</span>
            <span className="hidden md:inline text-slate-blue">•</span>
            <span>For educational purposes only. Validate with full underwriting.</span>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setShowTermsView(true)} className="flex items-center gap-1 text-[10px] font-body font-semibold uppercase tracking-[0.15em] text-navy hover:text-slate-blue transition-colors">
              <FileText size={11} strokeWidth={1.5} /> Terms of Use
            </button>
            <span className="text-[10px] font-body text-charcoal-muted">v1.0</span>
          </div>
        </div>
      </footer>

      <SavedDeals open={showDeals} onClose={() => setShowDeals(false)} deals={deals} onLoad={loadDeal} onDelete={deleteDeal} />
      <TermsModal open={!termsAccepted} onAccept={acceptTerms} />
      <TermsModal open={showTermsView} viewOnly onClose={() => setShowTermsView(false)} />
      <EmailCaptureModal
        open={termsAccepted && !emailCaptured}
        onSubmit={() => {
          setEmailCaptured(true);
          try { localStorage.setItem('dealLab:emailCaptured', 'true'); } catch (e) { /* noop */ }
        }}
        onSkip={() => {
          setEmailCaptured(true);
          try { localStorage.setItem('dealLab:emailCaptured', 'skipped'); } catch (e) { /* noop */ }
        }}
      />
    </div>
  );
}
